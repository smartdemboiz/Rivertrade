import { useCallback, useEffect, useState } from 'react';

export function useMarkets(selectedId = 'bitcoin') {
  const [state, setState] = useState({ coins: [], global: null, chart: [], updated: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/market-overview?selectedId=${encodeURIComponent(selectedId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Market data is temporarily unavailable.');
      setState({ ...data, updated: new Date(), loading: false, error: null });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Unable to load live markets.' }));
    }
  }, [selectedId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { ...state, refresh };
}
