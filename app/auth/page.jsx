'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPage from "../../components/AuthPage";
import { persistAuthSession, useAuthSession } from "../../hooks/useAuthSession";

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthRouteContent />
    </Suspense>
  );
}

function AuthRouteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(() => searchParams.get("mode") === "register" ? "signup" : "login");
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