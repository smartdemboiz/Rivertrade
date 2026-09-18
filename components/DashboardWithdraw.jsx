"use client";

import { useState } from "react";

const currencies = [
  "Bitcoin (BTC)",
  "Ethereum (ETH)",
  "Tether (USDT)",
  "USD Coin (USDC)",
  "Binance Coin (BNB)",
  "Ripple (XRP)",
  "Solana (SOL)",
  "Dogecoin (DOGE)",
  "Cardano (ADA)",
  "Chainlink (LINK)",
  "Litecoin (LTC)",
];
const methods = ["Blockchain Wallet Address", "Bank Transfer", "PayPal", "RiverTrade managed account"];
const networks = [
  "Bitcoin Network",
  "Mainnet",
  "BEP20",
  "ERC20",
  "TRC20",
  "Polygon (MATIC)",
  "BEP20 (Binance Smart Chain)",
  "ERC20 (Ethereum)",
  "TRC20 (Tron)",
  "Solana Network",
];

export default function DashboardWithdraw() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [method, setMethod] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [managedAccount, setManagedAccount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const changeMethod = (event) => {
    setMethod(event.target.value);
    setSubmitted(false);
    setCurrency("");
    setWalletAddress("");
    setNetwork("");
    setAccountName("");
    setAccountNumber("");
    setRoutingNumber("");
    setBankName("");
    setPaypalEmail("");
    setManagedAccount("");
  };

  const submitWithdrawal = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="dashboard-withdraw" aria-labelledby="withdraw-title">
      <h2 id="withdraw-title">Withdraw Funds</h2>
      <form className="dashboard-withdraw-form" onSubmit={submitWithdrawal}>
        <label htmlFor="withdraw-amount">Amount</label>
        <input id="withdraw-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />

        <label htmlFor="withdraw-method">Withdrawal Method</label>
        <select id="withdraw-method" value={method} onChange={changeMethod} required>
          <option value="">-- Choose Method --</option>
          {methods.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        {method === "Blockchain Wallet Address" && <>
          <label htmlFor="withdraw-currency">Select Cryptocurrency</label>
          <select id="withdraw-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} required>
            <option value="">-- Choose Currency --</option>
            {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label htmlFor="withdraw-wallet">Wallet Address</label>
          <input id="withdraw-wallet" value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} placeholder="Enter wallet address" required />
          <label htmlFor="withdraw-network">Network (if applicable)</label>
          <select id="withdraw-network" value={network} onChange={(event) => setNetwork(event.target.value)} required>
            <option value="">-- Select Network --</option>
            {networks.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </>}

        {method === "Bank Transfer" && <>
          <label htmlFor="withdraw-account-name">Account Name</label>
          <input id="withdraw-account-name" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Account holder name" required />
          <label htmlFor="withdraw-account-number">Account Number</label>
          <input id="withdraw-account-number" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Account number" required />
          <label htmlFor="withdraw-routing-number">Routing Number</label>
          <input id="withdraw-routing-number" value={routingNumber} onChange={(event) => setRoutingNumber(event.target.value)} placeholder="Routing number" required />
          <label htmlFor="withdraw-bank-name">Bank Name</label>
          <input id="withdraw-bank-name" value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Bank name" required />
        </>}

        {method === "PayPal" && <>
          <label htmlFor="withdraw-paypal-email">PayPal Email</label>
          <input id="withdraw-paypal-email" type="email" value={paypalEmail} onChange={(event) => setPaypalEmail(event.target.value)} placeholder="example@paypal.com" required />
        </>}

        {method === "RiverTrade managed account" && <>
          <label htmlFor="withdraw-managed-account">Managed Account</label>
          <select id="withdraw-managed-account" value={managedAccount} onChange={(event) => setManagedAccount(event.target.value)} required>
            <option value="">-- Choose Account --</option>
            <option value="managed-growth">Managed Growth Account</option>
            <option value="managed-balanced">Managed Balanced Account</option>
          </select>
        </>}

        <button type="submit">Withdraw</button>
        {submitted && <p className="dashboard-withdraw-success" role="status">Your withdrawal request has been submitted for review.</p>}
      </form>
    </section>
  );
}
