"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "../components/AuthPage";
import LandingPage from "../components/LandingPage";
import { useMarkets } from "../hooks/useMarkets";
import { persistAuthSession, useAuthSession } from "../hooks/useAuthSession";

export default function Home() {
  const router = useRouter();
  const data = useMarkets();
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const { authenticated } = useAuthSession();

  const completeAuthentication = ({ token, user }) => {
    persistAuthSession({ token, user });
    setView("landing");
  };

  const openDashboard = () => {
    if (authenticated) {
      router.push("/dashboard");
      return;
    }
    setAuthMode("login");
    setView("auth");
  };

  if (view === "auth") return <AuthPage mode={authMode} onBack={() => setView("landing")} onSuccess={completeAuthentication} onSwitchMode={() => setAuthMode((mode) => (mode === "login" ? "signup" : "login"))} />;
  return <LandingPage data={data} authenticated={authenticated} onDashboard={openDashboard} onLogin={() => { setAuthMode("login"); setView("auth"); }} onSignup={() => { setAuthMode("signup"); setView("auth"); }} />;
}