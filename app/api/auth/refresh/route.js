import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  try {
    const { refreshToken } = await request.json();
    if (!refreshToken || typeof refreshToken !== "string") {
      return Response.json({ error: "A valid refresh token is required." }, { status: 400 });
    }

    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session || !data.user) {
      return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    return Response.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name || "",
        lastName: data.user.user_metadata?.last_name || "",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to refresh your session." },
      { status: 400 },
    );
  }
}
