'use client';

import { useEffect, useRef, useState } from 'react';

// Debounced quote hook now routes requests through the server-side quote API.
export function useQuote({ fromToken, toToken, sendAmount, walletAddress, toAddress, routePriority, settings }) {
  const [quoteResult, setQuoteResult] = useState({ key: '', routes: [] });
  const [loadingKey, setLoadingKey] = useState('');
  const requestId = useRef(0);
  const timerRef = useRef(null);
  const requestKey = JSON.stringify([
    fromToken?.address, fromToken?.chain, toToken?.address, toToken?.chain,
    sendAmount, walletAddress, toAddress, routePriority,
    settings.bridgesEnabled, settings.exchangesEnabled,
  ]);
  const canQuote = Boolean(fromToken?.address && toToken?.address && parseFloat(sendAmount) > 0);
  const routes = quoteResult.key === requestKey ? quoteResult.routes : [];
  const loading = canQuote && loadingKey === requestKey;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    requestId.current += 1;

    if (!canQuote) {
      return undefined;
    }

    const myRequestId = requestId.current;
    const controller = new AbortController();

    timerRef.current = setTimeout(async () => {
      setQuoteResult({ key: requestKey, routes: [] });
      setLoadingKey(requestKey);
      try {
        const response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            fromToken,
            toToken,
            sendAmount,
            walletAddress,
            toAddress,
            routePriority,
            settings,
          }),
        });
        if (!response.ok) {
          throw new Error(`Quote API returned ${response.status}`);
        }
        const data = await response.json();
        if (myRequestId !== requestId.current) return;
        setQuoteResult({ key: requestKey, routes: data.routes || [] });
      } catch (err) {
        if (controller.signal.aborted || myRequestId !== requestId.current || err?.name === 'AbortError') return;
        console.error('[useQuote]', err?.message || err);
      } finally {
        if (myRequestId === requestId.current) {
          setLoadingKey('');
        }
      }
    }, 700);

    return () => {
      clearTimeout(timerRef.current);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromToken?.address, fromToken?.chain, toToken?.address, toToken?.chain,
    sendAmount, walletAddress, toAddress, routePriority, settings.bridgesEnabled, settings.exchangesEnabled,
  ]);

  return { routes, loading };
}
