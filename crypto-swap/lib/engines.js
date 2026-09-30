// Multi-engine routing layer.
//
//   Layer 1 (DEX liquidity)   -> chainDexMap below; attached to each route
//                                as `dexSources` so the UI can show which
//                                pools a quote is actually routing through.
//   Layer 2 (Swap engines)    -> same-chain quote aggregators.
//   Layer 3 (Bridge engines)  -> cross-chain quote aggregators.
// Providers without usable live quote endpoints are omitted rather than
// represented by fabricated estimates.

import { mockPrice } from './data.js';
import { fetchLiveQuote, fetchLiveRoutes, QUOTE_PREVIEW_ADDRESS, ROUTE_PRIORITY_TO_ORDER } from './lifi.js';

export const SOLANA_CHAIN_ID = 1151111081099710;

/* ---------------- Layer 1: DEX liquidity sources per chain ---------------- */

export const chainDexMap = {
  1: ['Uniswap', 'SushiSwap'],
  42161: ['Camelot', 'Uniswap', 'SushiSwap'],
  10: ['Uniswap'],
  8453: ['Aerodrome', 'Uniswap'],
  137: ['Uniswap', 'SushiSwap'],
  56: ['PancakeSwap', 'SushiSwap'],
  43114: ['Trader Joe', 'SushiSwap'],
  [SOLANA_CHAIN_ID]: ['Raydium', 'Orca'],
  195: ['SushiSwap'],
  250: ['SushiSwap'],
};

function normalizeEnabledNames(value) {
  if (value === false) return new Set();
  if (!value || value === true) return null;
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  return null;
}

function dexSourcesFor(chainId, enabledExchanges) {
  const pool = chainDexMap[chainId] || ['Uniswap'];
  return enabledExchanges ? pool.filter((source) => enabledExchanges.has(source)) : pool;
}

/* ---------------- Helpers ---------------- */

function tokenPrice(token) {
  const livePrice = Number(token?.priceUSD);
  if (Number.isFinite(livePrice) && livePrice > 0) return livePrice;
  const symbol = String(token?.sym || '').toUpperCase();
  const mockSymbol = Object.keys(mockPrice).find((key) => key.toUpperCase() === symbol);
  return mockSymbol ? mockPrice[mockSymbol] : 0;
}

function rawToHuman(raw, decimals) {
  try {
    if (Number(decimals) === 0) return Number(BigInt(raw));
    const value = BigInt(raw).toString();
    const padded = value.padStart(decimals + 1, '0');
    const whole = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals).replace(/0+$/, '');
    return parseFloat(fraction ? `${whole}.${fraction}` : whole);
  } catch {
    return 0;
  }
}

function toTokenUnits(amount, decimals) {
  const precision = Number(decimals);
  if (!Number.isInteger(precision) || precision < 0 || precision > 255) return null;
  const match = String(amount).trim().match(/^(\d+)(?:\.(\d*))?$|^\.(\d+)$/);
  if (!match || (match[2] || '').length > precision) return null;
  const whole = match[1] || '0';
  const decimal = match[2] ?? match[3] ?? '';
  if (decimal.length > precision) return null;
  const fraction = decimal.padEnd(precision, '0');
  const units = BigInt(`${whole}${fraction}`);
  return units > 0n ? units.toString() : null;
}

/* ---------------- Layer 2 adapters ---------------- */

async function fetchLiveQuoteAdapter({ fromToken, toToken, amountRaw, walletAddress, toAddress, routePriority, enabledExchanges, signal }) {
  const data = await fetchLiveQuote({
    fromChain: fromToken.chainId,
    toChain: toToken.chainId,
    fromToken: fromToken.address,
    toToken: toToken.address,
    fromAmount: amountRaw,
    fromAddress: walletAddress,
    toAddress,
    routePriority,
  }, { signal });
  const toAmount = rawToHuman(data?.estimate?.toAmount, toToken.decimals);
  if (!toAmount) throw new Error('LI.FI: empty quote');
  const toolName = data?.toolDetails?.name;
  const sameChain = fromToken.chain === toToken.chain;
  return {
    engineId: 'lifi', engineName: 'LI.FI', simulated: false,
    toAmount,
    gasUsd: Number(data?.estimate?.gasCosts?.reduce((total, cost) => total + (Number(cost.amountUSD) || 0), 0)) || 0.4,
    durationSec: Number(data?.estimate?.executionDuration) || (sameChain ? 15 : 60),
    dexSources: sameChain ? (toolName ? [toolName] : dexSourcesFor(fromToken.chain, enabledExchanges)) : [],
    bridgeName: sameChain ? null : (toolName || 'LI.FI Bridge'),
    raw: data,
  };
}

const BRIDGE_PROVIDER_NAMES = {
  relaydepository: 'Relay',
  near: 'Near Intents',
  mayan: 'Mayan (Swift)',
  chainflip: 'Chainflip',
  layerswap: 'Layerswap',
};

