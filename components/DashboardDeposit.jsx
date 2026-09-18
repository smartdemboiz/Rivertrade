"use client";

import { useEffect, useState } from "react";

const paymentMethods = ["Cryptocurrency", "Bank Transfer", "PayPal"];
const cryptocurrencies = [
  "Bitcoin (BTC)",
  "Tether (USDT)",
  "Ethereum (ETH)",
  "Binance Coin (BNB)",
  "Solana (SOL)",
  "Polygon (MATIC)",
  "Tron (TRX)",
];
const networks = [
  "Bitcoin Network",
  "Ethereum Network",
  "BNB Smart Chain",
  "Polygon Network",
  "BEP20 (Binance Smart Chain)",
  "ERC20 (Ethereum)",
  "TRC20 (Tron)",
  "Solana Network",
];

export default function DashboardDeposit() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cryptocurrency, setCryptocurrency] = useState("Bitcoin (BTC)");
  const [network, setNetwork] = useState("");
  const [paypalReference, setPaypalReference] = useState("");
  const [paypalDetailsCopied, setPaypalDetailsCopied] = useState(false);
  const [bankDetailsCopied, setBankDetailsCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState([]);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(body => setPaymentSettings(body.data || []))
      .catch(() => {});
  }, []);

  const submitDeposit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const configuredCrypto = paymentSettings.filter(item => item.method === "Cryptocurrency");
  const configuredMethods = [...new Set(paymentSettings.map(item => item.method))];
  const visiblePaymentMethods = configuredMethods.length ? configuredMethods : paymentMethods;
  const visibleCryptocurrencies = configuredCrypto.length ? [...new Set(configuredCrypto.map(item => item.asset).filter(Boolean))] : cryptocurrencies;
  const selectedCrypto = configuredCrypto.find(item => item.asset === cryptocurrency) || configuredCrypto[0];
  const walletAddress = selectedCrypto?.value || (cryptocurrency === "Tether (USDT)" ? "TVgcd7agoat7W8EzGtqtU2CCZN6SHDA5tcD" : "1A1z7agoat7W8EzGtqtU2CCZN6SHDA5tcD");
  const networkLabel = selectedCrypto?.network || network || (cryptocurrency === "Tether (USDT)" ? "TRC20" : "Bitcoin Network");
  const visibleNetworks = configuredCrypto.length ? [...new Set(configuredCrypto.filter(item => item.asset === cryptocurrency).map(item => item.network).filter(Boolean))] : networks;
  const bankSetting = paymentSettings.find(item => item.method === "Bank Transfer");
  const bankDetails = bankSetting?.value ? bankSetting.value.split("\n").map(line => line.split(": ")) : [
    ["Bank Name", "Rivertrade Bank"],
    ["Account Number", "1234567890"],
    ["SWIFT", "RTBKUS33"],
    ["IBAN", "US00RTBK00000012345678"],
  ];
  const bankDetailsText = bankDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const paypalSetting = paymentSettings.find(item => item.method === "PayPal");
  const paypalDetails = [
    ...(paypalSetting?.value ? paypalSetting.value.split("\n").map(line => line.split(": ")) : [["PayPal Email", "payments@rivertrade.com"], ["Account Name", "RiverTrade Holdings"]]),
    ["Payment Reference", paypalReference || "Use your RiverTrade email"],
  ];
  const paypalDetailsText = paypalDetails.map(([label, value]) => `${label}: ${value}`).join("\n");
  const selectedInstructions = selectedCrypto?.instructions || bankSetting?.instructions || paypalSetting?.instructions;

  return (
    <section className="dashboard-deposit" aria-labelledby="deposit-title">
      <h2 id="deposit-title">Deposit Funds</h2>
      <form className="dashboard-deposit-form" onSubmit={submitDeposit}>
        <label htmlFor="deposit-amount">Amount</label>
        <input id="deposit-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />

        <label htmlFor="deposit-method">Payment Method</label>
        <select id="deposit-method" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setSubmitted(false); }} required>
          <option value="">-- Choose Payment Method --</option>
          {visiblePaymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        {paymentMethod === "Cryptocurrency" && <>
          <label htmlFor="deposit-cryptocurrency">Cryptocurrency</label>
          <select id="deposit-cryptocurrency" value={cryptocurrency} onChange={(event) => { setCryptocurrency(event.target.value); setNetwork(""); setSubmitted(false); }} required>
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
        {submitted && <p className="dashboard-deposit-success" role="status">Your deposit request has been submitted.</p>}
      </form>
    </section>
  );
}
