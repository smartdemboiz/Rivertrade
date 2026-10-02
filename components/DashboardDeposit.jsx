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
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(body => setPaymentSettings(body.data || []))
      .catch(() => setPaymentSettings([]))
      .finally(() => setSettingsLoaded(true));
  }, []);

  const submitDeposit = (event) => {
    event.preventDefault();
    setError("Deposit requests are not connected to a payment processor yet. No funds were moved.");
  };

  const configuredCrypto = paymentSettings.filter(item => item.method === "Cryptocurrency");
  const configuredMethods = [...new Set(paymentSettings.map(item => item.method))];
  const visiblePaymentMethods = configuredMethods;
  const visibleCryptocurrencies = [...new Set(configuredCrypto.map(item => item.asset).filter(Boolean))];
  const selectedCrypto = configuredCrypto.find(item => item.asset === cryptocurrency) || configuredCrypto[0];
  const walletAddress = selectedCrypto?.value || "";
  const networkLabel = selectedCrypto?.network || network;
  const visibleNetworks = [...new Set(configuredCrypto.filter(item => item.asset === cryptocurrency).map(item => item.network).filter(Boolean))];
  const bankSetting = paymentSettings.find(item => item.method === "Bank Transfer");
  const bankDetails = bankSetting?.value ? bankSetting.value.split("\n").map(line => line.split(": ")) : [];
  const bankDetailsText = bankDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const paypalSetting = paymentSettings.find(item => item.method === "PayPal");
  const paypalDetails = paypalSetting?.value ? paypalSetting.value.split("\n").map(line => line.split(": ")) : [];
  const paypalDetailsText = paypalDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const selectedInstructions = selectedCrypto?.instructions || bankSetting?.instructions || paypalSetting?.instructions;

  if (!settingsLoaded || paymentSettings.length === 0) {
    return (
      <section className="dashboard-deposit" aria-labelledby="deposit-title">
        <h2 id="deposit-title">Deposit Funds</h2>
        <p role="status">{settingsLoaded ? "No verified deposit methods are configured." : "Loading available deposit methods…"}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-deposit" aria-labelledby="deposit-title">
      <h2 id="deposit-title">Deposit Funds</h2>
      <form className="dashboard-deposit-form" onSubmit={submitDeposit}>
        <label htmlFor="deposit-amount">Amount</label>
        <input id="deposit-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />

        <label htmlFor="deposit-method">Payment Method</label>
        <select id="deposit-method" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setError(""); }} required>
          <option value="">-- Choose Payment Method --</option>
          {visiblePaymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        {paymentMethod === "Cryptocurrency" && <>
          <label htmlFor="deposit-cryptocurrency">Cryptocurrency</label>
          <select id="deposit-cryptocurrency" value={cryptocurrency} onChange={(event) => { setCryptocurrency(event.target.value); setNetwork(""); setError(""); }} required>
            {visibleCryptocurrencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="dashboard-deposit-details">
            <p>Send {cryptocurrency.replace(/\s*\([^)]*\)/, "")} on {networkLabel} to this wallet address:</p>
            <code>{walletAddress}</code>
            <button type="button" onClick={() => navigator.clipboard?.writeText(walletAddress)}>Copy address/details</button>
            <small>{selectedInstructions || `Please send the exact amount of ${cryptocurrency.replace(/\s*\([^)]*\)/, "")} on ${networkLabel} to the wallet above. Your deposit will be confirmed after 1–3 blockchain confirmations.`}</small>
          </div>
          <label htmlFor="deposit-network">Select Network</label>
          <select id="deposit-network" value={network} onChange={(event) => setNetwork(event.target.value)} required>
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

        <button type="submit">Deposit</button>
        {error && <p className="dashboard-deposit-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