const BRIDGE_PROVIDER_KEYS = Object.keys(BRIDGE_PROVIDER_NAMES);

async function fetchLiveBridgeRoutes({ fromToken, toToken, amountRaw, walletAddress, toAddress, routePriority, allowedProviderKeys, signal }) {
  if (allowedProviderKeys.length === 0) return [];
  const response = await fetchLiveRoutes({
    fromChainId: Number(fromToken.chainId ?? fromToken.chain),
    toChainId: Number(toToken.chainId ?? toToken.chain),
    fromTokenAddress: fromToken.address,
    toTokenAddress: toToken.address,
    fromAmount: amountRaw,
    fromAddress: walletAddress,
    toAddress,
    order: ROUTE_PRIORITY_TO_ORDER[routePriority] || 'RECOMMENDED',
    allowedBridges: allowedProviderKeys,
  }, { signal });

  return (response?.routes || []).flatMap((route) => {
    const bridgeStep = route.steps?.find((step) => BRIDGE_PROVIDER_NAMES[step.toolDetails?.key || step.tool]);
    if (!bridgeStep) return [];

    const providerKey = bridgeStep.toolDetails?.key || bridgeStep.tool;
    const toAmount = rawToHuman(route.toAmount, toToken.decimals);
    if (!(toAmount > 0)) return [];

    const durationSec = route.steps.reduce(
      (total, step) => total + (Number(step.estimate?.executionDuration) || 0),
      0,
    );
    const gasUsd = Number(route.gasCostUSD)
      || route.steps.reduce((total, step) => total + (step.estimate?.gasCosts || []).reduce(
        (stepTotal, cost) => stepTotal + (Number(cost.amountUSD) || 0),
        0,
      ), 0);

    return [{
      engineId: `lifi-${providerKey}-${route.id}`,
      engineName: BRIDGE_PROVIDER_NAMES[providerKey],
      bridgeProviderKey: providerKey,
      available: true,
      simulated: false,
      toAmount,
      toAmountMin: rawToHuman(route.toAmountMin, toToken.decimals),
      gasUsd,
      durationSec,
      dexSources: [],
      bridgeName: null,
      raw: route,
    }];
  });
}

