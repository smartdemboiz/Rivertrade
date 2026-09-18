"use client";

import SiteHeader from "@/components/SiteHeader";
import { Headphones, Mail, MessageSquare, Ticket, HelpCircle, ChevronDown, Send, UserRound, Phone, Globe2 } from "lucide-react";
import { FaTelegramPlane, FaTwitter, FaWhatsapp } from "react-icons/fa";

const supportOptions = [
	{ icon: Headphones, title: "Live Support", text: "Chat with an agent instantly.", action: "Start Chat" },
	{ icon: Mail, title: "Email Us", text: "We reply within 24 hours.", action: "Send Email" },
	{ icon: Ticket, title: "Submit Ticket", text: "Report an issue anytime.", action: "Open Ticket" },
];

const faqs = [
	"How do I create an account?",
	"Is my data secure?",
	"What payment methods do you accept?",
	"How long does withdrawal take?",
	"Do you offer 24/7 customer support?",
];

export default function ContactPage() {
	return (
		<>
			<SiteHeader />
			<main className="contact-reference-page">
				<section className="contact-hero">
					<span className="contact-eyebrow">We&apos;re Here For You</span>
					<h1>Get In <strong>Touch</strong></h1>
					<p>Have questions or need assistance? Our team is available 24/7 to help you.</p>
				</section>

				<section className="message-section">
					<form className="message-form" onSubmit={(event) => event.preventDefault()}>
						<h2><Send size={24} />Send Us a Message</h2>
						<div className="message-form-row">
							<label>
								Your Name
								<span className="input-with-icon"><UserRound size={18} /><input placeholder="John Doe" required /></span>
							</label>
							<label>
								Email Address
								<span className="input-with-icon"><Mail size={18} /><input type="email" placeholder="your@email.com" required /></span>
							</label>
						</div>
						<label>
							Subject
							<select defaultValue="General Inquiry">
								<option>General Inquiry</option>
								<option>Account Support</option>
								<option>Technical Support</option>
								<option>Withdrawal Question</option>
							</select>
						</label>
						<label>
							Your Message
							<textarea rows="7" placeholder="How can we help you?" required />
						</label>
						<label className="privacy-check">
							<input type="checkbox" required />
							<span>I agree to the Privacy Policy and consent to processing my data.</span>
						</label>
						<button className="message-submit" type="submit"><Send size={18} />Send Message</button>
					</form>

					<aside className="contact-side-panels">
						<section className="contact-info-panel">
							<h2><HelpCircle size={21} />Contact Information</h2>
							<div className="contact-info-item"><span><Mail size={20} /></span><div><strong>Email</strong><p>support@rivertrade.example</p></div></div>
							<div className="contact-info-item"><span><Phone size={20} /></span><div><strong>Phone</strong><p>+447735830736<br />Mon–Fri, 9AM–6PM UTC</p></div></div>
							<div className="contact-info-item"><span><Headphones size={20} /></span><div><strong>Support</strong><p>24/7 Live Chat • Avg response: 5 mins</p></div></div>
						</section>

						<section className="connect-panel">
							<h2><Globe2 size={21} />Connect With Us</h2>
							<div className="social-links">
								<button type="button" aria-label="WhatsApp"><FaWhatsapp size={19} /><span>WhatsApp</span></button>
								<button type="button" aria-label="Twitter"><FaTwitter size={19} /><span>Twitter</span></button>
								<button type="button" aria-label="Telegram"><FaTelegramPlane size={19} /><span>Telegram</span></button>
							</div>
						</section>
					</aside>
				</section>

				<section className="support-options" aria-label="Contact options">
					{supportOptions.map(({ icon: Icon, title, text, action }) => (
						<article className="support-card" key={title}>
							<div className="support-icon"><Icon size={28} /></div>
							<h2>{title}</h2>
							<p>{text}</p>
							<button type="button">{action}</button>
						</article>
					))}
				</section>

				<section className="faq-section">
					<h2><span><HelpCircle size={26} /></span>Frequently Asked <strong>Questions</strong></h2>
					<div className="faq-grid">
						{faqs.map((question) => (
							<details key={question} className="faq-item">
								<summary>{question}<ChevronDown size={20} /></summary>
								<p>Our support team can help you with this question. Contact us and we will guide you through the next step.</p>
							</details>
						))}
					</div>
				</section>
			</main>
		</>
	);
}
