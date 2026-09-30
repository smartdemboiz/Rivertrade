'use client';

import { useRef, useState } from 'react';
import { X, Bookmark, Check, Clock, Link2, ArrowLeft } from 'lucide-react';

function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SendToWalletModal({ initialValue, onClose, onConfirm, connectedWalletAddress, connectedWalletLabel }) {
  const [value, setValue] = useState(initialValue || '');
  const [activePanel, setActivePanel] = useState('main');
  const [recentWallets, setRecentWallets] = useState([]);
  const [bookmarkedWallets, setBookmarkedWallets] = useState([]);
  const inputRef = useRef(null);
  const trimmedValue = value.trim();
  const isBookmarked = trimmedValue && bookmarkedWallets.includes(trimmedValue);

  function openRecentWallets() {
    setActivePanel('recent');
  }

  function openBookmarkedWallets() {
    setActivePanel('bookmarked');
  }

  function openConnectedWallets() {
    setActivePanel('connected');
  }

  function handleAddressSelect(address) {
    setValue(address);
    setActivePanel('main');
    inputRef.current?.focus();
  }

  function handleBookmarkToggle() {
    const address = trimmedValue;
    if (!address) return;
    if (isBookmarked) {
      setBookmarkedWallets((prev) => prev.filter((a) => a !== address));
    } else {
      setBookmarkedWallets((prev) => [address, ...prev.filter((a) => a !== address)].slice(0, 10));
    }
  }

  function handleConfirm() {
    const address = trimmedValue;
    if (!address) return;
    setRecentWallets((prev) => [address, ...prev.filter((a) => a !== address)].slice(0, 10));
    onConfirm(address);
  }

  function handleConnectedSelect() {
    if (connectedWalletAddress) {
      handleAddressSelect(connectedWalletAddress);
    }
  }

  function renderEmptyPanel(title, subtitle, icon) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 20px' }}>
        <div style={{ width: 72, height: 72, borderRadius: 24, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        </div>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ margin: 0, color: 'var(--text-dim)', textAlign: 'center', maxWidth: 320 }}>{subtitle}</p>
      </div>
    );
  }

  if (activePanel === 'recent') {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="close-btn" onClick={() => setActivePanel('main')} aria-label="Back"><ArrowLeft size={16} /></button>
              <h2>Recent wallets</h2>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="modal-body" style={{ paddingTop: 4 }}>
            {recentWallets.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentWallets.map((address) => (
                  <button
                    key={address}
                    onClick={() => handleAddressSelect(address)}
                    className="wallet-category-row"
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700 }}>{truncateAddress(address)}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{address}</span>
                    </div>
                    <span style={{ color: 'var(--cyan)', fontSize: 13 }}>Select</span>
                  </button>
                ))}
              </div>
            ) : renderEmptyPanel('No recent wallets', 'Your recently used wallet addresses will appear here.', <Clock size={24} color="rgba(255,255,255,0.7)" />)}
          </div>
        </div>
      </div>
    );
  }

  if (activePanel === 'bookmarked') {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="close-btn" onClick={() => setActivePanel('main')} aria-label="Back"><ArrowLeft size={16} /></button>
              <h2>Bookmarked wallets</h2>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="modal-body" style={{ paddingTop: 4 }}>
            {bookmarkedWallets.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookmarkedWallets.map((address) => (
                  <button
                    key={address}
                    onClick={() => handleAddressSelect(address)}
                    className="wallet-category-row"
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700 }}>{truncateAddress(address)}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{address}</span>
                    </div>
                    <span style={{ color: 'var(--cyan)', fontSize: 13 }}>Select</span>
                  </button>
                ))}
              </div>
            ) : renderEmptyPanel('No bookmarked wallets', 'Save your frequently used wallet addresses for quick access.', <Bookmark size={24} color="rgba(255,255,255,0.7)" />)}
          </div>
        </div>
      </div>
    );
  }

  if (activePanel === 'connected') {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="close-btn" onClick={() => setActivePanel('main')} aria-label="Back"><ArrowLeft size={16} /></button>
              <h2>Connected wallets</h2>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="modal-body" style={{ paddingTop: 4 }}>
            {connectedWalletAddress ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={handleConnectedSelect}
                  className="wallet-category-row"
                  style={{ justifyContent: 'space-between', width: '100%' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700 }}>{connectedWalletLabel?.replace(/^Connected \((.*)\)$/, '$1') || 'Connected wallet'}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{truncateAddress(connectedWalletAddress)}</span>
                  </div>
                  <span style={{ color: 'var(--cyan)', fontSize: 13 }}>Select</span>
                </button>
              </div>
            ) : renderEmptyPanel('No connected wallets', 'Connect a wallet to see it listed here.', <Link2 size={24} color="rgba(255,255,255,0.7)" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Send To Wallet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-search-box" style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              className="modal-search-input"
              style={{ paddingLeft: 16 }}
              placeholder="Enter 0x... or ENS domain"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleBookmarkToggle}
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: isBookmarked ? 'rgba(236, 72, 153, 0.2)' : 'var(--field)',
                border: `1px solid ${isBookmarked ? 'var(--pink)' : 'var(--border)'}`,
                color: isBookmarked ? 'var(--pink)' : 'var(--text-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Bookmark size={18} />
            </button>
          </div>

          <button
            className="connect-btn"
            style={{ width: '100%', marginBottom: 20, padding: 14, fontSize: 15 }}
            onClick={handleConfirm}
          >
            <Check size={16} /> Confirm Destination Address
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={openRecentWallets} className="wallet-category-row">
              <span style={{ color: 'var(--cyan)' }}><Clock size={16} /></span><span>Recent Wallets</span>
            </button>
            <button onClick={openConnectedWallets} className="wallet-category-row">
              <span style={{ color: 'var(--purple)' }}><Link2 size={16} /></span><span>Connected Wallets</span>
            </button>
            <button onClick={openBookmarkedWallets} className="wallet-category-row">
              <span style={{ color: 'var(--pink)' }}><Bookmark size={16} /></span><span>Bookmarked Wallets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
