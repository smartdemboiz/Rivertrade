"use client";

import { useEffect, useState } from "react";
import WithdrawalReceipt from "@/components/WithdrawalReceipt";
import { useAuthSession } from "@/hooks/useAuthSession";

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

function getSeenReceiptStages(storageKey) {
  try {
    const stages = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(stages) ? stages.filter(stage => typeof stage === "string") : [];
  } catch {
    return [];
  }
}

export default function DashboardWithdraw() {
  const { authenticated, ready, user } = useAuthSession();
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
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalReceipt, setWithdrawalReceipt] = useState(null);
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [methodsLoaded, setMethodsLoaded] = useState(false);

  const receiptStorageKey = user?.id ? `rivertrade-seen-withdrawal-receipts:${user.id}` : "";

  useEffect(() => {
    fetch("/api/withdrawal-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((body) => setWithdrawalMethods(body.data || []))
      .catch(() => setWithdrawalMethods([]))
      .finally(() => setMethodsLoaded(true));
  }, []);

  useEffect(() => {
    if (!ready || !authenticated || !user?.id || withdrawalReceipt) return undefined;

    let active = true;
    let checking = false;
    async function checkWithdrawalStatus() {
      if (checking) return;
      checking = true;
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/account/transactions", {
          headers: { Authorization: `****** || ""}` },
          cache: "no-store",
        });
        const body = await response.json();
        if (!active) return;
        if (!response.ok) throw new Error(body.error || "Unable to check withdrawal status.");

        const latestWithdrawal = (body.data || []).find(item => item.type === "withdrawal");
        if (!latestWithdrawal || !["pending", "approved", "rejected"].includes(latestWithdrawal.status)) return;
        const stage = `${latestWithdrawal.requestId}:${latestWithdrawal.status}`;
        if (!getSeenReceiptStages(receiptStorageKey).includes(stage)) setWithdrawalReceipt(latestWithdrawal);
      } catch (statusError) {
        if (active) setError(statusError.message || "Unable to check withdrawal status.");
      } finally {
        checking = false;
      }
    }

    void checkWithdrawalStatus();
    const timer = window.setInterval(() => { void checkWithdrawalStatus(); }, 10_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [authenticated, ready, receiptStorageKey, user?.id, withdrawalReceipt]);

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

  const submitWithdrawal = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const destinationDetails = isCryptoMethod
      ? { walletAddress, asset: currency }
      : isBankMethod
        ? { accountName, accountNumber, routingNumber, bankName }
        : isPayPalMethod
          ? { paypalEmail }
          : methodName === "RiverTrade managed account"
            ? { managedAccount }
            : { accountDetails: payoutDetails };

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `****** || ""}`,
        },
        body: JSON.stringify({
          amount,
          method: methodName,
          asset: assetName,
          network,
          destinationDetails,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to submit your withdrawal request.");

      const request = body.data;
      setWithdrawalReceipt({
        id: `withdrawal-${request.id}`,
        requestId: request.id,
        amount: request.amount,
        currency: request.currency,
        method: request.method,
        asset: request.asset,
        network: request.network,
        status: request.status,
        createdAt: request.created_at,
      });
      setAmount("");
      setError("");
    } catch (submitError) {
      setError(submitError.message || "Unable to submit your withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  const dismissWithdrawalReceipt = () => {
    if (!receiptStorageKey || !withdrawalReceipt) {
      setWithdrawalReceipt(null);
      return;
    }
    try {
      const stage = `${withdrawalReceipt.requestId}:${withdrawalReceipt.status}`;
      const seen = new Set(getSeenReceiptStages(receiptStorageKey));
      seen.add(stage);
      localStorage.setItem(receiptStorageKey, JSON.stringify([...seen]));
    } catch (storageError) {
      console.error("Unable to save seen withdrawal receipt state:", storageError);
    }
    setWithdrawalReceipt(null);
  };

  if (!methodsLoaded || withdrawalMethods.length === 0) {
    return (
      <section className="dashboard-withdraw" aria-labelledby="withdraw-title">
        <h2 id="withdraw-title">Withdraw Funds</h2>
        <p role="status">{methodsLoaded ? "No withdrawal methods are currently available." : "Loading available withdrawal methods…"}</p>
        <WithdrawalReceipt withdrawal={withdrawalReceipt} onClose={dismissWithdrawalReceipt} />
      </section>
    );
  }

  return (
    <section className="dashboard-withdraw" aria-labelledby="withdraw-title">
      <h2 id="withdraw-title">Withdraw Funds</h2>
      <form className="dashboard-withdraw-form" onSubmit={submitWithdrawal} aria-busy={submitting}>
        <label htmlFor="withdraw-amount">Amount (account currency)</label>
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

        <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Withdraw"}</button>
        {error && <p className="dashboard-withdraw-error" role="alert">{error}</p>}
      </form>
      <WithdrawalReceipt withdrawal={withdrawalReceipt} onClose={dismissWithdrawalReceipt} />
    </section>
  );
}
