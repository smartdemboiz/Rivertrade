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
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5,5,5,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: '#151518', borderRadius: 16, border: '1px solid rgba(108,249,216,0.2)', width: '90%', maxWidth: 520, padding: 20, color: 'var(--background)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button onClick={() => setShowSeedInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--background)' }}><ArrowLeft size={20} /></button>
            <h2 style={{ margin: 0, textAlign: 'center', color: 'var(--background)' }}>Rabby</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--background)' }}><X size={20} /></button>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--muted-soft)', marginBottom: 14, fontSize: 14 }}>Please enter your Rabby seed phrase to continue</p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
            <button onClick={() => switchWordCount(12)} style={{ padding: '8px 18px', borderRadius: 20, backgroundColor: wordCount === 12 ? 'var(--brand)' : 'transparent', color: wordCount === 12 ? 'var(--foreground)' : 'var(--background)', border: '1px solid rgba(108,249,216,0.2)', cursor: 'pointer', minWidth: 100 }}>12 words</button>
            <button onClick={() => switchWordCount(24)} style={{ padding: '8px 18px', borderRadius: 20, backgroundColor: wordCount === 24 ? 'var(--brand)' : 'transparent', color: wordCount === 24 ? 'var(--foreground)' : 'var(--background)', border: '1px solid rgba(108,249,216,0.2)', cursor: 'pointer', minWidth: 100 }}>24 words</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 14, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
            {words.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ minWidth: 20, color: 'var(--muted-soft)', fontSize: 13 }}>{idx + 1}</span>
                <input
                  value={word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                  placeholder="Word"
                  style={{ flex: 1, padding: '10px 10px', borderRadius: 8, border: '1px solid rgba(108,249,216,0.2)', backgroundColor: 'var(--surface)', color: 'var(--background)', fontSize: 13 }}
                />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--brand)' }}>{allWordsFilled ? '✓ All words entered' : `Missing words: ${missingWords}`}</div>

          <button onClick={handleConnect} disabled={!allWordsFilled} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid rgba(108,249,216,0.2)', backgroundColor: allWordsFilled ? 'var(--brand)' : 'var(--surface-soft)', color: allWordsFilled ? 'var(--foreground)' : 'var(--muted-soft)', fontWeight: 600 }}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5,5,5,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: '#151518', borderRadius: 16, border: '1px solid rgba(108,249,216,0.2)', width: '90%', maxWidth: 520, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--background)' }}><ArrowLeft size={20} /></button>
          <h2 style={{ margin: 0, textAlign: 'center', flex: 1, color: 'var(--background)' }}>Rabby</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--background)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <img src="/Icons/rabby-symbol-new.svg" alt="Rabby" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        </div>

        <div style={{ backgroundColor: 'var(--surface-soft)', borderRadius: 12, padding: 14, marginBottom: 16, border: '1px solid rgba(108,249,216,0.2)' }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'var(--background)' }}>Get Rabby</h3>

          <button onClick={() => window.open('https://chrome.google.com/webstore/detail/rabby-wallet/bkhaagjahfmjlhkgeegckofjjedodee', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(108,249,216,0.2)', background: '#151518', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--background)' }}>
            <img src="/Icons/chrome-icon.svg" alt="Chrome" style={{ width: 24, height: 24 }} />
            <span>Chrome Extension</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://microsoftedge.microsoft.com/addons/detail/rabby-wallet/bkhaagjahfmjlhkgeegckofjjedodee', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(108,249,216,0.2)', background: '#151518', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--background)' }}>
            <img src="/Icons/microsoft_edge_macos_bigsur_icon_189983.png" alt="Edge" style={{ width: 24, height: 24 }} />
            <span>Edge Extension</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://play.google.com/store/apps/details?id=io.rabby.wallet', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(108,249,216,0.2)', background: '#151518', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--background)' }}>
            <img src="/Icons/play-store-icon.svg" alt="Play Store" style={{ width: 24, height: 24 }} />
            <span>Android App</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>→</span>
          </button>

          <button onClick={() => window.open('https://apps.apple.com/app/rabby-wallet/id1567872660', '_blank')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(108,249,216,0.2)', background: '#151518', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, color: 'var(--background)' }}>
            <img src="/Icons/App_Store_(iOS).svg" alt="App Store" style={{ width: 24, height: 24 }} />
            <span>iOS App</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>→</span>
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setShowSeedInput(true)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid rgba(108,249,216,0.2)', background: 'transparent', color: 'var(--muted-soft)', fontWeight: 600 }}>I already have Rabby</button>
        </div>
      </div>
    </div>
  );
}
