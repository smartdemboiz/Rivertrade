"use client";

import { useEffect, useRef, useState } from "react";
import DepositSuccessReceipt from "@/components/DepositSuccessReceipt";
import { useAuthSession } from "@/hooks/useAuthSession";

const CRYPTO_PAYMENT_WINDOW_MS = 45 * 60 * 1000;
const CRYPTO_PAYMENT_WINDOW_KEY = "rivertrade-crypto-payment-window";

function receiptStorageKey(userId) {
  return `rivertrade-seen-deposit-receipts:${userId}`;
}

function getSeenDepositIds(userId) {
  try {
    const ids = JSON.parse(localStorage.getItem(receiptStorageKey(userId)) || "[]");
    return Array.isArray(ids) ? ids.filter(id => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export default function DashboardDeposit({ onAccountDataUpdate, onReturnToDashboard, purpose = "standard" }) {
  const { authenticated, ready, user } = useAuthSession();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cryptocurrency, setCryptocurrency] = useState("");
  const [network, setNetwork] = useState("");
  const [paymentWindowExpiresAt, setPaymentWindowExpiresAt] = useState(0);
  const [now, setNow] = useState(0);
  const [paypalReference, setPaypalReference] = useState("");
  const [paypalDetailsCopied, setPaypalDetailsCopied] = useState(false);
  const [bankDetailsCopied, setBankDetailsCopied] = useState(false);
  const [error, setError] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [depositReceipt, setDepositReceipt] = useState(null);
  const [approvalError, setApprovalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const checkingApprovalsRef = useRef(false);

  useEffect(() => {
    if (!ready || !authenticated || !user?.id || depositReceipt) return undefined;

    let active = true;
    async function checkDepositApprovals() {
      if (checkingApprovalsRef.current) return;
      checkingApprovalsRef.current = true;
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/account/transactions", {
          headers: { Authorization: `Bearer ${token || ""}` },
          cache: "no-store",
        });
        const body = await response.json();
        if (!active) return;
        if (!response.ok) {
          if (response.status === 401) {
            setApprovalError("");
            return;
          }
          throw new Error(body.error || "Unable to check deposit status.");
        }
        if (!active) return;

        const completedDeposits = (body.data || []).filter(transaction =>
          transaction.type === "deposit"
          && (
            transaction.status === "rejected"
            || (
              transaction.status === "confirmed"
              && transaction.creditedAmount !== null
              && transaction.creditedAmount !== undefined
            )
          ),
        );
        onAccountDataUpdate?.(body);

        const seenIds = getSeenDepositIds(user.id);
        const latestCompleted = completedDeposits[0];
        if (latestCompleted && !seenIds.includes(latestCompleted.id)) {
          setDepositReceipt(latestCompleted);
        }
        setApprovalError("");
      } catch (approvalCheckError) {
        if (active) setApprovalError(approvalCheckError.message || "Unable to check deposit status.");
      } finally {
        checkingApprovalsRef.current = false;
      }
    }

    void checkDepositApprovals();
    const timer = window.setInterval(() => { void checkDepositApprovals(); }, 10_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [authenticated, depositReceipt, onAccountDataUpdate, ready, user?.id]);

  const dismissDepositReceipt = () => {
    if (!user?.id) {
      setDepositReceipt(null);
      return;
    }

    try {
      const seenIds = new Set(getSeenDepositIds(user.id));
      seenIds.add(depositReceipt.id);
      localStorage.setItem(receiptStorageKey(user.id), JSON.stringify([...seenIds]));
    } catch (storageError) {
      console.error("Unable to save seen deposit receipt state:", storageError);
    }
    setDepositReceipt(null);
  };

  useEffect(() => {
    const initialClock = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialClock);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const restoreWindow = window.setTimeout(() => {
      try {
        const savedWindow = sessionStorage.getItem(CRYPTO_PAYMENT_WINDOW_KEY);
        if (!savedWindow) return;
        const selection = JSON.parse(savedWindow);
        if (!selection.asset || !selection.network || !Number.isFinite(selection.expiresAt)) {
          sessionStorage.removeItem(CRYPTO_PAYMENT_WINDOW_KEY);
          return;
        }
        setCryptocurrency(selection.asset);
        setNetwork(selection.network);
        setPaymentWindowExpiresAt(selection.expiresAt);
        setPaymentMethod("Cryptocurrency");
      } catch {
        sessionStorage.removeItem(CRYPTO_PAYMENT_WINDOW_KEY);
      }
    }, 0);
    return () => window.clearTimeout(restoreWindow);
  }, []);

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
    if (paymentMethod === "Cryptocurrency" && (!paymentWindowExpiresAt || paymentWindowExpiresAt <= Date.now())) {
      setError("This crypto payment window has expired. Select the network again to start a new 45-minute window.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSubmittedRequest(false);
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
          purpose,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to submit your deposit request.");

      setAmount("");
      setPaymentMethod("");
      setCryptocurrency("");
      setNetwork("");
      setPaymentWindowExpiresAt(0);
      sessionStorage.removeItem(CRYPTO_PAYMENT_WINDOW_KEY);
      setPaypalReference("");
      setSubmittedRequest(true);
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
  const cryptoWindowExpired = Boolean(paymentWindowExpiresAt && now >= paymentWindowExpiresAt);
  const cryptoWindowSecondsLeft = paymentWindowExpiresAt
    ? Math.max(0, Math.ceil((paymentWindowExpiresAt - now) / 1000))
    : 0;
  const walletAddress = !cryptoWindowExpired ? selectedCrypto?.value || "" : "";
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
        <h2 id="deposit-title">{purpose === "managed_account" ? "Add Funds to Managed Account" : "Deposit Funds"}</h2>
        <p role={settingsError ? "alert" : "status"}>{settingsError || (settingsLoaded ? "No deposit methods are currently available." : "Loading available deposit methods…")}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-deposit" aria-labelledby="deposit-title">
      <h2 id="deposit-title">{purpose === "managed_account" ? "Add Funds to Managed Account" : "Deposit Funds"}</h2>
      {purpose === "managed_account" && <p>After you send the payment, the investment team must verify and approve it before it is added to your managed account.</p>}
      {submittedRequest && <p className="managed-account-success" role="status">
        {purpose === "managed_account"
          ? "Your managed-account funding request was submitted. It will be added to the account after admin confirmation."
          : "Your deposit request was submitted."}
      </p>}
      <form className="dashboard-deposit-form" onSubmit={submitDeposit} aria-busy={submitting}>
        {approvalError && <p className="dashboard-deposit-error" role="status">{approvalError}</p>}
        <label htmlFor="deposit-amount">Amount {paymentMethod === "Cryptocurrency" ? cryptocurrency && `(${cryptocurrency})` : "(USD)"}</label>
        <input id="deposit-amount" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />

        <label htmlFor="deposit-method">Payment Method</label>
        <select id="deposit-method" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setPaypalReference(""); setError(""); }}>
          <option value="">-- Choose Payment Method --</option>
          {visiblePaymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <p className="dashboard-deposit-conversion-note">
          Once confirmed, your deposit is converted to your account currency using the live rate at confirmation.
        </p>

        {paymentMethod === "Cryptocurrency" && <>
          <label htmlFor="deposit-cryptocurrency">Cryptocurrency</label>
          <select id="deposit-cryptocurrency" value={cryptocurrency} onChange={(event) => { setCryptocurrency(event.target.value); setNetwork(""); setPaymentWindowExpiresAt(0); sessionStorage.removeItem(CRYPTO_PAYMENT_WINDOW_KEY); setError(""); }} required>
            <option value="">-- Choose Cryptocurrency --</option>
            {visibleCryptocurrencies.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="dashboard-deposit-details">
            <p>{cryptoWindowExpired
              ? "This crypto payment window has expired. Select the network again to start a new 45-minute window."
              : "Send the selected cryptocurrency on the selected network to this wallet address:"}</p>
            <code>{walletAddress || (cryptoWindowExpired
              ? "Payment details are no longer available for this window."
              : "Choose a network to view the matching wallet address.")}</code>
            <button type="button" disabled={!walletAddress} onClick={() => navigator.clipboard?.writeText(walletAddress)}>Copy address/details</button>
            {paymentWindowExpiresAt > 0 && <small
              className={cryptoWindowExpired ? "crypto-payment-expired" : "crypto-payment-countdown"}
              role={cryptoWindowExpired ? "status" : "timer"}
              aria-live={cryptoWindowExpired ? "polite" : "off"}
            >
              {cryptoWindowExpired
                ? "Payment option expired."
                : `Payment option expires in ${Math.floor(cryptoWindowSecondsLeft / 60)}:${String(cryptoWindowSecondsLeft % 60).padStart(2, "0")}.`}
            </small>}
            {cryptoWindowExpired && network && <button
              type="button"
              className="crypto-payment-restart"
              onClick={() => {
                const expiresAt = Date.now() + CRYPTO_PAYMENT_WINDOW_MS;
                setPaymentWindowExpiresAt(expiresAt);
                sessionStorage.setItem(CRYPTO_PAYMENT_WINDOW_KEY, JSON.stringify({
                  asset: cryptocurrency,
                  network,
                  expiresAt,
                }));
                setError("");
              }}
            >
              Start a new 45-minute payment window
            </button>}
            {selectedInstructions && <small>{selectedInstructions}</small>}
          </div>
          {!cryptocurrency && <p role="status">Choose a cryptocurrency above to see its available networks.</p>}
          <label htmlFor="deposit-network">Select Network</label>
          <select id="deposit-network" value={network} onChange={(event) => {
            const selectedNetwork = event.target.value;
            setNetwork(selectedNetwork);
            setError("");
            if (!selectedNetwork) {
              setPaymentWindowExpiresAt(0);
              sessionStorage.removeItem(CRYPTO_PAYMENT_WINDOW_KEY);
              return;
            }
            const expiresAt = Date.now() + CRYPTO_PAYMENT_WINDOW_MS;
            setPaymentWindowExpiresAt(expiresAt);
            sessionStorage.setItem(CRYPTO_PAYMENT_WINDOW_KEY, JSON.stringify({
              asset: cryptocurrency,
              network: selectedNetwork,
              expiresAt,
            }));
          }} required disabled={!visibleNetworks.length}>
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

        <button
          type="submit"
          disabled={submitting || (paymentMethod === "Cryptocurrency" && cryptoWindowExpired)}
          aria-live="polite"
        >
          {submitting ? "Submitting..." : "Submit deposit request"}
        </button>
        {error && <p className="dashboard-deposit-error" role="alert">{error}</p>}
      </form>
      <DepositSuccessReceipt
        deposit={depositReceipt}
        onReturnToDashboard={() => {
          dismissDepositReceipt();
          onReturnToDashboard?.();
        }}
      />
    </section>
  );
}
