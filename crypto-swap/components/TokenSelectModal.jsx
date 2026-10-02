'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { chains, tokens } from '@/lib/data';

const tokenCache = new Map();
let chainsCache = null;
const FETCH_TIMEOUT = 20000; // Allow the server time to finish the LiFi request.
const BACKGROUND_BATCH_SIZE = 20;
const TOKEN_BATCH_CONCURRENCY = 2;
const TOKEN_PAGE_SIZE = 50;

function TokenImage({ src, alt, className, label }) {
  const [failedSource, setFailedSource] = useState('');
  const failed = failedSource === src;

  return src && !failed
    ? <img className={className} src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailedSource(src)} />
    : <span className={`${className} token-logo-fallback`} aria-label={alt}>{label?.slice(0, 1) || '?'}</span>;
}

function splitIntoBatches(items, size) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

function mergeTokenLists(currentTokens, liveTokens, replacedChainIds = []) {
  const replacedChains = new Set(replacedChainIds.map(Number));
  const merged = new Map(
    currentTokens
      .filter((token) => !replacedChains.has(Number(token.chainId ?? token.chain)))
      .map((token) => [
      `${token.chain}:${String(token.address || token.sym).toLowerCase()}`,
      token,
      ]),
  );
  for (const token of liveTokens || []) {
    const key = `${token.chain}:${String(token.address || token.sym).toLowerCase()}`;
    merged.set(key, { ...merged.get(key), ...token });
  }
  return [...merged.values()];
}

