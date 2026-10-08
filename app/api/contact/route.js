import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, rateLimitResponse } from "@/crypto-swap/lib/server/rate-limit.js";

export const runtime = "nodejs";

const allowedSubjects = new Set([
  "General Inquiry",
  "Account Support",
  "Technical Support",
  "Withdrawal Question",
]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createServiceClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function sendTicketNotification(ticket) {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;
  const emailTo = process.env.SUPPORT_EMAIL || process.env.EMAIL_TO;
  if (!RESEND_API_KEY || !EMAIL_FROM || !emailTo) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [emailTo],
      reply_to: ticket.email,
      subject: `Support ticket: ${ticket.subject}`,
      text: [
        `Ticket ID: ${ticket.id}`,
        `From: ${ticket.name} <${ticket.email}>`,
        `Subject: ${ticket.subject}`,
        "",
        ticket.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Email provider returned ${response.status}: ${responseText.slice(0, 300)}`);
  }

  return true;
}

export async function POST(request) {
  let rateLimit;
  try {
    rateLimit = await checkRateLimit(request, null, 5, 15 * 60 * 1000);
  } catch (error) {
    console.error("Contact form rate limiter failed:", error.message);
    return Response.json({ error: "Support requests are temporarily unavailable. Please email support@rivertrade.com." }, { status: 503 });
  }

  if (rateLimit.unavailable) {
    return Response.json({ error: "Support requests are temporarily unavailable. Please email support@rivertrade.com." }, { status: 503 });
  }
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.resetTime);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Submit a valid support request." }, { status: 400 });
  }

  if (text(body?.website)) {
    return Response.json({ error: "Unable to submit this request." }, { status: 400 });
  }

  const ticket = {
    name: text(body?.name),
    email: text(body?.email).toLowerCase(),
    subject: text(body?.subject),
    message: text(body?.message),
  };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (ticket.name.length < 2 || ticket.name.length > 120) {
    return Response.json({ error: "Enter a name between 2 and 120 characters." }, { status: 400 });
  }
  if (ticket.email.length > 254 || !emailPattern.test(ticket.email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!allowedSubjects.has(ticket.subject)) {
    return Response.json({ error: "Choose a valid support topic." }, { status: 400 });
  }
  if (ticket.message.length < 10 || ticket.message.length > 5000) {
    return Response.json({ error: "Your message must be between 10 and 5,000 characters." }, { status: 400 });
  }
  if (body?.privacyConsent !== true) {
    return Response.json({ error: "Accept the privacy notice before sending your request." }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return Response.json({ error: "Support ticket storage is not configured. Please email support@rivertrade.com." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({ ...ticket, status: "open", priority: "medium" })
      .select("id")
      .single();

    if (error) {
      console.error("Unable to save support ticket:", error.message);
      return Response.json({ error: "We could not save your support request. Please try again or email support@rivertrade.com." }, { status: 503 });
    }

    let notificationSent = false;
    try {
      notificationSent = await sendTicketNotification({ ...ticket, id: data.id });
      if (!notificationSent) console.error("Support ticket saved without email notification: Resend or support email settings are missing.");
    } catch (notificationError) {
      console.error("Support ticket saved, but email notification failed:", notificationError.message);
    }

    return Response.json({ ticketId: data.id, notificationSent }, { status: 201 });
  } catch (error) {
    console.error("Contact form request failed:", error.message);
    return Response.json({ error: "We could not save your support request. Please try again or email support@rivertrade.com." }, { status: 500 });
  }
}
