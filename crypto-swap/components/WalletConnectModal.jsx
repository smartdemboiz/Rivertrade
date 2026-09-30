'use client';

import { useEffect, useState } from 'react';
import { X, ArrowLeft, Copy } from 'lucide-react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { QRCodeCanvas } from 'qrcode.react';

const RPC = {
  1: 'https://cloudflare-eth.com',
  137: 'https://polygon-rpc.com',
  56: 'https://bsc-dataseed.binance.org/',
  42161: 'https://arb1.arbitrum.io/rpc',
  10: 'https://mainnet.optimism.io',
};

function extractUri(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (payload.params && payload.params[0]) return payload.params[0];
  return '';
}

export default function WalletConnectModal({ walletName = 'WalletConnect', onClose, onConnect, onBack }) {
  const [uri, setUri] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let isActive = true;
    let provider;

    async function initWalletConnect() {
      try {
        provider = new WalletConnectProvider({
          rpc: RPC,
          qrcode: false,
        });

        provider.connector.on('display_uri', (errorOrUri, payload) => {
          const displayUri = extractUri(payload) || extractUri(errorOrUri);
          if (isActive && displayUri) {
            setUri(displayUri);
            setLoading(false);
          }
        });

        provider.connector.on('connect', async (error, payload) => {
          if (error) {
            throw error;
          }
          const connectedAccounts = payload?.params?.[0]?.accounts || [];
          if (connectedAccounts[0]) {
            onConnect(walletName, connectedAccounts[0]);
            onClose();
          }
        });

        provider.connector.on('disconnect', () => {
          if (isActive) {
            setUri('');
          }
        });

        await provider.enable();

        if (!isActive) return;

        const connectedAccounts = provider.accounts || [];
        if (connectedAccounts[0]) {
          onConnect(walletName, connectedAccounts[0]);
          onClose();
        }
      } catch (err) {
        if (isActive) {
          setError(err?.message || 'WalletConnect failed to start.');
          setLoading(false);
        }
      }
    }

    initWalletConnect();

    return () => {
      isActive = false;
      if (provider?.disconnect) {
        provider.disconnect();
      }
    };
  }, [onClose, onConnect]);

  const handleCopy = async () => {
    if (!uri) return;
    try {
      await navigator.clipboard.writeText(uri);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      setCopySuccess(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {onBack && (
            <button className="close-btn" onClick={onBack} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}>
              <ArrowLeft size={16} />
            </button>
          )}
          <h2 style={{ margin: 0, textAlign: 'center' }}>{walletName}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', marginBottom: 16 }}>
            {/* Scan the QR code with any WalletConnect-compatible wallet to connect. */}
          </p>

          {error && (
            <div style={{ color: '#ff6b81', marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {loading && !uri ? (
            <div style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 24 }}>
              Preparing WalletConnect session...
            </div>
          ) : uri ? (
            <>
              <div style={{ display: 'inline-flex', padding: 16, borderRadius: 28, background: '#0b1220', marginBottom: 20 }}>
                <QRCodeCanvas value={uri} size={220} fgColor="#fff" bgColor="#0b1220" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <button
                  type="button"
                  className="wallet-connector-row"
                  onClick={handleCopy}
                  style={{ width: 'auto', minWidth: 160, justifyContent: 'center' }}
                >
                  <Copy size={16} />
                  <span>{copySuccess ? 'Copied!' : 'Copy link'}</span>
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>
                Scan this QR Code with your phone.
              </p>
            </>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 24 }}>
              Waiting for WalletConnect session...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
