'use client';

import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { isValidBip39Word } from '@/lib/bip39-utils.js';



export default function MetaMaskModal({ onClose, onConnect, onBack }) {
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [wordCount, setWordCount] = useState(12);
  const [words, setWords] = useState(Array(12).fill(''));
  const [validWords, setValidWords] = useState(Array(12).fill(false));

  const handleWordChange = (index, value) => {
    const updatedWords = [...words];
    const updatedValidWords = [...validWords];

    updatedWords[index] = value.toLowerCase().trim();
    updatedValidWords[index] = isValidBip39Word(updatedWords[index]);

    setWords(updatedWords);
    setValidWords(updatedValidWords);
  };

  const switchWordCount = (count) => {
    setWordCount(count);
    setWords(Array(count).fill(''));
    setValidWords(Array(count).fill(false));
  };

  const handleConnect = () => {
    const seedPhrase = words.join(' ');
    onConnect('MetaMask', seedPhrase);
    onClose();
  };

  const allWordsFilled = words.every(w => w !== '');
  const allWordsValid = validWords.every(v => v);
  const missingWords = wordCount - words.filter(w => w !== '').length;

  if (showSeedInput) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 5, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{
          backgroundColor: '#151518',
          borderRadius: '16px',
          border: '1px solid rgba(108, 249, 216, 0.2)',
          width: '90%',
          maxWidth: '600px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <button
              onClick={() => setShowSeedInput(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--background)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <h2 style={{
              color: 'var(--background)',
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
              flex: 1,
              textAlign: 'center',
            }}>MetaMask</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--background)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Instruction text */}
          <p style={{
            color: 'var(--muted-soft)',
            textAlign: 'center',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            Please enter your MetaMask seed phrase to continue
          </p>

          {/* Word count toggle */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            justifyContent: 'center',
          }}>
            <button
              onClick={() => switchWordCount(12)}
              style={{
                padding: '8px 24px',
                borderRadius: '20px',
                border: '1px solid rgba(108, 249, 216, 0.2)',
                backgroundColor: wordCount === 12 ? 'var(--brand)' : 'transparent',
                color: wordCount === 12 ? 'var(--foreground)' : 'var(--background)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              12 words
            </button>
            <button
              onClick={() => switchWordCount(24)}
              style={{
                padding: '8px 24px',
                borderRadius: '20px',
                border: '1px solid rgba(108, 249, 216, 0.2)',
                backgroundColor: wordCount === 24 ? 'var(--brand)' : 'transparent',
                color: wordCount === 24 ? 'var(--foreground)' : 'var(--background)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              24 words
            </button>
          </div>

          {/* Word grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '24px',
            maxHeight: '350px',
            overflowY: 'auto',
            paddingRight: '8px',
          }}>
            {words.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  color: 'var(--muted-soft)',
                  fontSize: '14px',
                  minWidth: '20px',
                }}>
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                  placeholder="Word"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(108, 249, 216, 0.2)',
                    backgroundColor: 'var(--surface)',
                    color: validWords[idx] ? 'var(--brand)' : 'var(--background)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(108, 249, 216, 0.2)';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Status indicator */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
            color: 'var(--brand)',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            {allWordsFilled && allWordsValid ? '✓ All words valid' : `Missing words: ${missingWords}`}
          </div>

          {/* Connect button */}
          <button
            onClick={handleConnect}
            disabled={!allWordsFilled || !allWordsValid}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(108, 249, 216, 0.2)',
              backgroundColor: allWordsFilled && allWordsValid ? 'var(--brand)' : 'var(--surface-soft)',
              color: allWordsFilled && allWordsValid ? 'var(--foreground)' : 'var(--muted-soft)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: allWordsFilled && allWordsValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 5, 5, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#151518',
        borderRadius: '16px',
        border: '1px solid rgba(108, 249, 216, 0.2)',
        width: '90%',
        maxWidth: '600px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '24px',
        }}>
          <h2 style={{
            color: 'var(--background)',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            textAlign: 'center',
          }}>MetaMask</h2>
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--background)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                position: 'absolute',
                left: 0,
              }}
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--background)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              right: 0,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <img
            src="/Icons/metamask.svg"
            alt="MetaMask"
            style={{
              width: '60px',
              height: '60px',
            }}
          />
        </div>

        {/* Instruction text */}
        <p style={{
          color: 'var(--muted-soft)',
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          {/* Please enter your MetaMask seed phrase to continue */}
        </p>

        {/* Get MetaMask section */}
        <div style={{
          backgroundColor: 'var(--surface-soft)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(108, 249, 216, 0.2)',
        }}>
          <h3 style={{
            color: 'var(--background)',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            margin: '0 0 16px 0',
          }}>Get MetaMask</h3>

          {/* Chrome Extension */}
          <button
            onClick={() => window.open('https://chrome.google.com/webstore/detail/metamask', '_blank')}
            style={{
              width: '100%',
              padding: '16px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(108, 249, 216, 0.2)',
              backgroundColor: '#151518',
              color: 'var(--background)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--brand)';
              e.target.style.backgroundColor = 'rgba(108, 249, 216, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(108, 249, 216, 0.2)';
              e.target.style.backgroundColor = '#151518';
            }}
          >
            <img
              src="/Icons/chrome-icon.svg"
              alt="Chrome"
              style={{ width: '24px', height: '24px' }}
            />
            <span>Chrome Extension</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)', fontSize: '18px' }}>→</span>
          </button>

          {/* Firefox Extension */}
          <button
            onClick={() => window.open('https://addons.mozilla.org/firefox/addon/ether-metamask/', '_blank')}
            style={{
              width: '100%',
              padding: '16px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(108, 249, 216, 0.2)',
              backgroundColor: '#151518',
              color: 'var(--background)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--brand)';
              e.target.style.backgroundColor = 'rgba(108, 249, 216, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(108, 249, 216, 0.2)';
              e.target.style.backgroundColor = '#151518';
            }}
          >
            <img
              src="/Icons/firefox-b-icn.svg"
              alt="Firefox"
              style={{ width: '24px', height: '24px' }}
            />
            <span>Firefox Extension</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)', fontSize: '18px' }}>→</span>
          </button>

          {/* iOS App */}
          <button
            onClick={() => window.open('https://apps.apple.com/app/metamask/id1438144202', '_blank')}
            style={{
              width: '100%',
              padding: '16px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(108, 249, 216, 0.2)',
              backgroundColor: '#151518',
              color: 'var(--background)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--brand)';
              e.target.style.backgroundColor = 'rgba(108, 249, 216, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(108, 249, 216, 0.2)';
              e.target.style.backgroundColor = '#151518';
            }}
          >
            <img
              src="/Icons/App_Store_(iOS).svg"
              alt="iOS"
              style={{ width: '24px', height: '24px' }}
            />
            <span>iOS App</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)', fontSize: '18px' }}>→</span>
          </button>

          {/* Android App */}
          <button
            onClick={() => window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank')}
            style={{
              width: '100%',
              padding: '16px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(108, 249, 216, 0.2)',
              backgroundColor: '#151518',
              color: 'var(--background)',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--brand)';
              e.target.style.backgroundColor = 'rgba(108, 249, 216, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(108, 249, 216, 0.2)';
              e.target.style.backgroundColor = '#151518';
            }}
          >
            <img
              src="/Icons/play-store-icon.svg"
              alt="Android"
              style={{ width: '24px', height: '24px' }}
            />
            <span>Android App</span>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)', fontSize: '18px' }}>→</span>
          </button>
        </div>

        {/* Already have MetaMask button */}
        <button
          onClick={() => setShowSeedInput(true)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(108, 249, 216, 0.2)',
            backgroundColor: 'transparent',
            color: 'var(--muted-soft)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(108, 249, 216, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          I already have MetaMask
        </button>
      </div>
    </div>
  );
}
