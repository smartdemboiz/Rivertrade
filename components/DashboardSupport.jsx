"use client";

import { useState } from "react";
import { Clock3, Mail, Send } from "lucide-react";
import { getAuthToken, useAuthSession } from "@/hooks/useAuthSession";

const supportDetails = [
  [Mail, "Email", "support@rivertrade.com"],
  [Clock3, "Response time", "Within 24 hours"],
];

export default function DashboardSupport() {
  const { user } = useAuthSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  const submitTicket = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setTicketId("");
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Sign in before submitting a support request.");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
          email: user?.email,
          subject,
          message,
          privacyConsent: true,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to submit your support request.");
      setTicketId(body.ticketId || "submitted");
      setSubject("");
      setMessage("");
    } catch (submitError) {
      setError(submitError.message || "Unable to submit your support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="dashboard-support" aria-labelledby="dashboard-support-title">
      <h2 id="dashboard-support-title">Contact Support</h2>
      <div className="dashboard-support-grid">
        <form className="dashboard-support-form" onSubmit={submitTicket}>
          <h3><Send size={19} />Send us a Message</h3>
          <label htmlFor="support-subject">Subject</label>
          <select id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} required>
            <option value="">-- Select Subject --</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Account Support">Account Support</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Deposit Question">Deposit Question</option>
            <option value="Withdrawal Question">Withdrawal Question</option>
          </select>
          <label htmlFor="support-message">Message</label>
          <textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe your issue..." rows="6" minLength={10} maxLength={5000} required />
          {error && <p className="dashboard-deposit-error" role="alert">{error}</p>}
          {ticketId && <p className="dashboard-support-success" role="status">Your support ticket was saved. Our team will respond within 24 hours.</p>}
          <button className="dashboard-support-submit" type="submit" disabled={submitting}>
            <Send size={17} />{submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>

        <aside className="dashboard-support-info">
          <h3>Support Information</h3>
          {supportDetails.map(([Icon, title, value]) => (
            <div className="dashboard-support-info-card" key={title}>
              <Icon size={19} />
              <div>
                <strong>{title}</strong>
                {title === "Email" ? <a href={`mailto:${value}`}>{value}</a> : <span>{value}</span>}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
