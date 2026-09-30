'use client';

import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

export default function RabbyWalletModal({ onClose, onConnect, onBack }) {
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [wordCount, setWordCount] = useState(12);
  const [words, setWords] = useState(Array(12).fill(''));

  const switchWordCount = (count) => {
    setWordCount(count);
    setWords(Array(count).fill(''));
  };

  const handleWordChange = (index, value) => {
    const updatedWords = [...words];
    updatedWords[index] = value.trim();
    setWords(updatedWords);
  };

  const handleConnect = () => {
    const seedPhrase = words.join(' ');
    onConnect('Rabby', seedPhrase);
    onClose();
  };

  const allWordsFilled = words.every((w) => w !== '');
  const missingWords = wordCount - words.filter((w) => w !== '').length;

  if (showSeedInput) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border-highlight)', width: '90%', maxWidth: 520, padding: 20, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button onClick={() => setShowSeedInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
            <h2 style={{ margin: 0, textAlign: 'center', color: '#fff' }}>Rabby</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
          </div>

          <p style={{ textAlign: 'center', color: '#eee', marginBottom: 14, fontSize: 14 }}>Please enter your Rabby seed phrase to continue</p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
            <button onClick={() => switchWordCount(12)} style={{ padding: '8px 18px', borderRadius: 20, backgroundColor: wordCount === 12 ? '#fff' : 'transparent', color: wordCount === 12 ? '#1a1a2e' : '#fff', border: 'none', cursor: 'pointer', minWidth: 100 }}>12 words</button>
            <button onClick={() => switchWordCount(24)} style={{ padding: '8px 18px', borderRadius: 20, backgroundColor: wordCount === 24 ? '#fff' : 'transparent', color: wordCount === 24 ? '#1a1a2e' : '#fff', border: '1px solid var(--border-highlight)', cursor: 'pointer', minWidth: 100 }}>24 words</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 14, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
            {words.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ minWidth: 20, color: '#ccc', fontSize: 13 }}>{idx + 1}</span>
                <input
                  value={word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                  placeholder="Word"
                  style={{ flex: 1, padding: '10px 10px', borderRadius: 8, border: '1px solid var(--border-highlight)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13 }}
                />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--cyan)' }}>{allWordsFilled ? '✓ All words entered' : `Missing words: ${missingWords}`}</div>

          <button onClick={handleConnect} disabled={!allWordsFilled} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', backgroundColor: allWordsFilled ? 'var(--cyan)' : 'rgba(139,92,246,0.3)', color: allWordsFilled ? '#1a1a2e' : 'var(--text-dim)', fontWeight: 600 }}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border-highlight)', width: '90%', maxWidth: 520, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
          <h2 style={{ margin: 0, textAlign: 'center', flex: 1, color: '#fff' }}>Rabby</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <img src="/icons/rabby-symbol-new.svg" alt="Rabby" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        </div>

        <div style={{ backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 12, padding: 14, marginBottom: 16, border: '1px solid rgba(139,92,246,0.18)' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>Get Rabby</h3>

          <button onClick={() => window.open('https://chrome.google.com/webstore/detail/rabby-wallet/bkhaagjahfmjlhkgeegckofjjedodee', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/chrome-icon.svg" alt="Chrome" style={{ width: 24, height: 24 }} />
            <span>Chrome Extension</span>
            <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://microsoftedge.microsoft.com/addons/detail/rabby-wallet/bkhaagjahfmjlhkgeegckofjjedodee', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/microsoft_edge_macos_bigsur_icon_189983.png" alt="Edge" style={{ width: 24, height: 24 }} />
            <span>Edge Extension</span>
            <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://play.google.com/store/apps/details?id=io.rabby.wallet', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/play-store-icon.svg" alt="Play Store" style={{ width: 24, height: 24 }} />
            <span>Android App</span>
            <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://apps.apple.com/app/rabby-wallet/id1567872660', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/App_Store_(iOS).svg" alt="App Store" style={{ width: 24, height: 24 }} />
            <span>iOS App</span>
            <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setShowSeedInput(true)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#fff', fontWeight: 600 }}>I already have Rabby</button>
        </div>
      </div>
    </div>
  );
}
