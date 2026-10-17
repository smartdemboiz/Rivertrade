"use client";

import { useEffect, useState } from "react";

export default function DashboardDeposit() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cryptocurrency, setCryptocurrency] = useState("");
  const [network, setNetwork] = useState("");
  const [paypalReference, setPaypalReference] = useState("");
  const [paypalDetailsCopied, setPaypalDetailsCopied] = useState(false);
  const [bankDetailsCopied, setBankDetailsCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    fetch("/api/payment-settings")
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load deposit methods.");
        setPaymentSettings(body.data || []);
      })
      .catch(loadError => setSettingsError(loadError.message || "Unable to load deposit methods."))
      .finally(() => setSettingsLoaded(true));
  }, []);

  const submitDeposit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          amount,
          method: paymentMethod,
          asset: paymentMethod === "Cryptocurrency" ? cryptocurrency : "",
          network: paymentMethod === "Cryptocurrency" ? network : "",
          reference: paymentMethod === "PayPal" ? paypalReference : "",
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to submit your deposit request.");

      setSuccess(`Request ${body.data.id} submitted for manual review. This records a request only; no payment was processed and no funds were credited.`);
      setAmount("");
      setPaymentMethod("");
      setCryptocurrency("");
      setNetwork("");
      setPaypalReference("");
    } catch (submitError) {
      setError(submitError.message || "Unable to submit your deposit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const configuredCrypto = paymentSettings.filter(item => item.method === "Cryptocurrency");
  const configuredMethods = [...new Set(paymentSettings.map(item => item.method))];
  const visiblePaymentMethods = configuredMethods;
  const visibleCryptocurrencies = [...new Set(configuredCrypto.map(item => item.asset).filter(Boolean))];
  const selectedCrypto = configuredCrypto.find(item => item.asset === cryptocurrency && item.network === network);
  const walletAddress = selectedCrypto?.value || "";
  const networkLabel = network || "the selected network";
  const visibleNetworks = [...new Set(configuredCrypto.filter(item => item.asset === cryptocurrency).map(item => item.network).filter(Boolean))];
  const bankSetting = paymentSettings.find(item => item.method === "Bank Transfer");
  const bankDetails = bankSetting?.value ? bankSetting.value.split("\n").map(line => line.split(": ")) : [];
  const bankDetailsText = bankDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const paypalSetting = paymentSettings.find(item => item.method === "PayPal");
  const paypalDetails = paypalSetting?.value ? paypalSetting.value.split("\n").map(line => line.split(": ")) : [];
  const paypalDetailsText = paypalDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const selectedInstructions = paymentMethod === "Cryptocurrency"
    ? selectedCrypto?.instructions
    : paymentMethod === "Bank Transfer" ? bankSetting?.instructions : paypalSetting?.instructions;

  if (!settingsLoaded || paymentSettings.length === 0) {
    return (
      <section className="dashboard-deposit" aria-labelledby="deposit-title">
        <h2 id="deposit-title">Deposit Funds</h2>
        <p role={settingsError ? "alert" : "status"}>{settingsError || (settingsLoaded ? "No deposit methods are currently available." : "Loading available deposit methods…")}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-deposit" aria-labelledby="deposit-title">
      <h2 id="deposit-title">Deposit Funds</h2>
      <form className="dashboard-deposit-form" onSubmit={submitDeposit}>
        <label htmlFor="deposit-amount">Amount {paymentMethod === "Cryptocurrency" ? cryptocurrency && `(${cryptocurrency})` : "(USD)"}</label>
        <input id="deposit-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />

        <label htmlFor="deposit-method">Payment Method</label>
        <select id="deposit-method" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setCryptocurrency(""); setNetwork(""); setPaypalReference(""); setError(""); setSuccess(""); }} required>
          <option value="">-- Choose Payment Method --</option>
          {visiblePaymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        {paymentMethod === "Cryptocurrency" && <>
          <label htmlFor="deposit-cryptocurrency">Cryptocurrency</label>
          <select id="deposit-cryptocurrency" value={cryptocurrency} onChange={(event) => { setCryptocurrency(event.target.value); setNetwork(""); setError(""); }} required>
            <option value="">-- Choose Cryptocurrency --</option>
            {visibleCryptocurrencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="dashboard-deposit-details">
            <p>Send {cryptocurrency.replace(/\s*\([^)]*\)/, "")} on {networkLabel} to this wallet address:</p>
            <code>{walletAddress || "Choose a network to view the matching wallet address."}</code>
            <button type="button" disabled={!walletAddress} onClick={() => navigator.clipboard?.writeText(walletAddress)}>Copy address/details</button>
            <small>{selectedInstructions || "After sending your payment, submit a request for manual review. Submitting the request does not verify or credit the transfer."}</small>
          </div>
          {!cryptocurrency && <p role="status">Choose a cryptocurrency above to see its available networks.</p>}
          <label htmlFor="deposit-network">Select Network</label>
          <select id="deposit-network" value={network} onChange={(event) => setNetwork(event.target.value)} required disabled={!visibleNetworks.length}>
            <option value="">-- Choose Network --</option>
            {visibleNetworks.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </>}

        {paymentMethod === "Bank Transfer" && <div className="dashboard-deposit-details dashboard-bank-details">
          <p>Use these bank transfer details:</p>
          <div className="dashboard-bank-detail-list">{bankDetails.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(bankDetailsText); setBankDetailsCopied(true); }}>{bankDetailsCopied ? "Copied" : "Copy all bank details"}</button>
          <small>{bankSetting?.instructions || "Please include your email address in the payment reference. Bank transfers may take 1–3 business days to process."}</small>
        </div>}

        {paymentMethod === "PayPal" && <div className="dashboard-deposit-details dashboard-paypal-details">
          <p>Send your payment using these PayPal details:</p>
          <div className="dashboard-bank-detail-list">{paypalDetails.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <label htmlFor="deposit-paypal-reference">Your PayPal email</label>
          <input id="deposit-paypal-reference" type="email" value={paypalReference} onChange={(event) => setPaypalReference(event.target.value)} placeholder="example@paypal.com" required />
          <button type="button" onClick={() => { navigator.clipboard?.writeText(paypalDetailsText); setPaypalDetailsCopied(true); }}>{paypalDetailsCopied ? "Copied" : "Copy PayPal details"}</button>
          <small>{paypalSetting?.instructions || "Include your RiverTrade email in the payment reference. PayPal deposits are normally confirmed within 1–3 business days."}</small>
        </div>}

        <button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit deposit request"}</button>
        {error && <p className="dashboard-deposit-error" role="alert">{error}</p>}
        {success && <p className="dashboard-deposit-success" role="status">{success}</p>}
      </form>
    </section>
  );
}
