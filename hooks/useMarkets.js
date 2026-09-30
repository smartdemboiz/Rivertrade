import { useCallback, useEffect, useState } from 'react';

const API = 'https://api.coingecko.com/api/v3';
const ids = 'bitcoin,ethereum,solana,ripple';

export function useMarkets(selectedId = 'bitcoin') {
  const [state, setState] = useState({ coins: [], global: null, chart: [], updated: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    try {
      const [coinsResponse, globalResponse, chartResponse] = await Promise.all([
        fetch(`${API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`),
        fetch(`${API}/global`),
        fetch(`${API}/coins/${selectedId}/market_chart?vs_currency=usd&days=1&interval=hourly`),
      ]);
      if (!coinsResponse.ok || !globalResponse.ok || !chartResponse.ok) throw new Error('Market provider is rate limited. Retry in a moment.');
      const coins = await coinsResponse.json();
      const global = (await globalResponse.json()).data;
      const chartData = await chartResponse.json();
      setState({ coins, global, chart: chartData.prices.map((point) => point[1]), updated: new Date(), loading: false, error: null });
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
