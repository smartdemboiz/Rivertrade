"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/hooks/useAuthSession";

export default function DashboardReferrals() {
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadReferrals() {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error("Sign in to load your referral information.");
        const response = await fetch("/api/account/referrals", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load referral information.");
        if (active) {
          setReferralData(body.data);
          setError("");
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load referral information.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadReferrals();
    return () => { active = false; };
  }, []);

  const referralLink = referralData?.code
    ? `${typeof window === "undefined" ? "" : window.location.origin}/?ref=${encodeURIComponent(referralData.code)}`
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 2200);
    } catch (copyFailure) {
      setCopied(false);
      setCopyError(copyFailure.message || "Unable to copy the referral link. Select and copy it manually.");
    }
  };

  return (
    <section className="dashboard-referrals" aria-labelledby="referrals-title">
      <h2 id="referrals-title">Referral Program</h2>
      {error && <p role="alert">{error}</p>}
      <div className="dashboard-referral-stats">
        <article><span>Total referrals</span><strong>{loading ? "…" : referralData?.total ?? "Unavailable"}</strong></article>
        <article><span>Active referrals</span><strong>{loading ? "…" : referralData?.active ?? "Unavailable"}</strong></article>
        <article><span>Commission</span><strong>{referralData ? "Not enabled" : loading ? "…" : "Unavailable"}</strong></article>
      </div>
      <div className="dashboard-referral-link-card">
        <h3>Your Referral Link</h3>
        <div className="dashboard-referral-link-row">
          <input value={referralLink} readOnly aria-label="Your referral link" placeholder={loading ? "Loading referral link…" : "Referral link unavailable"} />
          <button type="button" onClick={copyLink} disabled={!referralLink}>{copied ? "Copied" : "Copy Link"}</button>
        </div>
        {copyError && <p role="alert">{copyError}</p>}
        {referralData && <small>Referral signups are tracked. Commission rewards are not configured yet.</small>}
      </div>
      <div className="dashboard-referral-list">
        <h3>Your Referrals</h3>
        {loading ? <p role="status">Loading referrals…</p> : error ? null : referralData?.referrals.length ? (
          <ul>
            {referralData.referrals.map((referral, index) => (
              <li key={referral.id}>
                Referral {referralData.total - index}
                <span>{referral.joinedAt ? new Date(referral.joinedAt).toLocaleDateString() : "Date unavailable"}</span>
                <span>{referral.status}</span>
              </li>
            ))}
          </ul>
        ) : <p>No referrals yet. Share your link to get started!</p>}
      </div>
    </section>
  );
}
