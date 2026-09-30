"use client";

import { useState } from "react";

const languages = ["EN", "ES", "FR"];

export function AuthPage({ mode, onBack, onSuccess, onSwitchMode }) {
  const signup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  const submit = (event) => {
    event.preventDefault();
    if (!email || !password || (signup && (!country || !phone || !currency || !accepted))) {
      setError(signup ? "Complete the required fields and accept the policies." : "Enter your email and password to continue.");
      return;
    }
    setError("");
    onSuccess();
  };

  return (
    <main className="min-h-screen bg-[#101b1d] text-[#101b1d]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#101b1d] px-6 py-5">
        <button onClick={onBack} className="font-black tracking-[2px] text-[#6CF9D8]">RIVERTRADE</button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setLanguageOpen((open) => !open)} className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#202024] px-3 py-2 text-sm font-bold text-[#E0F3FF]" aria-label="Choose language" aria-expanded={languageOpen}>
              <span className="text-[#6CF9D8]">◐</span>{selectedLanguage}<span className="text-xs text-[#829697]">⌄</span>
            </button>
            {languageOpen && <div className="absolute right-0 top-12 z-20 min-w-20 rounded-xl border border-white/10 bg-[#202024] p-1 shadow-xl">{languages.map((language) => <button key={language} onClick={() => { setSelectedLanguage(language); setLanguageOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-[#E0F3FF] hover:bg-white/10">{language}</button>)}</div>}
          </div>
          <button onClick={onBack} className="text-2xl text-white" aria-label="Close authentication">×</button>
        </div>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-2xl bg-[#E0F3FF] px-6 py-14 sm:my-8 sm:rounded-2xl sm:px-12 sm:shadow-2xl">
        <h1 className="text-4xl font-medium">{signup ? "Open your account" : "Welcome back"}</h1>
        <p className="mt-4 text-[#536367]">{signup ? "Start with the essentials. You can complete your profile later." : "Sign in to view your portfolio and market workspace."}</p>
        {signup && <>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="First name" required /><Field label="Last name" required /></div>
          <Field label="Country" placeholder="United States" value={country} onChange={setCountry} required />
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]"><Field label="Country code" value={countryCode} onChange={setCountryCode} required /><Field label="Phone number" type="tel" value={phone} onChange={setPhone} required /></div>
        </>}
        <Field label="Email address" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {signup && <>
          <label className="mt-5 block text-sm text-[#536367]">Main currency<select value={currency} onChange={(event) => setCurrency(event.target.value)} required className="mt-2 w-full rounded-lg border border-black/20 bg-transparent p-3 text-[#101b1d] outline-none focus:border-[#6CF9D8]"><option value="">Select currency</option><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - Pound Sterling</option></select></label>
          <label className="mt-5 flex items-center gap-3 text-sm text-[#536367]"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="h-4 w-4 accent-[#6CF9D8]" />I accept the client and privacy policies.</label>
        </>}
        {error && <p className="mt-4 text-sm text-[#b42318]">{error}</p>}
        <button className="mt-7 w-full rounded-lg bg-[#6CF9D8] py-4 font-black">{signup ? "Create account ↗" : "Sign in ↗"}</button>
        <p className="mt-6 text-center text-sm text-[#536367]">{signup ? "Already have an account?" : "New to Rivertrade?"} <button type="button" onClick={onSwitchMode} className="font-black text-[#101b1d]">{signup ? "Sign in" : "Create an account"}</button></p>
      </form>
    </main>
  );
}

export default AuthPage;

function Field({ label, type = "text", value, onChange, placeholder, required = false }) {
  return <label className="mt-5 block text-sm text-[#536367]">{label}<input required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange?.(event.target.value)} className="mt-2 w-full rounded-lg border border-black/20 p-3 text-[#101b1d] outline-none placeholder:text-[#829697] focus:border-[#6CF9D8]" /></label>;
}
