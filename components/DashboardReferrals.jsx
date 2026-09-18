"use client";

import { useState } from "react";

export default function DashboardReferrals() {
  const [copied, setCopied] = useState(false);
  const [referralLink] = useState(() => {
    if (typeof window === "undefined") return "https://rivertrade-one.vercel.app/?ref=REF_SVPRVD";
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const code = user?.referralCode || "REF_SVPRVD";
    return `${window.location.origin}/?ref=${code}`;
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="dashboard-referrals" aria-labelledby="referrals-title">
      <h2 id="referrals-title">Referral Program</h2>
      <div className="dashboard-referral-stats">
        <article><span>Total Referrals</span><strong>0</strong></article>
        <article><span>Active Referrals</span><strong>0</strong></article>
        <article><span>Total Commission</span><strong>$0.00</strong></article>
      </div>
      <div className="dashboard-referral-link-card">
        <h3>Your Referral Link</h3>
        <div className="dashboard-referral-link-row">
          <input value={referralLink} readOnly aria-label="Your referral link" />
          <button type="button" onClick={copyLink}>{copied ? "Copied" : "Copy Link"}</button>
        </div>
      </div>
      <div className="dashboard-referral-list">
        <h3>Your Referrals</h3>
        <p>No referrals yet. Share your link to get started!</p>
      </div>
    </section>
  );
}
