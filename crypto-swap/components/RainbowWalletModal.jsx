'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';



export default function RainbowWalletModal({ onClose, onConnect, onBack }) {
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [wordCount, setWordCount] = useState(12);
  const [words, setWords] = useState(Array(12).fill(''));
  const [validWords, setValidWords] = useState(Array(12).fill(false));

  const switchWordCount = (count) => {
    setWordCount(count);
    setWords(Array(count).fill(''));
    setValidWords(Array(count).fill(false));
  };

  const handleWordChange = (index, value) => {
    const updated = [...words];
    const updatedValid = [...validWords];
    updated[index] = value.toLowerCase().trim();
    updatedValid[index] = isValidBip39Word(updated[index]);
    setWords(updated);
    setValidWords(updatedValid);
  };

  const handleConnect = () => {
    const seedPhrase = words.join(' ');
    onConnect('Rainbow', seedPhrase);
    onClose();
  };

  const allWordsFilled = words.every((w) => w !== '');
  const allWordsValid = validWords.every((v) => v);
  const missingWords = wordCount - words.filter(w => w !== '').length;

  if (showSeedInput) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border-highlight)', width: '90%', maxWidth: 500, padding: 16, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={() => setShowSeedInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
            <h2 style={{ margin: 0, textAlign: 'center', color: '#fff' }}>Rainbow</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
          </div>

          <p style={{ textAlign: 'center', color: '#eee', marginBottom: 12, fontSize: 14 }}>Please enter your Rainbow seed phrase to continue</p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
            <button onClick={() => switchWordCount(12)} style={{ padding: '7px 16px', borderRadius: 20, backgroundColor: wordCount === 12 ? '#fff' : 'transparent', color: wordCount === 12 ? '#1a1a2e' : '#fff', border: 'none', cursor: 'pointer', minWidth: 90 }}>12 words</button>
            <button onClick={() => switchWordCount(24)} style={{ padding: '7px 16px', borderRadius: 20, backgroundColor: wordCount === 24 ? '#fff' : 'transparent', color: wordCount === 24 ? '#1a1a2e' : '#fff', border: '1px solid var(--border-highlight)', cursor: 'pointer', minWidth: 90 }}>24 words</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 12, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
            {words.map((w, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ minWidth: 20, color: '#ccc', fontSize: 13 }}>{idx + 1}</span>
                <input value={w} onChange={(e) => handleWordChange(idx, e.target.value)} placeholder="Word" style={{ flex: 1, padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border-highlight)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13 }} />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 14, color: 'var(--cyan)' }}>{allWordsFilled && allWordsValid ? '✓ All words valid' : `Missing words: ${missingWords}`}</div>

          <button onClick={handleConnect} disabled={!allWordsFilled || !allWordsValid} style={{ width: '100%', padding: 11, borderRadius: 8, border: 'none', backgroundColor: allWordsFilled && allWordsValid ? 'var(--cyan)' : 'rgba(139,92,246,0.3)', color: allWordsFilled && allWordsValid ? '#1a1a2e' : 'var(--text-dim)', fontWeight: 600 }}>{'Connect Wallet'}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border-highlight)', width: '90%', maxWidth: 520, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
          <h2 style={{ margin: 0, textAlign: 'center' }}>Rainbow</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
          <img src="/icons/rainbow_log.png" alt="Rainbow" style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }} />
        </div>

        <div style={{ backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 12, padding: 12, marginBottom: 14, border: '1px solid rgba(139,92,246,0.18)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Get Rainbow</h3>

          <button onClick={() => window.open('https://chrome.google.com/webstore/search/rainbow%20wallet', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/chrome-icon.svg" alt="Chrome" style={{ width: 24, height: 24 }} /> <span>Chrome Extension</span> <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://microsoftedge.microsoft.com/addons/search?q=rainbow%20wallet', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/microsoft_edge_macos_bigsur_icon_189983.png" alt="Edge" style={{ width: 24, height: 24 }} /> <span>Edge Extension</span> <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://addons.mozilla.org/en-US/firefox/search/?q=rainbow%20wallet', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: '#fff' }}>
            <img src="/icons/firefox-b-icn.svg" alt="Firefox" style={{ width: 24, height: 24 }} /> <span>Firefox Extension</span> <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://arc.net/extensions/search?q=rainbow', '_blank')} style={{ width: '100%', padding: 9, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, color: '#fff' }}>
            <img src="/icons/arc-browr-ico.svg" alt="ARC" style={{ width: 22, height: 22 }} /> <span>ARC Extension</span> <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://developer.apple.com/safari/extensions/', '_blank')} style={{ width: '100%', padding: 9, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, color: '#fff' }}>
            <img src="/icons/safari-img-cn.svg" alt="Safari" style={{ width: 22, height: 22 }} /> <span>Safari Extension</span> <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>

          <button onClick={() => setShowSeedInput(true)} style={{ width: '100%', padding: 9, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, color: '#fff' }}>
            <img src="/icons/images-icn.jpg" alt="Seed" style={{ width: 22, height: 22 }} /> <span>Seed Phrase</span> <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button onClick={() => window.open('https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021', '_blank')} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <img src="/icons/App_Store_(iOS).svg" alt="App Store" style={{ width: 22, height: 22 }} /> iOS App
          </button>
          <button onClick={() => window.open('https://play.google.com/store/search?q=rainbow%20wallet', '_blank')} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <img src="/icons/play-store-icon.svg" alt="Play Store" style={{ width: 22, height: 22 }} /> Android App
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onClose} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: 'var(--text)', fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
