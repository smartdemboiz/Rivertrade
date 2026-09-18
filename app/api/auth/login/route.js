import { createClient } from "@supabase/supabase-js";

const getSupabaseAuthConfig = () => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase auth is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  return { url, anonKey };
};

const buildDemoLoginResponse = (email) => ({
  message: "Login successful",
  token: `demo-token-${Math.random().toString(36).slice(2, 10)}`,
  user: {
    id: "demo-user-1",
    email,
    firstName: "Demo",
    lastName: "User",
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
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

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return Response.json(
          { error: error.message || "Invalid login credentials" },
          { status: 401 },
        );
      }

      const user = data.user || {};

      if (!user.email_confirmed_at) {
        return Response.json(
          { error: "Please verify your email address before signing in.", requiresEmailVerification: true },
          { status: 403 },
        );
      }

      return Response.json({
        message: "Login successful",
        token: data.session?.access_token || null,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
        },
      });
    } catch (supabaseError) {
      return Response.json(
        {
          error: "Supabase auth is unavailable",
          details: supabaseError?.message || "Unknown Supabase auth error",
          hint: "Check SUPABASE_URL, SUPABASE_ANON_KEY, and that the project is active.",
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
