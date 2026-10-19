"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/hooks/useAuthSession";

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  countryCode: "",
  currency: "USD",
};

export default function DashboardProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error("Sign in to load your profile.");
        const response = await fetch("/api/account/profile", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load your profile.");
        if (active) {
          setProfile({ ...emptyProfile, ...body.data });
          setError("");
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load your profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  function change(field, value) {
    setProfile(current => ({ ...current, [field]: value }));
    setNotice("");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Sign in before updating your profile.");
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to save your profile.");
      setProfile({ ...emptyProfile, ...body.data });
      setNotice("Your profile was saved.");

      const sessionUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...sessionUser,
        firstName: body.data.firstName,
        lastName: body.data.lastName,
        email: body.data.email,
        phone: body.data.phone,
        country: body.data.country,
        countryCode: body.data.countryCode,
        currency: body.data.currency,
      }));
      window.dispatchEvent(new Event("rivertrade-auth-change"));
    } catch (saveError) {
      setError(saveError.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-profile" aria-labelledby="profile-title">
      <h2 id="profile-title">Profile</h2>
      {loading ? <p role="status">Loading your profile…</p> : (
        <form className="dashboard-profile-form" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="profile-first-name">First name
              <input id="profile-first-name" value={profile.firstName} onChange={event => change("firstName", event.target.value)} required maxLength={80} />
            </label>
            <label htmlFor="profile-last-name">Last name
              <input id="profile-last-name" value={profile.lastName} onChange={event => change("lastName", event.target.value)} required maxLength={80} />
            </label>
          </div>
          <label htmlFor="profile-email">Email address
            <input id="profile-email" type="email" value={profile.email} readOnly aria-describedby="profile-email-note" />
          </label>
          <small id="profile-email-note">Email address changes require a separate verification process.</small>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <label htmlFor="profile-country-code">Country code
              <input id="profile-country-code" value={profile.countryCode} onChange={event => change("countryCode", event.target.value)} required maxLength={8} />
            </label>
            <label htmlFor="profile-phone">Phone number
              <input id="profile-phone" type="tel" value={profile.phone} onChange={event => change("phone", event.target.value)} required maxLength={40} />
            </label>
          </div>
          <label htmlFor="profile-country">Country
            <input id="profile-country" value={profile.country} onChange={event => change("country", event.target.value)} required maxLength={100} />
          </label>
          <label htmlFor="profile-currency">Main currency
            <select id="profile-currency" value={profile.currency} onChange={event => change("currency", event.target.value)} required>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - Pound Sterling</option>
            </select>
          </label>
          {error && <p role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </form>
      )}
    </section>
  );
}
