"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, ShieldCheck, X } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [register, setRegister] = useState(() => {
    if (typeof window === "undefined") return true;
    return new URLSearchParams(window.location.search).get("mode") !== "login";
  });
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const endpoint = register ? "/api/auth/register" : "/api/auth/login";
    const payload = register ? form : { email: form.email, password: form.password };

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const targetUrl = `${apiBase || ""}${endpoint}`;
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      if (register && data.requiresEmailVerification) {
        setMessage(data.message || "Check your email to verify your account before signing in.");
        setRegister(false);
      } else if (!data.token) {
        throw new Error("Authentication did not return a valid session.");
      } else {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage(`${data.message}. Taking you to your dashboard...`);
        setTimeout(() => router.push("/dashboard"), 500);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`auth-page ${register ? "register-mode" : "login-mode"}`}>
      <header className="auth-aside">
        <Link href="/" className="auth-brand" aria-label="RiverTrade home">
          <img src="/icoinred/logo-88256519050c5e84fcbd2120a81b2097.svg" alt="RiverTrade" />
        </Link>
        <div className="auth-aside-copy">
          <p className="eyebrow">Your capital, clearly</p>
          <h1>Take a more considered position.</h1>
          <p>One account for market access, intelligent tools, and a portfolio you can understand at a glance.</p>
        </div>
        <div className="auth-aside-foot"><ShieldCheck size={18} /> Your data is protected with industry-grade security.</div>
        <nav className="auth-nav" aria-label="Authentication navigation">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
          <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
          <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>REGISTER</Link>
        </nav>
        <button className="auth-menu-button" type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {mobileMenuOpen && (
          <nav className="auth-mobile-nav" aria-label="Mobile authentication navigation">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
            <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>REGISTER</Link>
          </nav>
        )}
      </header>

      <section className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-tabs">
            <button className={register ? "active" : ""} onClick={() => setRegister(true)}>Create account</button>
            <button className={!register ? "active" : ""} onClick={() => setRegister(false)}>Sign in</button>
          </div>
          <h2>{register ? "Open your account" : "Welcome back"}</h2>
          <p className="form-intro">{register ? "Start with the essentials. You can complete your profile later." : "Sign in to view your portfolio and market workspace."}</p>
          <form onSubmit={submit}>
            {register && <div className="form-row"><label>First name<input name="firstName" required onChange={change} /></label><label>Last name<input name="lastName" required onChange={change} /></label></div>}
            <label>Email address<input type="email" name="email" required onChange={change} /></label>
            {register && <><label>Country<input name="country" required onChange={change} /></label><div className="form-row"><label>Country code<input name="countryCode" placeholder="+1" required onChange={change} /></label><label>Phone number<input name="phone" required onChange={change} /></label></div></>}
            <label>Password<input type="password" name="password" minLength="6" required onChange={change} /></label>
            {register && <><label>Main currency<select name="currency" required onChange={change}><option value="">Select currency</option><option>USD</option><option>EUR</option><option>GBP</option></select></label><label className="check"><input type="checkbox" required /> I accept the client and privacy policies.</label></>}
            <button className="button form-submit" disabled={busy}>{busy ? "Working..." : register ? "Create account" : "Sign in"} <ArrowUpRight size={17} /></button>
            {message && <p className={message.includes("successful") ? "form-message success" : "form-message"}>{message}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
