import { createClient } from "@supabase/supabase-js";

function createSupabaseClient(key) {
  const url = process.env.SUPABASE_URL;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function authorize(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return { response: Response.json({ error: "Profile service is not configured." }, { status: 503 }) };
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return { response: Response.json({ error: "Authentication required." }, { status: 401 }) };

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return { response: Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 }) };
  }
  return { serviceClient, user: data.user };
}

export async function GET(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const { data, error } = await auth.serviceClient
    .from("profiles")
    .select("id, email, first_name, last_name, phone, country, country_code, currency")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) {
    console.error("Unable to load customer profile:", error.message);
    return Response.json({ error: "Unable to load your profile." }, { status: 500 });
  }
  if (!data) return Response.json({ error: "Customer profile not found." }, { status: 404 });

  return Response.json({
    data: {
      id: data.id,
      email: data.email || auth.user.email || "",
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      phone: data.phone || "",
      country: data.country || "",
      countryCode: data.country_code || "",
      currency: String(data.currency || "USD").toUpperCase(),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Submit valid profile details." }, { status: 400 });
  }

  const fields = {
    first_name: body?.firstName,
    last_name: body?.lastName,
    phone: body?.phone,
    country: body?.country,
    country_code: body?.countryCode,
    currency: body?.currency,
  };
  const limits = {
    first_name: 80,
    last_name: 80,
    phone: 40,
    country: 100,
    country_code: 8,
    currency: 3,
  };
  const update = {};
  for (const [column, value] of Object.entries(fields)) {
    if (typeof value !== "string") {
      return Response.json({ error: "Complete all profile fields with valid text." }, { status: 400 });
    }
    const normalized = value.trim();
    if (!normalized || normalized.length > limits[column]) {
      return Response.json({ error: `Enter a valid ${column.replace("_", " ")}.` }, { status: 400 });
    }
    update[column] = normalized;
  }
  update.currency = update.currency.toUpperCase();
  if (!["USD", "EUR", "GBP"].includes(update.currency)) {
    return Response.json({ error: "Choose USD, EUR, or GBP as your main currency." }, { status: 400 });
  }

  const { data, error } = await auth.serviceClient
    .from("profiles")
    .update(update)
    .eq("id", auth.user.id)
    .select("id, email, first_name, last_name, phone, country, country_code, currency")
    .maybeSingle();
  if (error) {
    console.error("Unable to update customer profile:", error.message);
    return Response.json({ error: "Unable to save your profile." }, { status: 500 });
  }
  if (!data) return Response.json({ error: "Customer profile not found." }, { status: 404 });

  return Response.json({
    data: {
      id: data.id,
      email: data.email || auth.user.email || "",
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      phone: data.phone || "",
      country: data.country || "",
      countryCode: data.country_code || "",
      currency: String(data.currency || "USD").toUpperCase(),
    },
  });
}
