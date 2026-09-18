"use client";

import { useState } from "react";
import { Clock3, Headphones, Mail, Phone, Send } from "lucide-react";

const supportDetails = [
  [Mail, "Email", "support@rivertrade.com"],
  [Headphones, "Live Chat", "Available 24/7"],
  [Phone, "Phone", "+1 (800) 123-4567"],
  [Clock3, "Response Time", "Within 24 hours"],
];

export default function DashboardSupport() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = (event) => {
    event.preventDefault();
    setSubmitted(true);
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
            <option value="account">Account Support</option>
            <option value="technical">Technical Support</option>
            <option value="deposit">Deposit Question</option>
            <option value="withdrawal">Withdrawal Question</option>
          </select>
          <label htmlFor="support-message">Message</label>
          <textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe your issue..." rows="6" required />
          <label htmlFor="support-attachment">Attachment (optional)</label>
          <input id="support-attachment" type="file" accept="image/*,.pdf,.txt,.doc,.docx" />
          <button className="dashboard-support-submit" type="submit"><Send size={17} />Submit Ticket</button>
          {submitted && <p className="dashboard-support-success" role="status">Your support ticket has been submitted. Our team will respond within 24 hours.</p>}
        </form>

        <aside className="dashboard-support-info">
          <h3>Support Information</h3>
          {supportDetails.map(([Icon, title, value]) => (
            <div className="dashboard-support-info-card" key={title}>
              <Icon size={19} />
              <div><strong>{title}</strong><span>{value}</span></div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
