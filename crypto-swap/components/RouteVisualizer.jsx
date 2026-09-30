'use client';

import QuoteTimer from './QuoteTimer';

function TokenImage({ token, className }) {
  return token?.logo
    ? <img src={token.logo} alt={token.sym} className={className} />
    : <span className={`${className} token-logo-fallback`} aria-label={token?.sym || 'Token'}>{token?.sym?.slice(0, 1) || '?'}</span>;
}

function formatMoney(value, fallback = '$0.00') {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `$${n.toFixed(2)}`;
}

function derivePriceImpact(routes) {
  if (!Array.isArray(routes) || routes.length < 2) return '—';
  const best = Number(routes[0]?.toAmount) || 0;
  const second = Number(routes[1]?.toAmount) || 0;
  if (!best) return '—';
  const delta = ((second - best) / best) * 100;
  return `${delta.toFixed(2)}%`;
}

function deriveExchangeRate(fromToken, toToken, sendAmount, mainRoute) {
  const rateBase = Number(sendAmount) || 0;
  const outAmount = Number(mainRoute?.toAmount) || 0;
  if (!fromToken || !toToken || !rateBase || !outAmount) {
    return `1 ${fromToken?.sym || 'FROM'} ≈ 0 ${toToken?.sym || 'TO'}`;
  }

  const rate = outAmount / rateBase;
  return `1 ${fromToken.sym} ≈ ${rate.toFixed(6)} ${toToken.sym}`;
}

export default function RouteVisualizer({ fromToken, toToken, routes, routePriority, sendAmount }) {
  if (!fromToken || !toToken) return null;

  const mainRoute = routes?.[0] || null;
  const routeLabel = routePriority || 'Best Return';
  const gasUsd = Number(mainRoute?.gasUsd || 0);
  const integratorFee = Number(mainRoute?.integratorFee ?? 0) || gasUsd * 0.25;
  const slippageRate = 0.005;
  const outputAmount = Number(mainRoute?.toAmount || 0);
  const inputAmount = Number(sendAmount || 0);
  const minReceivedAmount = outputAmount > 0 ? outputAmount * (1 - slippageRate) : 0;
  const networkCost = formatMoney(gasUsd || 0.01, '<$0.01');
  const priceImpact = derivePriceImpact(routes);
  const minReceived = minReceivedAmount > 0 ? minReceivedAmount.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }) : '0.00';
  const exchangeRate = deriveExchangeRate(fromToken, toToken, sendAmount, mainRoute);
  const integratorFeeText = formatMoney(integratorFee || 0.0, '$0.00');
  const routeValueLabel = routeLabel || 'Best Return';

  return (
    <div className="route-visualizer-container">
      <div className="route-header">
        <div className="route-title"><span>{routeValueLabel}</span></div>
      </div>

      <div className="route-details-card route-live-card">
        <div className="route-detail-row">
          <span className="route-detail-label">Network cost</span>
          <span className="route-detail-value">{networkCost}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Integrator fee</span>
          <span className="route-detail-value">{integratorFeeText}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Price impact</span>
          <span className="route-detail-value">{priceImpact}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Max. slippage</span>
          <span className="route-detail-value">{inputAmount > 0 ? 'Auto' : '0.5%'}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Min. received</span>
          <span className="route-detail-value">{minReceived}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Exchange rate</span>
          <span className="route-detail-value">{exchangeRate}</span>
        </div>
        <div className="route-detail-row">
          <span className="route-detail-label">Live timer</span>
          <span className="route-detail-value"><QuoteTimer /></span>
        </div>
      </div>
    </div>
  );
}
