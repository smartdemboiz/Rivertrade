import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const bucketName = "kyc-documents";
const maxFileSize = 8 * 1024 * 1024;
const allowedTypes = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

async function getAuthenticatedUser(request) {
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);

  if (!authClient) {
    return { error: Response.json({ error: "KYC verification is not configured." }, { status: 503 }) };
  }
  if (!accessToken) {
    return { error: Response.json({ error: "Sign in to manage identity verification." }, { status: 401 }) };
  }

  const { data, error } = await authClient.auth.getUser(accessToken);
  if (error || !data.user) {
    return { error: Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 }) };
  }
  if (!data.user.email_confirmed_at) {
    return { error: Response.json({ error: "Verify your email address before submitting identity documents." }, { status: 403 }) };
  }

  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!serviceClient) {
    return { error: Response.json({ error: "KYC document storage is not configured." }, { status: 503 }) };
  }

  return { user: data.user, serviceClient };
}

async function getLatestSubmission(serviceClient, userId) {
  const { data, error } = await serviceClient
    .from("kyc")
    .select("id, document_type, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to load your verification status.");
  return data;
}

export async function GET(request) {
  const authorization = await getAuthenticatedUser(request);
  if (authorization.error) return authorization.error;

  try {
    const submission = await getLatestSubmission(authorization.serviceClient, authorization.user.id);
    return Response.json(
      {
        data: submission
        ? {
            status: submission.status || "pending",
            documentType: submission.document_type || "",
            submittedAt: submission.created_at || null,
          }
        : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Unable to load verification status." }, { status: 500 });
  }
}

async function ensurePrivateBucket(serviceClient) {
  const { data, error } = await serviceClient.storage.getBucket(bucketName);
  if (!error && data) {
    if (data.public) throw new Error("The KYC document bucket must be private.");
    return;
  }

  if (error && error.statusCode !== "404" && !/not found/i.test(error.message || "")) {
    throw new Error(error.message || "Unable to check KYC document storage.");
  }

  const { error: createError } = await serviceClient.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: maxFileSize,
    allowedMimeTypes: Object.keys(allowedTypes),
  });
  if (createError && createError.statusCode !== "409") {
    throw new Error(createError.message || "Unable to create private KYC document storage.");
  }
}

export async function POST(request) {
  const authorization = await getAuthenticatedUser(request);
  if (authorization.error) return authorization.error;

  let uploadedPath = "";
  try {
    const form = await request.formData();
    const fullName = String(form.get("fullName") || "").trim();
    const country = String(form.get("country") || "").trim();
    const documentType = String(form.get("documentType") || "").trim();
    const confirmed = form.get("confirmed") === "true";
    const document = form.get("document");

    if (fullName.length < 2 || fullName.length > 120) {
      return Response.json({ error: "Enter your full legal name as shown on your identity document." }, { status: 400 });
    }
    if (country.length < 2 || country.length > 100) {
      return Response.json({ error: "Enter the country that issued your identity document." }, { status: 400 });
    }
    if (!["Passport", "National ID", "Driver license"].includes(documentType)) {
      return Response.json({ error: "Choose a supported identity document type." }, { status: 400 });
    }
    if (!confirmed) {
      return Response.json({ error: "Confirm that the information is accurate before submitting." }, { status: 400 });
    }
    if (!document || typeof document.arrayBuffer !== "function") {
      return Response.json({ error: "Upload a clear photo or PDF of your identity document." }, { status: 400 });
    }
    if (document.size <= 0 || document.size > maxFileSize) {
      return Response.json({ error: "The identity document must be no larger than 8 MB." }, { status: 400 });
    }
    const extension = allowedTypes[document.type];
    if (!extension) {
      return Response.json({ error: "Upload a PDF, JPEG, PNG, or WebP document." }, { status: 400 });
    }

    const { serviceClient, user } = authorization;
    const latest = await getLatestSubmission(serviceClient, user.id);
    if (latest && latest.status !== "rejected") {
      return Response.json({
        error: latest.status === "approved"
          ? "Your identity is already verified."
          : "Your identity verification is already being reviewed.",
        data: {
          status: latest.status || "pending",
          documentType: latest.document_type || "",
          submittedAt: latest.created_at || null,
        },
      }, { status: 409 });
    }

    await ensurePrivateBucket(serviceClient);
    uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .upload(uploadedPath, Buffer.from(await document.arrayBuffer()), {
        contentType: document.type,
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message || "Unable to upload your identity document.");

    const notes = JSON.stringify({
      fullName,
      country,
      documentPath: uploadedPath,
      submittedAt: new Date().toISOString(),
    });
    const { data, error } = await serviceClient
      .from("kyc")
      .insert({
        user_id: user.id,
        document_type: documentType,
        status: "pending",
        notes,
      })
      .select("document_type, status, created_at")
      .single();

    if (error) throw new Error(error.message || "Unable to save your verification request.");

    return Response.json({
      data: {
        status: data.status || "pending",
        documentType: data.document_type || documentType,
        submittedAt: data.created_at || null,
      },
    }, { status: 201 });
  } catch (error) {
    if (uploadedPath) {
      const { error: removeError } = await authorization.serviceClient.storage.from(bucketName).remove([uploadedPath]);
      if (removeError) console.error("Unable to remove an orphaned KYC document:", removeError.message);
    }
    return Response.json({ error: error.message || "Unable to submit identity verification." }, { status: 500 });
  }
}
