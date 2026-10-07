"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { persistAuthSession } from "@/hooks/useAuthSession";

export default function AuthCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const finishConfirmation = async () => {
      const parameters = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = parameters.get("access_token");
      const confirmationError = parameters.get("error_description");
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!accessToken) {
        setError(confirmationError || "The confirmation link is invalid or expired. Request a new one and try again.");
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to verify your account.");

        persistAuthSession({ token: accessToken, user: result.user });
        router.replace("/dashboard?kyc=required");
      } catch (verificationError) {
        setError(verificationError.message || "Unable to verify your account.");
      }
    };

    finishConfirmation();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101b1d] px-6 text-[#E0F3FF]">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#202024] p-8 text-center">
        <h1 className="text-2xl font-semibold">Confirming your account</h1>
        {error ? (
          <>
            <p className="mt-4 text-sm text-[#ffb4ab]">{error}</p>
            <Link className="mt-6 inline-block font-semibold text-[#6CF9D8]" href="/auth">Return to sign in</Link>
          </>
        ) : (
          <p className="mt-4 text-sm text-[#aab9bb]">Verifying your email and opening your dashboard…</p>
        )}
      </section>
    </main>
  );
}