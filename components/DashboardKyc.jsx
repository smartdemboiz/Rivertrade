"use client";

import { useCallback, useEffect, useState } from "react";

const documentTypes = ["Passport", "National ID", "Driver license"];

export default function DashboardKyc() {
  const [submission, setSubmission] = useState(null);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [document, setDocument] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/kyc", {
        headers: { Authorization: `Bearer ${token || ""}` },
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load identity verification status.");
      setError("");
      setSubmission(body.data || null);
    } catch (loadError) {
      setError(loadError.message || "Unable to load identity verification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the user's current verification request when the section opens.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
  }, [loadStatus]);

  async function submit(event) {
    event.preventDefault();
    if (!document) {
      setError("Choose an identity document to upload.");
      return;
    }

    const formElement = event.currentTarget;
    setSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.set("fullName", fullName);
      form.set("country", country);
      form.set("documentType", documentType);
      form.set("confirmed", String(confirmed));
      form.set("document", document);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        body: form,
      });
      const body = await response.json();
      if (!response.ok) {
        if (body.data) setSubmission(body.data);
        throw new Error(body.error || "Unable to submit identity verification.");
      }

      setSubmission(body.data);
      setDocument(null);
      formElement.reset();
      setFullName("");
      setCountry("");
      setDocumentType("");
      setConfirmed(false);
    } catch (submitError) {
      setError(submitError.message || "Unable to submit identity verification.");
    } finally {
      setSubmitting(false);
    }
  }

  const status = submission?.status?.toLowerCase();
  const canSubmit = !submission || status === "rejected";

  return (
    <section className="dashboard-kyc" aria-labelledby="kyc-title">
      <div className="dashboard-section-view-head">
        <div>
          <p className="eyebrow">Account security</p>
          <h2 id="kyc-title">Identity verification</h2>
          <p>Submit a valid identity document so our team can verify your account.</p>
        </div>
      </div>

      {loading ? <p role="status">Loading your verification status…</p> : (
        <div className="dashboard-section-view-card">
          <span>Verification status</span>
          <strong>{submission ? (status === "approved" ? "Verified" : status === "review" ? "In review" : status === "rejected" ? "Action required" : "Pending review") : "Not submitted"}</strong>
          <small>{status === "approved"
            ? "Your identity has been verified."
            : status === "review" || status === "pending"
              ? "Your documents are being reviewed. You can check back here for updates."
              : status === "rejected"
                ? "Your previous submission was not approved. Submit a new document to try again."
                : "Complete the form below to start verification."}</small>
        </div>
      )}

      {error && <p className="dashboard-kyc-error" role="alert">{error}</p>}

      {!loading && canSubmit && (
        <form className="dashboard-profile-form dashboard-kyc-form" onSubmit={submit}>
          <label htmlFor="kyc-full-name">Full legal name
            <input id="kyc-full-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={120} />
          </label>
          <label htmlFor="kyc-country">Issuing country
            <input id="kyc-country" autoComplete="country-name" value={country} onChange={(event) => setCountry(event.target.value)} required maxLength={100} />
          </label>
          <label htmlFor="kyc-document-type">Identity document
            <select id="kyc-document-type" value={documentType} onChange={(event) => setDocumentType(event.target.value)} required>
              <option value="">Choose a document</option>
              {documentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label htmlFor="kyc-document">Upload document (PDF, JPEG, PNG, or WebP; max 8 MB)
            <input id="kyc-document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setDocument(event.target.files?.[0] || null)} required />
          </label>
          <label className="dashboard-kyc-consent" htmlFor="kyc-confirmed">
            <input id="kyc-confirmed" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required />
            I confirm the details are accurate and the document belongs to me.
          </label>
          <button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit for verification"}</button>
        </form>
      )}
    </section>
  );
}
