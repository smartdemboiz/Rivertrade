import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/crypto-swap/lib/server/redis.js";

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

    try {
      const { url, anonKey } = getSupabaseAuthConfig();
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
          data: {
            first_name: firstName,
            last_name: lastName,
            country,
            country_code: countryCode,
            phone,
            currency: currency || "USD",
          },
        },
      });

      if (error) {
        return Response.json(
          { error: error.message || "Registration failed" },
          { status: 400 },
        );
      }

      const emailVerified = Boolean(data?.user?.email_confirmed_at);

      return Response.json({
        message: emailVerified ? "Registration successful" : "Registration successful. Check your email to verify your account.",
        emailVerified,
        requiresEmailVerification: !emailVerified,
        token: data?.session?.access_token || null,
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
