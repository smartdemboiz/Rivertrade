"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Headphones, Mail, Ticket, HelpCircle, ChevronDown, Send, UserRound, Phone, Globe2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const supportOptions = [
	{ icon: Headphones, title: "Live Support", text: "Chat with our support team on WhatsApp.", action: "Start Chat", href: "https://wa.me/447735830736?text=Hello%2C%20I%20need%20support.", external: true },
	{ icon: Mail, title: "Email Us", text: "Send us an email and we will reply within 24 hours.", action: "Send Email", href: "mailto:support@rivertrade.com" },
	{ icon: Ticket, title: "Submit Ticket", text: "Send a request to our support team.", action: "Open Ticket", href: "#contact-form" },
];

const faqs = [
	["How do I create an account?", "Use Sign up to register, then verify your email address. You can complete identity verification from the dashboard."],
	["Is my data secure?", "Identity documents are uploaded to private storage and are available to authorized staff for verification."],
	["What payment methods do you accept?", "Available deposit and withdrawal methods are shown in your account when you start a transaction."],
	["How long does withdrawal take?", "Processing time depends on the selected payout method and any required account review."],
	["How can I contact support?", "Message our support team on WhatsApp, email support@rivertrade.com, or submit the support form on this page."],
];

export default function ContactPage() {
	const [submitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState(null);

	async function submitTicket(event) {
		event.preventDefault();
		if (submitting) return;

		const form = event.currentTarget;
		const formData = new FormData(form);
		setSubmitting(true);
		setFeedback(null);

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.get("name"),
					email: formData.get("email"),
					subject: formData.get("subject"),
					message: formData.get("message"),
					privacyConsent: formData.get("privacyConsent") === "on",
					website: formData.get("website"),
				}),
			});
			const result = await response.json();

			if (!response.ok) throw new Error(result.error || "Unable to submit your support request.");
			form.reset();
			setFeedback({
				type: "success",
				text: result.notificationSent
					? `Your support request was saved and sent to our team. Reference: ${result.ticketId}.`
					: `Your support request was saved. Reference: ${result.ticketId}. For urgent help, email support@rivertrade.com.`,
			});
		} catch (error) {
			setFeedback({ type: "error", text: error.message || "Unable to submit your support request. Please try again." });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<>
			<SiteHeader />
			<main className="contact-reference-page">
				<section className="contact-hero">
					<span className="contact-eyebrow">We&apos;re Here For You</span>
					<h1>Get In <strong>Touch</strong></h1>
					<p>Have questions or need assistance? Contact us by WhatsApp, email, or support ticket.</p>
				</section>

				<section className="message-section">
					<form id="contact-form" className="message-form" onSubmit={submitTicket}>
						<h2><Send size={24} />Send Us a Message</h2>
						<div className="message-form-row">
							<label>
								Your Name
								<span className="input-with-icon"><UserRound size={18} /><input name="name" autoComplete="name" maxLength={120} placeholder="John Doe" required /></span>
							</label>
							<label>
								Email Address
								<span className="input-with-icon"><Mail size={18} /><input name="email" type="email" autoComplete="email" maxLength={254} placeholder="your@email.com" required /></span>
							</label>
						</div>
						<label>
							Subject
							<select name="subject" defaultValue="General Inquiry" required>
								<option>General Inquiry</option>
								<option>Account Support</option>
								<option>Technical Support</option>
								<option>Withdrawal Question</option>
							</select>
						</label>
						<label>
							Your Message
							<textarea name="message" rows="7" minLength={10} maxLength={5000} placeholder="How can we help you?" required />
						</label>
						<label className="privacy-check">
							<input name="privacyConsent" type="checkbox" required />
							<span>I agree to the Privacy Policy and consent to processing my data.</span>
						</label>
						<div className="contact-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
						{feedback && <p className={`contact-feedback ${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</p>}
						<button className="message-submit" type="submit" disabled={submitting}><Send size={18} />{submitting ? "Submitting..." : "Send Message"}</button>
					</form>

					<aside className="contact-side-panels">
						<section className="contact-info-panel">
							<h2><HelpCircle size={21} />Contact Information</h2>
							<div className="contact-info-item"><span><Mail size={20} /></span><div><strong>Email</strong><p><a href="mailto:support@rivertrade.com">support@rivertrade.com</a></p></div></div>
							<div className="contact-info-item"><span><Phone size={20} /></span><div><strong>Phone</strong><p><a href="tel:+447735830736">+447735830736</a><br />Mon–Fri, 9AM–6PM UTC</p></div></div>
							<div className="contact-info-item"><span><Headphones size={20} /></span><div><strong>Support</strong><p>Contact us by WhatsApp, email, or support ticket.</p></div></div>
						</section>

						<section className="connect-panel">
							<h2><Globe2 size={21} />Connect With Us</h2>
							<div className="social-links">
								<a href="https://wa.me/447735830736?text=Hello%2C%20I%20need%20support." target="_blank" rel="noreferrer"><FaWhatsapp size={19} /><span>WhatsApp Support</span></a>
							</div>
						</section>
					</aside>
				</section>

				<section className="support-options" aria-label="Contact options">
					{supportOptions.map(({ icon: Icon, title, text, action, href, external }) => (
						<article className="support-card" key={title}>
							<div className="support-icon"><Icon size={28} /></div>
							<h2>{title}</h2>
							<p>{text}</p>
							<a className="support-card-action" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{action}</a>
						</article>
					))}
				</section>

				<section className="faq-section">
					<h2><span><HelpCircle size={26} /></span>Frequently Asked <strong>Questions</strong></h2>
					<div className="faq-grid">
						{faqs.map(([question, answer]) => (
							<details key={question} className="faq-item">
								<summary>{question}<ChevronDown size={20} /></summary>
								<p>{answer}</p>
							</details>
						))}
					</div>
				</section>
			</main>
		</>
	);
}
