"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { tokens } from "@/crypto-swap/lib/data";
import ConnectWalletModal from "@/crypto-swap/components/ConnectWalletModal";
import { getAuthToken } from "@/hooks/useAuthSession";

const supportedChains = new Map([
  [1, "Ethereum"],
  [8453, "Base"],
  [42161, "Arbitrum"],
]);
const supportedTokens = tokens.filter(token => supportedChains.has(Number(token.chainId)));
const nativeTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const supportedChainIds = new Set(supportedChains.keys());
const walletConnectRpc = { 8453: "https://mainnet.base.org" };
const explorerUrls = {
  1: "https://etherscan.io/tx/",
  8453: "https://basescan.org/tx/",
  42161: "https://arbiscan.io/tx/",
};

function toTokenUnits(value, decimals) {
  const normalized = String(value).trim();
  const match = normalized.match(/^(\d+)(?:\.(\d*))?$|^\.(\d+)$/);
  if (!match) throw new Error("Enter a valid token amount.");
  const whole = match[1] || "0";
  const fraction = match[2] ?? match[3] ?? "";
  if (fraction.length > decimals) throw new Error(`This token supports at most ${decimals} decimal places.`);
  const units = BigInt(`${whole}${fraction.padEnd(decimals, "0")}`);
  if (units <= 0n) throw new Error("Enter an amount greater than zero.");
  return units.toString();
}

