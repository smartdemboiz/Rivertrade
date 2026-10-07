"use client";

import { useEffect, useState } from "react";

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
  "Bitcoin Cash (BCH)",
  "Polkadot (DOT)",
  "Avalanche (AVAX)",
];
const networks = [
  "ACH",
  "Wire Transfer",
  "SWIFT",
  "SEPA",
  "Faster Payments",
  "Interac e-Transfer",
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
  "Polygon",
  "Other",
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
  const [payoutDetails, setPayoutDetails] = useState("");
  const [managedAccount, setManagedAccount] = useState("");
  const [error, setError] = useState("");
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [methodsLoaded, setMethodsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/withdrawal-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((body) => setWithdrawalMethods(body.data || []))
      .catch(() => setWithdrawalMethods([]))
      .finally(() => setMethodsLoaded(true));
  }, []);

  const changeMethod = (event) => {
    const selected = configuredMethods[Number(event.target.value)];
    setMethod(event.target.value);
    setError("");
    const configuredAsset = selected?.asset || "";
    setCurrency(currencies.find((item) => item.toLowerCase() === configuredAsset.toLowerCase())
      || currencies.find((item) => item.toLowerCase().includes(`(${configuredAsset.toLowerCase()})`))
      || configuredAsset);
    setWalletAddress("");
    const configuredNetwork = selected?.network || "";
    setNetwork(configuredNetwork
      ? networks.find((item) => item === configuredNetwork || item.toLowerCase().includes(configuredNetwork.toLowerCase())) || configuredNetwork
      : "");
    setAccountName("");
    setAccountNumber("");
    setRoutingNumber("");
    setBankName("");
    setPaypalEmail("");
    setPayoutDetails("");
    setManagedAccount("");
  };

  const configuredMethods = withdrawalMethods.filter((item) => item.method);
  const withdrawalMethod = method === "" ? null : configuredMethods[Number(method)] || null;
  const methodName = withdrawalMethod?.method || "";
  const assetName = withdrawalMethod?.asset || "";
  const isCryptoMethod = /\b(crypto|bitcoin|btc|ethereum|ether|eth|tether|usdt|usdc|solana|sol|bnb|xrp|doge|ada|link|ltc|bch|dot|avax)\b/i.test(`${methodName} ${assetName}`);
  const isBankMethod = /bank|ach|wire|swift|sepa|transfer/i.test(methodName);
  const isPayPalMethod = /paypal/i.test(methodName);
  const selectedInstructions = withdrawalMethod?.instructions;
  const methodOptionLabel = (item) => [item.method, item.asset, item.network].filter(Boolean).join(" · ");
  const usesCustomPayoutDetails = withdrawalMethod && !isCryptoMethod && !isBankMethod && !isPayPalMethod && methodName !== "RiverTrade managed account";
  const configuredAssetIsListed = currencies.some((item) => item.toLowerCase() === assetName.toLowerCase() || item.toLowerCase().includes(`(${assetName.toLowerCase()})`));
  const cryptoCurrencies = assetName && !configuredAssetIsListed ? [assetName, ...currencies] : currencies;
  const cryptoNetworks = withdrawalMethod?.network && !networks.includes(withdrawalMethod.network)
    ? [withdrawalMethod.network, ...networks]
    : networks;

  const submitWithdrawal = (event) => {
    event.preventDefault();
    setError("Withdrawal processing is not connected to a payout provider yet. No funds were moved.");
  };

  if (!methodsLoaded || withdrawalMethods.length === 0) {
    return (
      <section className="dashboard-withdraw" aria-labelledby="withdraw-title">
        <h2 id="withdraw-title">Withdraw Funds</h2>
        <p role="status">{methodsLoaded ? "No withdrawal methods are currently available." : "Loading available withdrawal methods…"}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-withdraw" aria-labelledby="withdraw-title">
      <h2 id="withdraw-title">Withdraw Funds</h2>
      <form className="dashboard-withdraw-form" onSubmit={submitWithdrawal}>
        <label htmlFor="withdraw-amount">Amount</label>
        <input id="withdraw-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />

        <label htmlFor="withdraw-method">Withdrawal Method</label>
        <select id="withdraw-method" value={method} onChange={changeMethod} required>
          <option value="">-- Choose Method --</option>
          {configuredMethods.map((item, index) => <option key={item.id || `${item.method}-${index}`} value={index}>{methodOptionLabel(item)}</option>)}
        </select>

        {isCryptoMethod && <>
          <label htmlFor="withdraw-currency">Select Cryptocurrency</label>
          <select id="withdraw-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} required>
            <option value="">-- Choose Currency --</option>
            {cryptoCurrencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label htmlFor="withdraw-wallet">Wallet Address</label>
          <input id="withdraw-wallet" value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} placeholder="Enter wallet address" required />
          <label htmlFor="withdraw-network">Network (if applicable)</label>
          <select id="withdraw-network" value={network} onChange={(event) => setNetwork(event.target.value)} required>
            <option value="">-- Select Network --</option>
            {cryptoNetworks.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </>}

        {isBankMethod && <>
          <label htmlFor="withdraw-account-name">Account Name</label>
          <input id="withdraw-account-name" value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Account holder name" required />
          <label htmlFor="withdraw-account-number">Account Number</label>
          <input id="withdraw-account-number" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Account number" required />
          <label htmlFor="withdraw-routing-number">Routing Number</label>
          <input id="withdraw-routing-number" value={routingNumber} onChange={(event) => setRoutingNumber(event.target.value)} placeholder="Routing number" required />
          <label htmlFor="withdraw-bank-name">Bank Name</label>
          <input id="withdraw-bank-name" value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Bank name" required />
        </>}

        {isPayPalMethod && <>
          <label htmlFor="withdraw-paypal-email">PayPal Email</label>
          <input id="withdraw-paypal-email" type="email" value={paypalEmail} onChange={(event) => setPaypalEmail(event.target.value)} placeholder="example@paypal.com" required />
        </>}

        {usesCustomPayoutDetails && <>
          <label htmlFor="withdraw-payout-details">Payout Account Details</label>
          <input id="withdraw-payout-details" value={payoutDetails} onChange={(event) => setPayoutDetails(event.target.value)} placeholder="Account, username, email, or payment handle" required />
        </>}

        {methodName === "RiverTrade managed account" && <>
          <label htmlFor="withdraw-managed-account">Managed Account</label>
          <select id="withdraw-managed-account" value={managedAccount} onChange={(event) => setManagedAccount(event.target.value)} required>
            <option value="">-- Choose Account --</option>
            <option value="managed-growth">Managed Growth Account</option>
            <option value="managed-balanced">Managed Balanced Account</option>
          </select>
        </>}

        {withdrawalMethod && <div className="dashboard-deposit-details"><p>{methodOptionLabel(withdrawalMethod)}</p><small>{selectedInstructions || "Review the destination details before submitting your withdrawal request."}</small></div>}

        <button type="submit">Withdraw</button>
        {error && <p className="dashboard-withdraw-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
