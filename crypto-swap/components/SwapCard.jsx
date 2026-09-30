'use client';

import { Settings, Sparkles, ChevronDown, ArrowDown, ArrowLeft, Fuel, Clock, Route } from 'lucide-react';
import { gasOptions } from '@/lib/data';
import {
  receiveAmountFormatted, sendUsdValue, receiveUsdValue, exchangeRateStr,
  routeLabel, routeGas, routeRate, routeAmount,
} from '@/lib/format';
import QuoteTimer from './QuoteTimer';
import RouteSourceTags from './RouteSourceTags';
import RouteVisualizer from './RouteVisualizer';

const PERCENTAGES = [25, 50, 75, 100];
const MOCK_BALANCE = 1000;

function TokenImage({ token, className }) {
  return token?.logo
    ? <img className={className} src={token.logo} alt={token.sym} />
    : <span className={`${className} token-logo-fallback`} aria-label={token?.sym || 'Token'}>{token?.sym?.slice(0, 1) || '?'}</span>;
}

export default function SwapCard({
  fromToken, toToken, sendAmount, onSendAmountChange,
  onOpenTokenModal, onSwapDirection,
  selectedPercentage, onPercentageClick,
  quickView, settings, onSetGasPrice, onOpenSettings, onCloseSettings,
  routes, quoteLoading, showRoute, onToggleShowRoute,
  destinationWallet, onOpenSendToWallet,
  connectedLabel, onActionClick,
}) {
  const hasAvailableRoute = (routes || []).some((route) => route.available !== false);
  const receiveAmount = hasAvailableRoute
    ? receiveAmountFormatted(routes, fromToken, toToken, sendAmount)
    : '';
  const mainRoute = routes?.[0] || null;
  const additionalRoutes = routes && routes.length > 1 ? routes.slice(1) : [];
  const canQuote = Boolean(fromToken?.address && toToken?.address && parseFloat(sendAmount) > 0);
  const showLoadingCard = canQuote && quoteLoading && (!routes || routes.length === 0);

  if (quickView === 'gas') {
    return (
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h1>Gas Settings</h1></div>
          <button className="icon-btn" onClick={onCloseSettings} aria-label="Back to swap"><ArrowLeft size={18} /></button>
        </div>
        <div className="gas-inline-list">
          {gasOptions.map((opt) => (
            <button key={opt} className="option-row" onClick={() => onSetGasPrice(opt)}>
              <span>{opt} Speed</span>
              <span className={`option-dot ${settings.gasPrice === opt ? 'selected' : ''}`} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1>Swap &amp; Bridge</h1>
          <span className="sparkle-pulse"><Sparkles size={16} /></span>
        </div>
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings"><Settings size={18} /></button>
      </div>

      <div className="swap-boxes-container">
        <div className="swap-box send-box">
          <div className="swap-box-label">Send</div>
          <div className="swap-box-main">
            <div className="swap-amount-col">
              <input
                className="swap-big-input"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={sendAmount}
                onChange={(e) => onSendAmountChange(e.target.value)}
              />
              <div className="swap-usd-line">${sendUsdValue(fromToken, sendAmount)} <span className="usd-toggle">↑↓</span></div>
            </div>
            <button className="token-select-pill" onClick={() => onOpenTokenModal('from')}>
              {fromToken ? (
                <>
                  <TokenImage className="pill-logo" token={fromToken} />
                  <span className="pill-sym">{fromToken.sym}</span>
                </>
              ) : <span className="pill-sym">Select Token</span>}
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="percentage-buttons">
            {PERCENTAGES.map((p) => (
              <button
                key={p}
                className={`percent-btn ${selectedPercentage === p ? 'active' : ''}`}
                onClick={() => onPercentageClick(p, MOCK_BALANCE)}
              >
                {p === 100 ? 'MAX' : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="swap-direction-wrap">
          <button className="swap-direction-circle-btn" onClick={onSwapDirection} aria-label="Swap direction">
            <ArrowDown size={18} />
          </button>
        </div>

        <div className="swap-box receive-box">
          <div className="swap-box-label">Receive</div>
          <div className="swap-box-main">
            <div className="swap-amount-col">
              <div className="swap-big-number">{receiveAmount}</div>
              <div className="swap-usd-line">
                {hasAvailableRoute && <>${receiveUsdValue(routes, fromToken, toToken, sendAmount)} <span className="usd-toggle">↑↓</span></>}
              </div>
            </div>
            <button className="token-select-pill" onClick={() => onOpenTokenModal('to')}>
              {toToken ? (
                <>
                  <TokenImage className="pill-logo" token={toToken} />
                  <span className="pill-sym">{toToken.sym}</span>
                </>
              ) : <span className="pill-sym">Select Token</span>}
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {canQuote && (
        showLoadingCard ? (
          <div className="best-return-card">
            <div className="best-return-header">
              <span className="best-return-badge">{settings.routePriority || 'Best Return'}</span>
              <div className="loading-spinner-ring" />
            </div>
            <div style={{ padding: '8px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              Checking live swap and bridge routes…
            </div>
          </div>
        ) : routes?.length === 0 ? (
          <div className="no-routes-state" role="status" aria-live="polite">
            <Route size={38} strokeWidth={1.8} aria-hidden="true" />
            <h3>No routes available</h3>
            <p>There may not be enough liquidity, the amount may be too low, or this token combination may not have a route.</p>
          </div>
        ) : (
          <>
            {routes && routes.length > 0 && (
              <div className="engines-checked-line">
                Compared {routes.length} engine{routes.length === 1 ? '' : 's'} • showing {settings.routePriority || 'Best Return'}
              </div>
            )}

            <div className="best-return-card">
              <div className="best-return-header">
                <span className="best-return-badge">{settings.routePriority || 'Best Return'}</span>
                <div className="loading-spinner-ring" />
              </div>
              <div className="best-return-body">
                <div className="best-return-left">
                  <div className="best-return-avatar-wrap">
                    {toToken ? <TokenImage className="best-return-avatar" token={toToken} /> : <div className="best-return-avatar-placeholder" />}
                  </div>
                  <div className="best-return-info">
                    <div className="best-return-amount-row"><span className="best-return-amount">{receiveAmount}</span></div>
                    <div className="best-return-sub">${receiveUsdValue(routes, fromToken, toToken, sendAmount)}</div>
                    <RouteSourceTags route={mainRoute} />
                  </div>
                </div>
                <button className="expand-chevron-btn" onClick={onToggleShowRoute}><ChevronDown size={16} /></button>
              </div>
              <div className="best-return-footer">
                <span className="rate-text">{exchangeRateStr(routes, fromToken, toToken, sendAmount)}</span>
                <div className="best-return-metrics">
                  <span className="metric-pill"><Fuel size={12} /> {mainRoute ? routeGas(mainRoute) : '$0.37'}</span>
                  <span className="metric-pill" title="30-second looping timer"><Clock size={12} /> <QuoteTimer /></span>
                </div>
              </div>
              <button className="show-all-pill-btn" onClick={onToggleShowRoute}>{showRoute ? 'Hide details' : 'Show all'}</button>
            </div>

            {showRoute && <RouteVisualizer fromToken={fromToken} toToken={toToken} routes={routes} routePriority={settings.routePriority} sendAmount={sendAmount} />}

            {additionalRoutes.map((route) => (
              <div className="best-return-card" style={{ marginTop: 12 }} key={route.engineId}>
                <div className="best-return-header">
                  <span className="best-return-badge">{routeLabel(route)}</span>
                  <div className="loading-spinner-ring" />
                </div>
                <div className="best-return-body">
                  <div className="best-return-left">
                    <div className="best-return-avatar-wrap">
                      {toToken ? <TokenImage className="best-return-avatar" token={toToken} /> : <div className="best-return-avatar-placeholder" />}
                    </div>
                    <div className="best-return-info">
                      <div className="best-return-amount-row"><span className="best-return-amount">{routeAmount(route, routes, fromToken, toToken, sendAmount)}</span></div>
                      <div className="best-return-sub">{routeRate(route, fromToken, toToken, sendAmount)}</div>
                      <RouteSourceTags route={route} />
                    </div>
                  </div>
                  <button className="expand-chevron-btn" disabled><ChevronDown size={16} /></button>
                </div>
                <div className="best-return-footer">
                  <span className="rate-text">{routeRate(route, fromToken, toToken, sendAmount)}</span>
                  <div className="best-return-metrics">
                    <span className="metric-pill"><Fuel size={12} /> {routeGas(route)}</span>
                    <span className="metric-pill" title="30-second looping timer"><Clock size={12} /> <QuoteTimer /></span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )
      )}

      {toToken && (
        <div className="send-wallet-card" onClick={onOpenSendToWallet}>
          <div className="send-wallet-header">
            <span className="send-wallet-title">Send to wallet</span>
          </div>
          <div className="send-wallet-input-row">
            <div className="send-wallet-avatar-placeholder">
              <span className="sub-badge">
                <TokenImage className="sub-badge-icon" token={toToken} />
              </span>
            </div>
            <input className="send-wallet-input" type="text" placeholder="Enter wallet address" value={destinationWallet || ''} readOnly />
          </div>
        </div>
      )}

      <div className="actions-single">
        <button className="main-action-btn" onClick={onActionClick}>
          {connectedLabel ? 'Execute Swap' : 'Connect wallet'}
        </button>
      </div>
    </div>
  );
}
