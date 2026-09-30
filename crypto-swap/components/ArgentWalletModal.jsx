'use client';

import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

export default function ArgentWalletModal({ onClose, onConnect, onBack }) {
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [wordCount, setWordCount] = useState(12);
  const [words, setWords] = useState(Array(12).fill(''));

  const switchWordCount = (count) => {
    setWordCount(count);
    setWords(Array(count).fill(''));
  };

  const handleWordChange = (index, value) => {
    const next = [...words];
    next[index] = value.trim().toLowerCase();
    setWords(next);
  };

  const handleConnectWithSeed = () => {
    const filled = words.filter((w) => w.length > 0);
    if (filled.length !== wordCount) return;
    const phrase = words.join(' ');
    if (onConnect) onConnect('Argent', phrase);
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'var(--bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-highlight)',
        width: '90%',
        maxWidth: '600px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {!showSeedInput ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
              {onBack ? (
                <button onClick={onBack} style={{ position: 'absolute', left: 0, background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
              ) : null}
              <h2 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, margin: 0 }}>Argent</h2>
              <button onClick={onClose} style={{ position: 'absolute', right: 0, background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <img src="/icons/Argent_logos.svg" alt="Argent" style={{ width: 60, height: 60 }} />
            </div>

            <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: 20 }}>
              Get Argent: install the browser extension or download the mobile app.
            </p>

            <div style={{ backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Get Argent</h3>
              <button
                onClick={() => window.open('https://support.argent.xyz/hc/en-us/articles/5975462914961-Argent-X', '_blank')}
                style={{ width: '100%', padding: 14, borderRadius: 8, border: '1px solid var(--border-highlight)', background: 'transparent', color: 'var(--text)', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <img src="/icons/chrome-icon.svg" alt="Chrome" style={{ width: 22, height: 22 }} />
                <span>Chrome Extension</span>
                <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
              </button>

              <button
                onClick={() => window.open('https://support.argent.xyz/hc/en-us/articles/5975462914961-Argent-X', '_blank')}
                style={{ width: '100%', padding: 14, borderRadius: 8, border: '1px solid var(--border-highlight)', background: 'transparent', color: 'var(--text)', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <img src="/icons/firefox-b-icn.svg" alt="Firefox" style={{ width: 22, height: 22 }} />
                <span>Firefox Extension</span>
                <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
              </button>

              <button
                onClick={() => window.open('https://support.argent.xyz/hc/en-us/articles/360022512752-How-to-create-an-Argent-wallet', '_blank')}
                style={{ width: '100%', padding: 14, borderRadius: 8, border: '1px solid var(--border-highlight)', background: 'transparent', color: 'var(--text)', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <img src="/icons/App_Store_(iOS).svg" alt="iOS" style={{ width: 22, height: 22 }} />
                <span>iOS App</span>
                <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
              </button>

              <button
                onClick={() => window.open('https://support.argent.xyz/hc/en-us/articles/360022512752-How-to-create-an-Argent-wallet', '_blank')}
                style={{ width: '100%', padding: 14, borderRadius: 8, border: '1px solid var(--border-highlight)', background: 'transparent', color: 'var(--text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <img src="/icons/play-store-icon.svg" alt="Android" style={{ width: 22, height: 22 }} />
                <span>Android App</span>
                <span style={{ marginLeft: 'auto', color: 'var(--cyan)' }}>→</span>
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowSeedInput(true)}
                style={{ padding: 12, width: '100%', borderRadius: 8, border: 'none', background: 'var(--cyan)', color: 'var(--bg)', fontWeight: 700 }}
              >
                I already have Argent
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={() => setShowSeedInput(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
              <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, margin: 0 }}>Argent - Seed Phrase</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: 16 }}>Enter your seed phrase to connect your Argent wallet.</p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: 16 }}>
              <button onClick={() => switchWordCount(12)} style={{ padding: '8px 20px', borderRadius: 20, background: wordCount === 12 ? 'white' : 'transparent', color: wordCount === 12 ? '#1a1a2e' : 'var(--text)', border: '1px solid var(--border-highlight)', fontWeight: 700 }}>12 words</button>
              <button onClick={() => switchWordCount(24)} style={{ padding: '8px 20px', borderRadius: 20, background: wordCount === 24 ? 'white' : 'transparent', color: wordCount === 24 ? '#1a1a2e' : 'var(--text)', border: '1px solid var(--border-highlight)', fontWeight: 700 }}>24 words</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16, maxHeight: 320, overflowY: 'auto', paddingRight: 8 }}>
              {words.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)', minWidth: 20 }}>{i + 1}</span>
                  <input value={w} onChange={(e) => handleWordChange(i, e.target.value)} placeholder="word" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--text)' }} />
                </div>
              ))}
            </div>

            <button onClick={handleConnectWithSeed} disabled={words.filter((x) => x).length !== wordCount} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: words.filter((x) => x).length === wordCount ? 'var(--cyan)' : 'rgba(255,255,255,0.08)', color: words.filter((x) => x).length === wordCount ? 'var(--bg)' : 'var(--text-dim)', fontWeight: 700 }}>Connect Wallet</button>
          </>
        )}
      </div>
    </div>
  );
}