// Helper: Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export default function TokenSelectModal({ field, defaultChainId, onClose, onSelect }) {
  const [availableChains, setAvailableChains] = useState(() => chainsCache || chains);
  const [liveChainIds, setLiveChainIds] = useState(() => chainsCache?.map((chain) => Number(chain.id)) || null);
  const chainsRefreshed = useRef(Boolean(chainsCache));

  // Load chains in background without blocking UI
  useEffect(() => {
    let cancelled = false;
    if (chainsRefreshed.current) return;
    chainsRefreshed.current = true;
    
    // Fetch live chains asynchronously in background (non-blocking)
    fetchWithTimeout('/api/chains', {}, FETCH_TIMEOUT)
      .then(async (res) => {
        if (res?.ok) {
          const data = await res.json();
          if (data?.chains?.length) {
            chainsCache = data.chains;
            setLiveChainIds(data.chains.map((chain) => Number(chain.id)));
            setAvailableChains(data.chains);
          }
        }
      })
      .catch(() => {
        // Network error or timeout - keep static data
        chainsCache = chains;
      });

      return () => { cancelled = true; };
  }, []);

  const [query, setQuery] = useState('');
  const [chainQuery, setChainQuery] = useState('');
  const [chainId, setChainId] = useState(defaultChainId ?? null);
  const [memeFilter, setMemeFilter] = useState(false);
  const [modalTokens, setModalTokens] = useState(tokens.slice(0, 120)); // Start with static data
  const [loading, setLoading] = useState(false);
  const [visibleTokenCount, setVisibleTokenCount] = useState(TOKEN_PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const targetChainIds = chainId !== null
      ? [Number(chainId)]
      : (liveChainIds || availableChains.map((chain) => Number(chain.id)));
    const cacheKey = `${chainId ?? 'all'}:${targetChainIds.join(',')}`;
    const supportedChainIds = new Set(targetChainIds.map(Number));
    const fallbackTokens = chainId
      ? tokens.filter((token) => Number(token.chainId ?? token.chain) === Number(chainId))
      : tokens.filter((token) => supportedChainIds.has(Number(token.chainId ?? token.chain))).slice(0, 120);
    const cached = tokenCache.get(cacheKey);

    const loadingTimer = window.setTimeout(() => {
      if (cancelled) return;
      setModalTokens(cached?.length ? cached : fallbackTokens);
      setLoading(targetChainIds.length > 0 && !cached?.length);
    }, 0);

    if (cached?.length) {
      return () => {
        cancelled = true;
        clearTimeout(loadingTimer);
      };
    }

    // Fetch live tokens asynchronously in background without blocking UI
    if (targetChainIds.length > 0 && !cached?.length) {
      const batches = splitIntoBatches(targetChainIds, BACKGROUND_BATCH_SIZE);

      (async () => {
        let mergedTokens = fallbackTokens;
        let receivedLiveTokens = false;
        for (let index = 0; index < batches.length; index += TOKEN_BATCH_CONCURRENCY) {
          const completed = await Promise.all(batches.slice(index, index + TOKEN_BATCH_CONCURRENCY).map(async (batch) => {
            try {
              const response = await fetchWithTimeout(`/api/tokens?chains=${batch.join(',')}`, {}, FETCH_TIMEOUT);
              if (!response?.ok) return { tokens: [], isLive: false, chainIds: batch };
              const data = await response.json();
              return { tokens: data?.tokens || [], isLive: data?.isLive === true, chainIds: batch };
            } catch {
              return { tokens: [], isLive: false, chainIds: batch };
            }
          }));
          for (const result of completed) {
            receivedLiveTokens ||= result.isLive;
            mergedTokens = mergeTokenLists(
              mergedTokens,
              result.tokens,
              result.isLive ? result.chainIds : [],
            );
            if (!cancelled && (result.isLive || mergedTokens.length > fallbackTokens.length)) {
              setModalTokens(mergedTokens);
            }
          }
        }
        if (!cancelled && receivedLiveTokens) {
          tokenCache.set(cacheKey, mergedTokens);
        }
      })().finally(() => {
        clearTimeout(loadingTimer);
        if (!cancelled) setLoading(false);
      });

    }

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
    };
  }, [chainId, liveChainIds, availableChains]);

  const pool = useMemo(
    () => (memeFilter ? tokens.filter((t) => t.tag === 'MEME') : modalTokens),
    [memeFilter, modalTokens],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => pool.filter((t) => {
      const symbolMatch = (t.sym || '').toLowerCase().includes(q);
      const nameMatch = (t.name || '').toLowerCase().includes(q);
      const addressMatch = (t.address || '').toLowerCase().includes(q);
      const matchesQuery = !q || symbolMatch || nameMatch || addressMatch;
      const matchesChain = memeFilter || chainId === null || Number(t.chainId ?? t.chain) === Number(chainId);
      return matchesQuery && matchesChain;
    }).sort((a, b) => {
      const symbolOrder = String(a.sym || '').localeCompare(String(b.sym || ''), undefined, { sensitivity: 'base' });
      return symbolOrder || String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
    }),
    [pool, q, memeFilter, chainId],
  );

  const filteredChains = useMemo(
    () => availableChains.filter((chain) => {
      const label = `${chain.name} ${chain.key}`.toLowerCase();
      return !chainQuery || label.includes(chainQuery.toLowerCase());
    }),
    [availableChains, chainQuery],
  );

  const visibleTokens = useMemo(() => filtered.slice(0, visibleTokenCount), [filtered, visibleTokenCount]);
  const chainInfoMap = useMemo(
    () => new Map(availableChains.map((c) => [Number(c.id), c])),
    [availableChains],
  );
  const selectedChain = chainId === null
    ? null
    : availableChains.find((chain) => Number(chain.id) === Number(chainId));
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content token-select-modal">
        <div className="modal-header token-select-header">
          <h2>Select {field === 'from' ? 'Origin Token' : 'Token'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="token-select-body">
          <aside className="token-chain-panel">
            <div className="token-search-box">
              <Search size={16} />
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search Chains"
                value={chainQuery}
                onChange={(e) => setChainQuery(e.target.value)}
              />
            </div>

            <div className="token-chain-list">
              <button
                className={`token-chain-item ${chainId === null && !memeFilter ? 'active' : ''}`}
                onClick={() => { setChainId(null); setMemeFilter(false); setVisibleTokenCount(TOKEN_PAGE_SIZE); }}
              >
                <img className="chain-pill-logo token-chain-all-logo" src="/Allswapchain/all-swap-chain-CNx-59Va.png" alt="All chains" />
                <span>All networks</span>
                <span className="token-chain-count">{availableChains.length}</span>
              </button>

              <div className="token-chain-group-title">All Chains</div>
              {filteredChains.map((c) => (
                <button
                  key={c.id}
                  className={`token-chain-item ${!memeFilter && chainId === c.id ? 'active' : ''}`}
                  onClick={() => { setMemeFilter(false); setChainId(Number(c.id)); setVisibleTokenCount(TOKEN_PAGE_SIZE); }}
                >
                  <TokenImage className="chain-pill-logo" src={c.logo || c.logoURI || c.icon} alt={c.name} label={c.name} />
                  <span>{c.name}</span>
                  {Number(chainId) === Number(c.id) && <span className="token-chain-check">✓</span>}
                </button>
              ))}
            </div>
          </aside>

          <section className="token-token-panel">
            <div className="token-search-box">
              <Search size={16} />
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search Tokens"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {loading && (
              <div className="token-live-indicator">Loading live token data…</div>
            )}

            <div className="token-collection">
                <div className="token-collection-heading">
                  <h3>{selectedChain ? `${selectedChain.name} tokens` : 'Tokens across all networks'}</h3>
                  <span>{filtered.length.toLocaleString()} tokens</span>
                </div>
              <div className="token-list">
                {loading && filtered.length === 0 ? (
                  <div className="token-empty-state">Loading tokens…</div>
                ) : visibleTokens.length === 0 ? (
                  <div className="token-empty-state">No tokens found</div>
                ) : (
                  visibleTokens.map((t) => (
                    <button type="button" className="token-item" key={`${t.chain}-${t.address || t.sym}`} onClick={() => onSelect(t)}>
                      <div className="token-item-left">
                        <TokenImage className="token-logo" src={t.logo || t.logoURI || t.icon} alt={t.sym} label={t.sym} />
                        <div className="token-item-info">
                          <span className="token-item-sym">{t.sym}</span>
                          <span className="token-item-name">{t.name}</span>
                        </div>
                      </div>
                      <span className="token-chain-badge">{chainInfoMap.get(Number(t.chainId ?? t.chain))?.name || 'Chain'}</span>
                    </button>
                  ))
                )}
                {visibleTokenCount < filtered.length && (
                  <button
                    type="button"
                    className="token-load-more"
                    onClick={() => setVisibleTokenCount((count) => Math.min(count + TOKEN_PAGE_SIZE, filtered.length))}
                  >
                    Show more ({visibleTokens.length.toLocaleString()} of {filtered.length.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
