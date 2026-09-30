const API_BASE = 'https://app.across.to/api/swap';
const CACHE_TTL_MS = 5 * 60 * 1000;
const ACROSS_SOLANA_CHAIN_ID = 34268394551451;
const APP_SOLANA_CHAIN_ID = 1151111081099710;

const cache = new Map();
const inflightRequests = new Map();

function normalizeChainId(chainId) {
  return Number(chainId) === ACROSS_SOLANA_CHAIN_ID
    ? APP_SOLANA_CHAIN_ID
    : Number(chainId);
}

async function fetchJson(path, params = {}, { signal } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error(`Across API ${path} returned ${response.status}`);
  return response.json();
}

async function getCached(key, loader) {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.value;

  const pending = inflightRequests.get(key);
  if (pending) return pending;

  const request = loader().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }).finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, request);
  return request;
}

export async function fetchAcrossChains(options = {}) {
  return getCached('chains', async () => {
    const data = await fetchJson('/chains', {}, options);
    if (!Array.isArray(data)) throw new Error('Across API returned an invalid chains list');

    return data.filter((chain) => Number.isFinite(Number(chain.chainId)) && chain.name).map((chain) => ({
      id: normalizeChainId(chain.chainId),
      key: chain.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: chain.name,
      logo: chain.logoUrl || '',
      color: null,
    }));
  });
}

function normalizeToken(token) {
  const chainId = normalizeChainId(token.chainId);
  const symbol = token.displaySymbol || token.symbol;
  return {
    address: token.address,
    symbol: token.symbol,
    sym: symbol,
    name: token.name,
    decimals: Number(token.decimals),
    chainId,
    chain: chainId,
    logo: token.logoUrl || '',
    logoURI: token.logoUrl || '',
    priceUSD: token.priceUsd,
  };
}

export async function fetchAcrossTokens(chainIdOrIds, options = {}) {
  let chainIds = Array.isArray(chainIdOrIds)
    ? chainIdOrIds.map(Number)
    : chainIdOrIds === undefined || chainIdOrIds === null
      ? (await fetchAcrossChains(options)).map((chain) => chain.id)
      : [Number(chainIdOrIds)];
  chainIds = [...new Set(chainIds.filter((id) => Number.isFinite(id)))];

  const results = await Promise.allSettled(chainIds.map((chainId) => {
    const upstreamChainId = chainId === APP_SOLANA_CHAIN_ID ? ACROSS_SOLANA_CHAIN_ID : chainId;
    return getCached(`tokens:${upstreamChainId}`, async () => {
      const data = await fetchJson('/tokens', { chainId: upstreamChainId }, options);
      if (!Array.isArray(data)) throw new Error(`Across API returned invalid tokens for chain ${upstreamChainId}`);
      return data.map(normalizeToken).filter((token) => (
        token.address && token.sym && Number.isInteger(token.decimals) && token.decimals >= 0
      ));
    });
  }));

  const tokens = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  if (tokens.length === 0 && results.some((result) => result.status === 'rejected')) {
    throw results.find((result) => result.status === 'rejected').reason;
  }
  return tokens;
}