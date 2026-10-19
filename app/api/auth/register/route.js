import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/crypto-swap/lib/server/redis.js";
import { getSupabaseClient, logAdminEvent } from "../../admin/helpers";

const getSupabaseAuthConfig = () => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase auth is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  return { url, anonKey };
};

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = await rateLimit(`rate:register:${ip}`, 5, 3600);
    if (!limit.allowed) {
      return Response.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { firstName, lastName, email, password, country, countryCode, phone, currency } = body;

    if (!firstName || !lastName) {
      return Response.json({ error: "First name and last name are required" }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!password || String(password).length < 6) {
      return Response.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    if (!country || !countryCode || !phone) {
      return Response.json({ error: "Country, country code, and phone are required" }, { status: 400 });
    }

    const referralCode = typeof body.referralCode === "string"
      ? body.referralCode.trim().toUpperCase()
      : "";
    if (referralCode && (referralCode.length > 32 || !/^[A-Z0-9-]+$/.test(referralCode))) {
      return Response.json({ error: "Enter a valid referral code." }, { status: 400 });
    }

    try {
      const { url, anonKey } = getSupabaseAuthConfig();
      const serviceClient = getSupabaseClient();
      if (referralCode) {
        if (!serviceClient) {
          return Response.json({ error: "Referral signup is temporarily unavailable. Try again without a referral code." }, { status: 503 });
        }
        const { data: referral, error: referralError } = await serviceClient
          .from("referrals")
          .select("user_id")
          .eq("code", referralCode)
          .eq("status", "active")
          .maybeSingle();
        if (referralError) throw new Error(referralError.message || "Unable to validate the referral code.");
        if (!referral) return Response.json({ error: "This referral code is invalid or inactive." }, { status: 400 });
      }

      const supabase = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: new URL("/auth/callback", request.url).toString(),
          data: {
            first_name: firstName,
            last_name: lastName,
            country,
            country_code: countryCode,
            phone,
            currency: currency || "USD",
            referral_code: referralCode || null,
          },
        },
      });

      if (error) {
        return Response.json(
          { error: error.message || "Registration failed" },
          { status: 400 },
        );
      }

      let referralLinked = !referralCode;
      if (data?.user?.id && serviceClient) {
        const { error: profileError } = await serviceClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: data.user.email || email,
            first_name: firstName,
            last_name: lastName,
            country,
            country_code: countryCode,
            phone,
            currency: currency || "USD",
          }, { onConflict: "id" });
        if (profileError) {
          console.error("Signup succeeded but the customer profile could not be synchronized:", profileError.message);
        } else if (referralCode) {
          const { error: attributionError } = await serviceClient.rpc("record_customer_referral_signup", {
            p_customer_id: data.user.id,
            p_referral_code: referralCode,
          });
          if (attributionError) {
            console.error("Signup succeeded but referral attribution could not be recorded:", attributionError.message);
          } else {
            referralLinked = true;
          }
        }
      }

      if (data?.user?.id) {
        await logAdminEvent({ userId: null, action: "create", section: "customers", recordId: data.user.id });
      }

      const emailVerified = Boolean(data?.user?.email_confirmed_at);

      return Response.json({
        message: emailVerified ? "Registration successful" : "Registration successful. Check your email to verify your account.",
        emailVerified,
        requiresEmailVerification: !emailVerified,
        referralLinked,
        token: data?.session?.access_token || null,
        refreshToken: data?.session?.refresh_token || null,
        expiresAt: data?.session?.expires_at || null,
        user: {
          id: data?.user?.id || null,
          firstName,
          lastName,
          email,
          country,
          countryCode,
          phone,
          currency: currency || "USD",
        },
      }, { status: 201 });
    } catch (supabaseError) {
      return Response.json(
        {
          error: "Supabase auth registration is unavailable",
          details: supabaseError?.message || "Unknown Supabase registration error",
          hint: "Check SUPABASE_URL, SUPABASE_ANON_KEY, email signup settings, and project connectivity.",
        },
        { status: 503 },
      );
    }
  } catch (error) {
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
