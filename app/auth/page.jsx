'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "../../components/AuthPage";
import { persistAuthSession, useAuthSession } from "../../hooks/useAuthSession";

export default function AuthRoute() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const { authenticated } = useAuthSession();

  useEffect(() => {
    if (authenticated) router.replace("/dashboard");
  }, [authenticated, router]);

  return (
    <AuthPage
      mode={mode}
      onBack={() => router.push("/")}
      onSuccess={({ token, user }) => {
        persistAuthSession({ token, user });
        router.push("/dashboard");
      }}
      onSwitchMode={() => setMode((current) => current === "login" ? "signup" : "login")}
    />
  );
}