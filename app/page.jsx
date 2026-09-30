"use client";

import { useState } from "react";
import AuthPage from "../components/AuthPage";
import LandingPage from "../components/LandingPage";
import { useMarkets } from "../hooks/useMarkets";

export default function Home() {
  const data = useMarkets();
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [authenticated, setAuthenticated] = useState(false);

  if (view === "auth") return <AuthPage mode={authMode} onBack={() => setView("landing")} onSuccess={() => { setAuthenticated(true); setView("landing"); }} onSwitchMode={() => setAuthMode((mode) => (mode === "login" ? "signup" : "login"))} />;
  return <LandingPage data={data} authenticated={authenticated} onDashboard={() => { if (authenticated) setView("dashboard"); else { setAuthMode("login"); setView("auth"); } }} onLogin={() => { setAuthMode("login"); setView("auth"); }} onSignup={() => { setAuthMode("signup"); setView("auth"); }} />;
}