// Direct REST calls to LI.FI's public API (https://li.quest/v1).
// Endpoint URLs/params follow LI.FI's documented examples (docs.li.fi).
// Worth a quick sanity check against https://docs.li.fi/api-reference
// before relying on it for anything moving real funds.

const API_BASE = 'https://li.quest/v1';
export const QUOTE_PREVIEW_ADDRESS = '0x1111111111111111111111111111111111111111';
const SOLANA_CHAIN_ID = 1151111081099710;
const BITCOIN_CHAIN_ID = 20000000000001;
const SOLANA_PREVIEW_ADDRESS = '11111111111111111111111111111111';
const BITCOIN_PREVIEW_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
const CHAIN_CACHE_TTL_MS = 5 * 60 * 1000;
const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;

const chainCache = { value: null, expiresAt: 0 };
const tokenCache = new Map();
const inflightRequests = new Map();

// Give this your actual project/company name — LI.FI uses it for
// attribution and (optionally) fee-sharing if you register as an
// integrator. See: https://docs.li.fi/guides/monetize-integration
const INTEGRATOR = 'BoltSwap';

function previewAddressForChain(chainId) {
  if (Number(chainId) === SOLANA_CHAIN_ID) return SOLANA_PREVIEW_ADDRESS;
  if (Number(chainId) === BITCOIN_CHAIN_ID) return BITCOIN_PREVIEW_ADDRESS;
  return QUOTE_PREVIEW_ADDRESS;
}

function isValidQuoteAddress(address, chainId) {
  if (Number(chainId) === SOLANA_CHAIN_ID) {
    return typeof address === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  if (Number(chainId) === BITCOIN_CHAIN_ID) {
    return typeof address === 'string' && /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/i.test(address);
  }
  return typeof address === 'string' && /^0x(?!0{40})[a-fA-F0-9]{40}$/.test(address);
}

function quoteAddressForChain(address, chainId) {
  return isValidQuoteAddress(address, chainId) ? address : previewAddressForChain(chainId);
}

// Maps our Settings "Route priority" options to LI.FI's `order` param.
export const ROUTE_PRIORITY_TO_ORDER = {
  'Best Return': 'RECOMMENDED',
  'Fastest': 'FASTEST',
  'Safest': 'SAFEST',
  'Lowest Gas': 'CHEAPEST',
};

async function get(path, params = {}, { signal } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const value = Array.isArray(v) ? v.join(',') : v;
    url.searchParams.set(k, value);
  });
  const res = await fetch(url.toString(), { headers: { accept: 'application/json' }, signal });
  if (!res.ok) throw new Error(`LI.FI API ${path} returned ${res.status}`);
  return res.json();
}

async function post(path, body, { signal } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`LI.FI API ${path} returned ${res.status}`);
  return res.json();
}

/**
 * Fetch the live list of chains LI.FI currently supports, reshaped into the
 * { id, key, name, logo, color } shape the rest of the app expects.
 * Throws on failure — callers should catch and fall back to mock data.
 */
export async function fetchLiveChains(options = {}) {
  const now = Date.now();
  if (chainCache.value && now < chainCache.expiresAt) {
    return chainCache.value;
  }

  const pending = inflightRequests.get('chains');
  if (pending) {
    return pending;
  }

  const request = (async () => {
    const data = await get('/chains', { chainTypes: ['EVM', 'SVM', 'UTXO'] }, options);
    const chainsList = data?.chains ?? [];
    const mapped = chainsList.map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      logo: c.logoURI,
      color: c.primaryColor || null,
      chainType: c.chainType,
    }));
    chainCache.value = mapped;
    chainCache.expiresAt = Date.now() + CHAIN_CACHE_TTL_MS;
    return mapped;
  })();

  inflightRequests.set('chains', request);
  try {
    return await request;
  } finally {
    inflightRequests.delete('chains');
  }
}

/**
 * Fetch tokens for a single chain id. Reshaped into
 * { address, symbol, name, decimals, chainId, logo, priceUSD }.
 * Throws on failure — callers should catch and fall back to mock data.
 */
export async function fetchLiveTokens(chainIdOrIds, options = {}) {
  const cacheKey = Array.isArray(chainIdOrIds)
    ? chainIdOrIds.join(',')
    : String(chainIdOrIds ?? 'all');
  const now = Date.now();
  const cached = tokenCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return cached.value;
  }

  const pending = inflightRequests.get(`tokens:${cacheKey}`);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    const data = await get('/tokens', { chains: chainIdOrIds }, options);
    const tokenMap = data?.tokens ?? {};
    const mapped = Object.values(tokenMap).flatMap((toks) => toks.map((t) => ({
      address: t.address,
      symbol: t.symbol,
      sym: t.symbol,
      name: t.name,
      decimals: t.decimals,
      chainId: t.chainId,
      chain: t.chainId,
      logo: t.logoURI,
      logoURI: t.logoURI,
      priceUSD: t.priceUSD,
    })));
    tokenCache.set(cacheKey, { value: mapped, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS });
    return mapped;
  })();

  inflightRequests.set(`tokens:${cacheKey}`, request);
  try {
    return await request;
  } finally {
    inflightRequests.delete(`tokens:${cacheKey}`);
  }
}

/**
 * Request a real cross-chain (or same-chain) quote via GET /v1/quote.
 *
 * `fromAmount` must be a string in the token's smallest unit (respecting
 * decimals) -- e.g. "1000000000000000000" for 1 token with 18 decimals, or
 * "1000000" for 1 USDC (6 decimals). Do the decimal conversion before calling.
 *
 * `fromAddress` should be the connected wallet's address. If no wallet is
 * connected yet, this still returns a quote using a placeholder address --
 * treat unconnected-wallet quotes as preview/estimate only, since you can't
 * actually execute one without a real signer.
 *
 * `routePriority` (optional) should be one of the keys in
 * ROUTE_PRIORITY_TO_ORDER (matches the Settings "Route priority" options)
 * and gets translated to LI.FI's `order` param.
 */
export async function fetchLiveQuote({
  fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, toAddress, routePriority,
}, options = {}) {
  return get('/quote', {
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount,
    fromAddress: quoteAddressForChain(fromAddress, fromChain),
    toAddress: quoteAddressForChain(toAddress, toChain),
    integrator: INTEGRATOR,
    order: routePriority ? ROUTE_PRIORITY_TO_ORDER[routePriority] : undefined,
  }, options);
}

/**
 * Request multiple ranked route options via POST /v1/advanced/routes --
 * useful for showing the user a choice (e.g. "Best Return" vs "Fastest" as
 * separate cards).
 */
export async function fetchLiveRoutes({
  fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount, fromAddress, toAddress, order, allowedBridges,
}, options = {}) {
  return post('/advanced/routes', {
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount,
    fromAddress: quoteAddressForChain(fromAddress, fromChainId),
    toAddress: quoteAddressForChain(toAddress, toChainId),
    options: {
      integrator: INTEGRATOR,
      order: order || 'RECOMMENDED',
      ...(allowedBridges?.length ? { bridges: { allow: allowedBridges } } : {}),
    },
  }, options);
}