function fromTokenUnits(value, decimals) {
  const units = BigInt(value || "0");
  const scale = 10n ** BigInt(decimals);
  const whole = units / scale;
  const fraction = (units % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function formatTokenAmount(value, currency) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(amount)} ${currency}`
    : `— ${currency}`;
}

function isNativeToken(token) {
  return token?.address?.toLowerCase() === nativeTokenAddress;
}

function padAddress(address) {
  if (!/^0x[a-f0-9]{40}$/i.test(address)) throw new Error("The wallet or token address is invalid.");
  return address.slice(2).toLowerCase().padStart(64, "0");
}

function toRpcQuantity(value) {
  if (typeof value === "string" && /^0x[0-9a-f]+$/i.test(value)) return value;
  try {
    return `0x${BigInt(value || "0").toString(16)}`;
  } catch {
    throw new Error("The live swap route returned an invalid transaction value.");
  }
}

async function waitForReceipt(provider, hash) {
  const timeoutAt = Date.now() + 120_000;
  while (Date.now() < timeoutAt) {
    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [hash],
    });
    if (receipt) {
      if (receipt.status && BigInt(receipt.status) !== 1n) {
        throw new Error(`Transaction ${hash} reverted on-chain.`);
      }
      return receipt;
    }
    await new Promise(resolve => window.setTimeout(resolve, 3000));
  }
  throw new Error(`Transaction confirmation timed out. Check the wallet explorer for ${hash}.`);
}

async function fetchLiveQuote({ fromToken, toToken, amount, walletAddress }) {
  const fromAmount = toTokenUnits(amount, fromToken.decimals);
  const params = new URLSearchParams({
    fromChain: String(fromToken.chainId),
    toChain: String(toToken.chainId),
    fromToken: fromToken.address,
    toToken: toToken.address,
    fromAmount,
    fromAddress: walletAddress,
    toAddress: walletAddress,
  });
  const response = await fetch(`/api/quote?${params.toString()}`, { cache: "no-store" });
  const body = await response.json();
  if (!response.ok || !body.quote) {
    throw new Error(body.error || "No live swap quote is currently available for this pair.");
  }
  if (!body.quote.transactionRequest?.to || !body.quote.transactionRequest?.data) {
    throw new Error("The quote provider did not return an executable wallet transaction.");
  }
  return { quote: body.quote, fromAmount };
}

export default function DashboardSwapCrypto() {
  const [fromTokenId, setFromTokenId] = useState("eth-base");
  const [toTokenId, setToTokenId] = useState("usdc-base");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletChainId, setWalletChainId] = useState(null);
  const [walletBalance, setWalletBalance] = useState("");
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapError, setSwapError] = useState("");
  const [swapStatus, setSwapStatus] = useState("");
  const [executing, setExecuting] = useState(false);
  const [swaps, setSwaps] = useState([]);
  const [historyError, setHistoryError] = useState("");

  const fromToken = useMemo(
    () => supportedTokens.find(token => token.id === fromTokenId),
    [fromTokenId],
  );
  const toToken = useMemo(
    () => supportedTokens.find(token => token.id === toTokenId),
    [toTokenId],
  );
  const pairValid = Boolean(fromToken && toToken && fromToken.id !== toToken.id);
  const walletOnSourceChain = walletChainId === Number(fromToken?.chainId);
  const formattedToAmount = quote?.estimate?.toAmount
    ? fromTokenUnits(quote.estimate.toAmount, toToken.decimals)
    : "";
  const formattedMinimumToAmount = quote?.estimate?.toAmountMin
    ? fromTokenUnits(quote.estimate.toAmountMin, toToken.decimals)
    : "";
  const swapDisabledReason = !pairValid
    ? "Choose two different supported assets."
    : quoteLoading
      ? "Waiting for a live LI.FI route quote…"
      : !quote
        ? quoteError || "Enter an amount to request a live LI.FI route quote."
        : "";

  const refreshWalletBalance = useCallback(async () => {
    if (!walletAddress || !fromToken || !walletProvider?.request) {
      setWalletBalance("");
      return;
    }
    setWalletBalanceLoading(true);
    try {
      const chainId = Number.parseInt(await walletProvider.request({ method: "eth_chainId" }), 16);
      setWalletChainId(chainId);
      if (chainId !== Number(fromToken.chainId)) {
        setWalletBalance("");
        return;
      }
      const balance = isNativeToken(fromToken)
        ? await walletProvider.request({
            method: "eth_getBalance",
            params: [walletAddress, "latest"],
          })
        : await walletProvider.request({
            method: "eth_call",
            params: [{
              to: fromToken.address,
              data: `0x70a08231${padAddress(walletAddress)}`,
            }, "latest"],
          });
      setWalletBalance(fromTokenUnits(balance, fromToken.decimals));
    } catch (balanceError) {
      setWalletBalance("");
      setSwapError(balanceError.message || "Unable to read this wallet balance.");
    } finally {
      setWalletBalanceLoading(false);
    }
  }, [fromToken, walletAddress, walletProvider]);

  const loadSwapHistory = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setSwaps([]);
        setHistoryError("");
        return;
      }
      const response = await fetch("/api/account/swaps", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setSwaps([]);
          setHistoryError("");
          return;
        }
        throw new Error(body.error || "Unable to load recent swaps.");
      }
      setSwaps(body.data || []);
      setHistoryError("");
    } catch (error) {
      setHistoryError(error.message || "Unable to load recent swaps.");
    }
  }, []);

  useEffect(() => {
    if (!walletAddress || !fromToken || !toToken || !amount || !pairValid) {
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setQuoteLoading(true);
      setQuote(null);
      setQuoteError("");
      try {
        const result = await fetchLiveQuote({ fromToken, toToken, amount, walletAddress });
        if (active) setQuote(result.quote);
      } catch (error) {
        if (active) setQuoteError(error.message || "Unable to get a live swap quote.");
      } finally {
        if (active) setQuoteLoading(false);
      }
    }, 500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [amount, fromToken, pairValid, toToken, walletAddress]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshWalletBalance(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshWalletBalance]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadSwapHistory(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSwapHistory]);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider?.request) return undefined;
    let active = true;
    provider.request({ method: "eth_accounts" }).then(accounts => {
      if (active && accounts?.[0]) {
        setWalletName("Browser wallet");
        setWalletProvider(provider);
        setWalletAddress(accounts[0]);
      }
    }).catch(() => {});
    provider.request({ method: "eth_chainId" }).then(chainId => {
      if (active) setWalletChainId(Number.parseInt(chainId, 16));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!walletProvider?.request) return undefined;
    let active = true;
    walletProvider.request({ method: "eth_accounts" }).then(accounts => {
      if (active && accounts?.[0]) setWalletAddress(accounts[0]);
    }).catch(() => {});
    walletProvider.request({ method: "eth_chainId" }).then(chainId => {
      if (active) setWalletChainId(Number.parseInt(chainId, 16));
    }).catch(() => {});
    const handleAccounts = accounts => {
      setWalletAddress(accounts?.[0] || "");
      if (!accounts?.[0]) {
        setWalletProvider(null);
        setWalletName("");
        setWalletChainId(null);
      }
      setQuote(null);
      setQuoteError("");
      setQuoteLoading(false);
    };
    const handleChain = chainId => {
      setWalletChainId(Number.parseInt(chainId, 16));
      setQuote(null);
    };
    const handleDisconnect = () => {
      setWalletAddress("");
      setWalletName("");
      setWalletProvider(null);
      setWalletChainId(null);
      setWalletBalance("");
      setQuote(null);
    };
    walletProvider.on?.("accountsChanged", handleAccounts);
    walletProvider.on?.("chainChanged", handleChain);
    walletProvider.on?.("disconnect", handleDisconnect);
    return () => {
      active = false;
      walletProvider.removeListener?.("accountsChanged", handleAccounts);
      walletProvider.removeListener?.("chainChanged", handleChain);
      walletProvider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [walletProvider]);

  const handleWalletConnect = useCallback((name, address, provider) => {
    if (typeof address !== "string" || !/^0x[a-f0-9]{40}$/i.test(address)
      || !provider?.request) {
      setSwapError("This wallet connection cannot sign EVM transactions. Choose a supported EVM wallet.");
      return;
    }
    setWalletName(name || "EVM wallet");
    setWalletProvider(provider);
    setWalletAddress(address);
    setWalletModalOpen(false);
    setSwapError("");
    setQuote(null);
    setQuoteError("");
    setSwapStatus("");
  }, []);

  async function disconnectWallet() {
    if (walletName === "WalletConnect") {
      try {
        await walletProvider?.disconnect?.();
      } catch (error) {
        setSwapError(error.message || "Unable to disconnect this wallet session.");
        return;
      }
    }
    setWalletAddress("");
    setWalletName("");
    setWalletProvider(null);
    setWalletChainId(null);
    setWalletBalance("");
    setQuote(null);
    setSwapError("");
    setSwapStatus("");
  }

  async function switchToSourceNetwork() {
    if (!walletProvider?.request || !fromToken) return;
    setSwapError("");
    try {
      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(fromToken.chainId).toString(16)}` }],
      });
    } catch (error) {
      setSwapError(error.code === 4902
        ? `${supportedChains.get(Number(fromToken.chainId))} is not configured in this wallet. Add the network using your wallet's network settings.`
        : error.message || "Unable to switch the wallet to the source network.");
    }
  }

  function switchDirection() {
    setFromTokenId(toTokenId);
    setToTokenId(fromTokenId);
    setQuote(null);
    setQuoteError("");
    setQuoteLoading(false);
    setSwapError("");
    setSwapStatus("");
  }

  async function submitSwap(event) {
    event.preventDefault();
    if (!pairValid || !walletAddress || !supportedChainIds.has(Number(fromToken.chainId))
      || !supportedChainIds.has(Number(toToken.chainId))) return;

    setExecuting(true);
    setSwapError("");
    setSwapStatus("");
    try {
      const provider = walletProvider;
      if (!provider?.request) throw new Error("Connect an EVM wallet before swapping.");

      let currentChainId = Number.parseInt(await provider.request({ method: "eth_chainId" }), 16);
      if (currentChainId !== Number(fromToken.chainId)) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${Number(fromToken.chainId).toString(16)}` }],
        });
        currentChainId = Number.parseInt(await provider.request({ method: "eth_chainId" }), 16);
        if (currentChainId !== Number(fromToken.chainId)) {
          throw new Error("Switch your wallet to the selected source network, then try again.");
        }
      }
      const accounts = await provider.request({ method: "eth_accounts" });
      if (!accounts?.[0] || accounts[0].toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error("The connected wallet account changed. Reconnect before swapping.");
      }

      let { quote: freshQuote, fromAmount } = await fetchLiveQuote({
        fromToken, toToken, amount, walletAddress,
      });
      const received = fromTokenUnits(freshQuote.estimate.toAmount, toToken.decimals);
      const minReceived = fromTokenUnits(freshQuote.estimate.toAmountMin || freshQuote.estimate.toAmount, toToken.decimals);
      const routeProvider = freshQuote.toolDetails?.name || freshQuote.tool || "LI.FI";
      if (!window.confirm(
        `Send ${amount} ${fromToken.sym} on ${supportedChains.get(Number(fromToken.chainId))} to receive an estimated ${received} ${toToken.sym} on ${supportedChains.get(Number(toToken.chainId))} (minimum estimate ${minReceived} ${toToken.sym}) through ${routeProvider}? Blockchain transactions are irreversible; review the wallet transaction before approving.`,
      )) return;

      if (!isNativeToken(fromToken)) {
        const spender = freshQuote.estimate?.approvalAddress;
        if (!spender || !/^0x[a-f0-9]{40}$/i.test(spender)) {
          throw new Error("The live route did not provide a valid token-approval address.");
        }
        const allowanceData = `0xdd62ed3e${padAddress(walletAddress)}${padAddress(spender)}`;
        const allowance = BigInt(await provider.request({
          method: "eth_call",
          params: [{ to: fromToken.address, data: allowanceData }, "latest"],
        }));
        if (allowance < BigInt(fromAmount)) {
          if (allowance > 0n) {
            const resetHash = await provider.request({
              method: "eth_sendTransaction",
              params: [{
                from: walletAddress,
                to: fromToken.address,
                data: `0x095ea7b3${padAddress(spender)}${"0".repeat(64)}`,
                value: "0x0",
              }],
            });
            setSwapStatus("Waiting for the token-allowance reset to confirm…");
            await waitForReceipt(provider, resetHash);
          }

          const approveData = `0x095ea7b3${padAddress(spender)}${BigInt(fromAmount).toString(16).padStart(64, "0")}`;
          const approvalHash = await provider.request({
            method: "eth_sendTransaction",
            params: [{
              from: walletAddress,
              to: fromToken.address,
              data: approveData,
              value: "0x0",
            }],
          });
          setSwapStatus("Waiting for the exact token allowance to confirm…");
          await waitForReceipt(provider, approvalHash);
          ({ quote: freshQuote, fromAmount } = await fetchLiveQuote({
            fromToken, toToken, amount, walletAddress,
          }));
        }
      }

      const transaction = freshQuote.transactionRequest;
      if (!/^0x[a-f0-9]{40}$/i.test(transaction.to || "")
        || typeof transaction.data !== "string"
        || !/^0x[0-9a-f]*$/i.test(transaction.data)) {
        throw new Error("The refreshed swap route returned an invalid wallet transaction.");
      }
      const transactionRequest = {
        from: walletAddress,
        to: transaction.to,
        data: transaction.data,
        value: toRpcQuantity(transaction.value),
      };
      if (transaction.gasLimit) transactionRequest.gas = toRpcQuantity(transaction.gasLimit);
      if (transaction.gasPrice) transactionRequest.gasPrice = toRpcQuantity(transaction.gasPrice);

      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });
      setSwapStatus(`Transaction sent. Waiting for ${supportedChains.get(Number(fromToken.chainId))} confirmation…`);
      await waitForReceipt(provider, transactionHash);

      const token = await getAuthToken();
      if (!token) throw new Error(`The wallet transaction confirmed (${transactionHash}), but your session expired before the history record could be saved.`);
      const recordResponse = await fetch("/api/account/swaps", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset: fromToken.sym,
          toAsset: toToken.sym,
          fromAmount: amount,
          toAmount: fromTokenUnits(freshQuote.estimate.toAmount, toToken.decimals),
          fromChainId: fromToken.chainId,
          toChainId: toToken.chainId,
          txHash: transactionHash,
          walletAddress,
          routeProvider,
        }),
      });
      const recordBody = await recordResponse.json();
      if (!recordResponse.ok) {
        throw new Error(`${recordBody.error || "Swap history could not be saved."} Transaction hash: ${transactionHash}`);
      }

      setSwapStatus(`Source transaction confirmed. ${fromToken.chainId === toToken.chainId ? "Swap completed on-chain." : "Cross-chain destination settlement is pending."} Recorded as pending settlement until verified. Transaction: ${transactionHash}`);
      setAmount("");
      setQuote(null);
      await Promise.all([loadSwapHistory(), refreshWalletBalance()]);
    } catch (error) {
      const message = error.message || "Unable to submit the wallet swap.";
      setSwapError(error.code === 4001 || /user rejected/i.test(message) ? "The wallet request was rejected. No swap was submitted." : message);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <section className="dashboard-swap" aria-labelledby="swap-title">
      <h2 id="swap-title">Wallet Swap</h2>
      <div className="dashboard-swap-balances">
        <div className="dashboard-swap-available">
          <span>Connected wallet</span>
          <strong>{walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Not connected"}</strong>
        </div>
        {walletAddress && fromToken && (
          <span>
            {walletBalanceLoading
              ? "Loading wallet balance…"
              : walletOnSourceChain && walletBalance
                ? `Available ${fromToken.sym}: ${formatTokenAmount(walletBalance, fromToken.sym)}`
                : `Switch wallet to ${supportedChains.get(Number(fromToken.chainId))} to view ${fromToken.sym} balance`}
          </span>
        )}
        {walletAddress && <span>{walletName}</span>}
        {!walletAddress && <button type="button" onClick={() => setWalletModalOpen(true)}>Connect wallet</button>}
        {walletAddress && <button type="button" onClick={disconnectWallet}>Disconnect</button>}
      </div>

      <form onSubmit={submitSwap}>
        <div className="dashboard-swap-pair">
          <label htmlFor="swap-from-token">From
            <select id="swap-from-token" value={fromTokenId} onChange={event => { setFromTokenId(event.target.value); setQuote(null); setQuoteError(""); setQuoteLoading(false); setSwapError(""); setSwapStatus(""); }}>
              {supportedTokens.map(token => (
                <option key={token.id} value={token.id}>
                  {supportedChains.get(Number(token.chainId))} · {token.sym}
                </option>
              ))}
            </select>
          </label>
          <button className="dashboard-swap-switch" type="button" onClick={switchDirection} aria-label="Swap source and destination">
            <ArrowLeftRight size={20} />
          </button>
          <label htmlFor="swap-to-token">To
            <select id="swap-to-token" value={toTokenId} onChange={event => { setToTokenId(event.target.value); setQuote(null); setQuoteError(""); setQuoteLoading(false); setSwapError(""); setSwapStatus(""); }}>
              {supportedTokens.map(token => (
                <option key={token.id} value={token.id}>
                  {supportedChains.get(Number(token.chainId))} · {token.sym}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="dashboard-swap-amount" htmlFor="swap-amount">Amount to swap ({fromToken?.sym})
          <input id="swap-amount" type="number" min="0" step="any" value={amount} onChange={event => { setAmount(event.target.value); setQuote(null); setQuoteError(""); setQuoteLoading(false); setSwapError(""); setSwapStatus(""); }} placeholder="Enter amount" required />
        </label>
        {walletAddress && fromToken && walletChainId !== Number(fromToken.chainId) && (
          <button type="button" onClick={switchToSourceNetwork}>
            Switch wallet to {supportedChains.get(Number(fromToken.chainId))}
          </button>
        )}
        {quoteLoading && <p role="status">Getting a live route quote…</p>}
        {quoteError && <p className="dashboard-deposit-error" role="alert">{quoteError}</p>}
        {quote && (
          <div className="dashboard-swap-preview">
            <p>Estimated receive: {formatTokenAmount(formattedToAmount, toToken.sym)}</p>
            <p>Minimum estimate: {formatTokenAmount(formattedMinimumToAmount, toToken.sym)}</p>
            <p>Route: {quote.toolDetails?.name || quote.tool || "LI.FI"} · quote is refreshed before sending.</p>
          </div>
        )}
        {swapError && <p className="dashboard-deposit-error" role="alert">{swapError}</p>}
        {swapStatus && <p role="status">{swapStatus}</p>}
        <button className="dashboard-swap-submit" type="submit" disabled={!walletAddress || !pairValid || !quote || quoteLoading || executing}>
          {executing ? "Processing wallet transaction…" : "Review and Execute Swap"}
        </button>
        {walletAddress && !executing && swapDisabledReason && <p role="status">{swapDisabledReason}</p>}
      </form>

      <div className="dashboard-recent-swaps">
        <h3>Recent wallet swaps</h3>
        {historyError && <p role="alert">{historyError}</p>}
        {swaps.length ? (
          <ul>
            {swaps.map(swap => (
              <li key={swap.id}>
                <span>{formatTokenAmount(swap.fromAmount, swap.fromAsset)} → {formatTokenAmount(swap.toAmount, swap.toAsset)}</span>
                <span>{supportedChains.get(Number(swap.fromChainId)) || "Network"} to {supportedChains.get(Number(swap.toChainId)) || "Network"} · {swap.status}</span>
                {swap.txHash && <a href={`${explorerUrls[swap.fromChainId]}${swap.txHash}`} target="_blank" rel="noreferrer">View source transaction</a>}
              </li>
            ))}
          </ul>
        ) : !historyError && <p>No wallet swaps recorded yet.</p>}
      </div>
      {walletModalOpen && (
        <ConnectWalletModal
          providerOnly
          retainProvider
          additionalRpc={walletConnectRpc}
          onClose={() => setWalletModalOpen(false)}
          onConnect={handleWalletConnect}
        />
      )}
    </section>
  );
}
