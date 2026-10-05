import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  try {
    const { accessToken } = await request.json();
    if (!accessToken || typeof accessToken !== "string") {
      return Response.json({ error: "A valid access token is required." }, { status: 400 });
    }

    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return Response.json({ error: "The email confirmation link is invalid or expired." }, { status: 401 });
    }

    return Response.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name || "",
        lastName: data.user.user_metadata?.last_name || "",
      },
    });
  } catch {
    return Response.json({ error: "Unable to verify the email confirmation session." }, { status: 400 });
  }
}