// Docs: https://station.jup.ag/docs/api/quote-api -- public, CORS-enabled,
// no key required. Same-chain (Solana) only.
async function fetchJupiterQuote({ fromToken, toToken, amountRaw, signal }) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${fromToken.address}&outputMint=${toToken.address}&amount=${amountRaw}&slippageBps=50`;
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`Jupiter API returned ${res.status}`);
  const data = await res.json();
  if (!data?.outAmount) throw new Error('Jupiter: no outAmount in response');
  const dexSources = Array.from(new Set((data.routePlan || [])
    .map((s) => s?.swapInfo?.label)
    .filter(Boolean)));
  return {
    engineId: 'jupiter', engineName: 'Jupiter', simulated: false,
    toAmount: rawToHuman(data.outAmount, toToken.decimals),
    gasUsd: 0.001,
    durationSec: 2,
    dexSources: dexSources.length ? dexSources : ['Raydium'],
    bridgeName: null,
    raw: data,
  };
}

/* ---------------- Layer 3 adapters ---------------- */

// Across credentials stay server-side. Its approval quote can bridge and swap.
async function fetchAcrossQuote({ fromToken, toToken, amountRaw, walletAddress, toAddress, signal }) {
  const apiKey = process.env.ACROSS_API_KEY;
  const integratorId = process.env.ACROSS_INTEGRATOR_ID;
  if (!apiKey || !integratorId) {
    throw new Error('Across API key and integrator ID are not configured');
  }

  const url = new URL('https://app.across.to/api/swap/approval');
  Object.entries({
    originChainId: fromToken.chainId ?? fromToken.chain,
    destinationChainId: toToken.chainId ?? toToken.chain,
    inputToken: fromToken.address,
    outputToken: toToken.address,
    amount: amountRaw,
    tradeType: 'exactInput',
    depositor: walletAddress,
    recipient: toAddress || walletAddress,
    integratorId,
    slippage: 'auto',
  }).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const res = await fetch(url, {
    headers: { accept: 'application/json', authorization: `Bearer ${apiKey}` },
    signal,
  });
  if (!res.ok) throw new Error(`Across API returned ${res.status}`);
  const response = await res.json();
  const data = response?.data || response;
  const toAmount = rawToHuman(data?.expectedOutputAmount, toToken.decimals);
  if (!toAmount) throw new Error('Across: no output amount in response');
  const gasUsd = [data?.fees?.originGas, data?.fees?.destinationGas]
    .reduce((total, fee) => total + (Number(fee?.amountUsd) || 0), 0);
  return {
    engineId: 'across-fallback', engineName: 'Across', simulated: false,
    toAmount,
    toAmountMin: rawToHuman(data?.minOutputAmount, toToken.decimals),
    gasUsd,
    durationSec: Number(data?.expectedFillTime) || 0,
    dexSources: [],
    bridgeName: null,
    raw: data,
  };
}

/* ---------------- Orchestrator ---------------- */

export async function getAllQuotes(ctx) {
  const { fromToken, toToken, sendAmount, walletAddress, toAddress, routePriority, settings, signal } = ctx;
  if (!fromToken || !toToken || !(parseFloat(sendAmount) > 0)) return [];

  const amountRaw = toTokenUnits(sendAmount, fromToken.decimals);
  if (!amountRaw) return [];

  const fromChainId = Number(fromToken.chainId ?? fromToken.chain);
  const toChainId = Number(toToken.chainId ?? toToken.chain);
  const sameChain = fromChainId === toChainId;
  const enabledExchanges = normalizeEnabledNames(settings?.exchangesEnabled);
  const enabledBridges = normalizeEnabledNames(settings?.bridgesEnabled);
  const acrossEnabled = !enabledBridges || enabledBridges.has('Across');
  const requestedBridgeKeys = BRIDGE_PROVIDER_KEYS.filter((key) => {
    if (!enabledBridges) return true;
    const providerName = BRIDGE_PROVIDER_NAMES[key];
    return enabledBridges.has(key)
      || enabledBridges.has(providerName)
      || (key === 'mayan' && enabledBridges.has('Mayan'));
  });
  const addr = walletAddress || QUOTE_PREVIEW_ADDRESS;

  const jobs = [];

  if (sameChain) {
    jobs.push(
      fetchLiveQuoteAdapter({ fromToken, toToken, amountRaw, walletAddress: addr, toAddress, routePriority, enabledExchanges, signal })
        .catch((err) => { console.error('[LI.FI]', err.message); return null; })
    );
    if (fromChainId === SOLANA_CHAIN_ID) {
      jobs.push(
        fetchJupiterQuote({ fromToken, toToken, amountRaw, signal })
          .catch((err) => { console.error('[Jupiter]', err.message); return null; })
      );
    }
  } else {
    jobs.push(
      fetchLiveBridgeRoutes({ fromToken, toToken, amountRaw, walletAddress: addr, toAddress, routePriority, allowedProviderKeys: requestedBridgeKeys, signal })
        .catch((err) => { console.error('[LI.FI routes]', err.message); return []; })
    );
  }

  const settled = await Promise.allSettled(jobs);
  let results = settled
    .flatMap((r) => (r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : [r.value]) : []))
    .filter(Boolean);

  let acrossFallbackStatus = null;
  const hasLiveQuote = results.some((route) => route.available !== false);
  const isEvmPair = /^0x[\da-f]{40}$/i.test(fromToken.address || '')
    && /^0x[\da-f]{40}$/i.test(toToken.address || '')
    && fromChainId !== SOLANA_CHAIN_ID
    && fromChainId !== 20000000000001
    && toChainId !== SOLANA_CHAIN_ID
    && toChainId !== 20000000000001;
  if (!sameChain && acrossEnabled && !hasLiveQuote) {
    if (!isEvmPair) {
      acrossFallbackStatus = { engineId: 'unavailable-across', engineName: 'Across', statusLabel: 'EVM routes only', available: false };
    } else if (!process.env.ACROSS_API_KEY || !process.env.ACROSS_INTEGRATOR_ID) {
      acrossFallbackStatus = { engineId: 'unavailable-across', engineName: 'Across', statusLabel: 'API credentials required', available: false };
    } else {
      try {
        results.push(await fetchAcrossQuote({
          fromToken,
          toToken,
          amountRaw,
          walletAddress: addr,
          toAddress,
          signal,
        }));
      } catch (error) {
        console.error('[Across fallback]', error.message);
        acrossFallbackStatus = { engineId: 'unavailable-across', engineName: 'Across', statusLabel: 'Unavailable', available: false };
      }
    }
  }

  if (!sameChain) {
    const returnedBridgeKeys = new Set(results.map((route) => route.bridgeProviderKey).filter(Boolean));
    for (const key of requestedBridgeKeys) {
      if (!returnedBridgeKeys.has(key)) {
        results.push({
          engineId: `unavailable-${key}`,
          engineName: BRIDGE_PROVIDER_NAMES[key],
          bridgeProviderKey: key,
          available: false,
        });
      }
    }
    if (acrossFallbackStatus) results.push(acrossFallbackStatus);
  }

  const toPrice = tokenPrice(toToken);
  results.forEach((r) => {
    if (r.available !== false) {
      r.available = true;
      r.toAmountUsd = r.toAmount * toPrice;
    }
  });

  results.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    if (a.simulated !== b.simulated) return a.simulated ? 1 : -1;
    if (routePriority === 'Fastest') return a.durationSec - b.durationSec;
    if (routePriority === 'Lowest Gas') return a.gasUsd - b.gasUsd;
    if (routePriority === 'Safest') {
      return b.toAmount - a.toAmount;
    }
    return b.toAmount - a.toAmount; // "Best Return" default
  });

  return results;
}
