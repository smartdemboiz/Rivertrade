import { mockPrice } from '@/lib/data';

function tokenPrice(token) {
  const livePrice = Number(token?.priceUSD);
  if (Number.isFinite(livePrice) && livePrice > 0) return livePrice;
  const symbol = String(token?.sym || '').toUpperCase();
  const mockSymbol = Object.keys(mockPrice).find((key) => key.toUpperCase() === symbol);
  return mockSymbol ? mockPrice[mockSymbol] : 0;
}

export function formatTokenAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  const decimals = value !== 0 && Math.abs(value) < 1
    ? Math.min(18, Math.max(4, Math.ceil(-Math.log10(Math.abs(value))) + 4))
    : 4;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(4, decimals),
    maximumFractionDigits: decimals,
  });
}

export function receiveAmountMock(fromToken, toToken, sendAmount) {
  if (!fromToken || !toToken || !sendAmount) return '0.00';
  const fromPrice = tokenPrice(fromToken);
  const toPrice = tokenPrice(toToken);
  if (toPrice === 0) return '0.00';
  const amt = (parseFloat(sendAmount) || 0) * fromPrice / toPrice;
  return amt.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function receiveAmountFormatted(routes, fromToken, toToken, sendAmount) {
  if (Array.isArray(routes) && routes.length === 0) return '—';
  const best = routes?.[0];
  if (best) return formatTokenAmount(best.toAmount);
  return receiveAmountMock(fromToken, toToken, sendAmount);
}

export function sendUsdValue(fromToken, sendAmount) {
  if (!fromToken) return '0.00';
  const amt = parseFloat(sendAmount) || 0;
  const price = tokenPrice(fromToken);
  return (amt * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function receiveUsdValue(routes, fromToken, toToken, sendAmount) {
  if (!toToken) return '0.00';
  if (Array.isArray(routes) && routes.length === 0) return '—';
  const best = routes?.[0];
  if (best && Number.isFinite(best.toAmountUsd)) return best.toAmountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amt = parseFloat(receiveAmountMock(fromToken, toToken, sendAmount)) || 0;
  const price = tokenPrice(toToken);
  return (amt * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function exchangeRateStr(routes, fromToken, toToken, sendAmount) {
  if (Array.isArray(routes) && routes.length === 0) return 'Rate unavailable';
  const receiveAmount = receiveAmountFormatted(routes, fromToken, toToken, sendAmount);
  if (!fromToken || !toToken || !sendAmount || !receiveAmount) return '1 USDC \u2248 0.013233 wSOL';
  const rate = parseFloat(receiveAmount) / (parseFloat(sendAmount) || 1);
  return `1 ${fromToken.sym} \u2248 ${rate.toFixed(6)} ${toToken.sym}`;
}

export function estimatedDurationSeconds(routes) {
  return routes?.[0]?.durationSec ?? null;
}

export function routeLabel(route) {
  return route?.engineName || 'Alternative';
}
export function routeDuration(route) {
  const num = route?.durationSec;
  return Number.isFinite(num) && num > 0 ? `${Math.round(num)}s` : '\u2014';
}
export function routeGas(route) {
  const num = route?.gasUsd;
  return Number.isFinite(num) && num >= 0 ? `$${num.toFixed(2)}` : '$0.00';
}
export function routeRate(route, fromToken, toToken, sendAmount) {
  if (!fromToken || !toToken) return `1 ${fromToken?.sym || 'FROM'} \u2248 0 ${toToken?.sym || 'TO'}`;
  const toAmt = route?.toAmount;
  const fromAmt = parseFloat(sendAmount) || 1;
  if (!toAmt || !fromAmt) return `1 ${fromToken.sym} \u2248 0 ${toToken.sym}`;
  const rate = toAmt / fromAmt;
  return `1 ${fromToken.sym} \u2248 ${rate.toFixed(6)} ${toToken.sym}`;
}
export function routeAmount(route, routes, fromToken, toToken, sendAmount) {
  const amount = route?.toAmount;
  return Number.isFinite(amount) && toToken
    ? formatTokenAmount(amount)
    : receiveAmountFormatted(routes, fromToken, toToken, sendAmount);
}
