'use client';

import { useState } from 'react';
import { X, ShieldCheck, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { walletConnectors, allWalletsList } from '@/lib/data';
import TrustWalletModal from './TrustWalletModal';
import TrezorWalletModal from './TrezorWalletModal';
import LedgerWalletModal from './LedgerWalletModal';
import NonWeb3WalletModal from './NonWeb3WalletModal';
import MetaMaskModal from './MetaMaskModal';
import WalletConnectModal from './WalletConnectModal';
import UniswapWalletModal from './UniswapWalletModal';
import CoinbaseWalletModal from './CoinbaseWalletModal';
import ExodusWalletModal from './ExodusWalletModal';
import PhantomWalletModal from './PhantomWalletModal';
import ZengoWalletModal from './ZengoWalletModal';
import OKXWalletModal from './OKXWalletModal';
import SafeWalletModal from './SafeWalletModal';
import GnosisSafeWalletModal from './GnosisSafeWalletModal';
import ArgentWalletModal from './ArgentWalletModal';
import RainbowWalletModal from './RainbowWalletModal';
import RabbyWalletModal from './RabbyWalletModal';
import ZerionWalletModal from './ZerionWalletModal';
import BackpackWalletModal from './BackpackWalletModal';
import ImTokenWalletModal from './ImTokenWalletModal';
import FrameWalletModal from './FrameWalletModal';
import TokenPocketWalletModal from './TokenPocketWalletModal';
import MathWalletWalletModal from './MathWalletWalletModal';
import BitgetWalletModal from './BitgetWalletModal';
import OperaWalletModal from './OperaWalletModal';
import OneInchWalletModal from './OneInchWalletModal';
import Coin98WalletModal from './Coin98WalletModal';
import FireblocksWalletModal from './FireblocksWalletModal';
import BloctoWalletModal from './BloctoWalletModal';
import BraveWalletModal from './BraveWalletModal';
import AmbireWalletModal from './AmbireWalletModal';
import XDEFIWalletModal from './XDEFIWalletModal';

export default function ConnectWalletModal({ onClose, onConnect }) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [showMetaMaskWallet, setShowMetaMaskWallet] = useState(false);
  const [showTrustWallet, setShowTrustWallet] = useState(false);
  const [showTrezorWallet, setShowTrezorWallet] = useState(false);
  const [showLedgerWallet, setShowLedgerWallet] = useState(false);
  const [showNonWeb3Wallet, setShowNonWeb3Wallet] = useState(false);
  const [showExodusWallet, setShowExodusWallet] = useState(false);
  const [showPhantomWallet, setShowPhantomWallet] = useState(false);
  const [showZengoWallet, setShowZengoWallet] = useState(false);
  const [showOKXWallet, setShowOKXWallet] = useState(false);
  const [showSafeWallet, setShowSafeWallet] = useState(false);
  const [showGnosisSafeWallet, setShowGnosisSafeWallet] = useState(false);
  const [showAmbireWallet, setShowAmbireWallet] = useState(false);
  const [showAmbireWalletConnect, setShowAmbireWalletConnect] = useState(false);
  const [showArgentWallet, setShowArgentWallet] = useState(false);
  const [showRainbowWallet, setShowRainbowWallet] = useState(false);
  const [showRabbyWallet, setShowRabbyWallet] = useState(false);
  const [showZerionWallet, setShowZerionWallet] = useState(false);
  const [showZerionWalletConnect, setShowZerionWalletConnect] = useState(false);
  const [showBackpackWallet, setShowBackpackWallet] = useState(false);
  const [showBackpackWalletConnect, setShowBackpackWalletConnect] = useState(false);
  const [showImTokenWallet, setShowImTokenWallet] = useState(false);
  const [showImTokenWalletConnect, setShowImTokenWalletConnect] = useState(false);
  const [showFrameWallet, setShowFrameWallet] = useState(false);
  const [showFrameWalletConnect, setShowFrameWalletConnect] = useState(false);
  const [showTokenPocketWallet, setShowTokenPocketWallet] = useState(false);
  const [showTokenPocketWalletConnect, setShowTokenPocketWalletConnect] = useState(false);
  const [showMathWallet, setShowMathWallet] = useState(false);
  const [showMathWalletConnect, setShowMathWalletConnect] = useState(false);
  const [showBitgetWallet, setShowBitgetWallet] = useState(false);
  const [showOperaWallet, setShowOperaWallet] = useState(false);
  const [showOneInchWallet, setShowOneInchWallet] = useState(false);
  const [showCoin98Wallet, setShowCoin98Wallet] = useState(false);
  const [showFireblocksWallet, setShowFireblocksWallet] = useState(false);
  const [showBloctoWallet, setShowBloctoWallet] = useState(false);
  const [showBraveWallet, setShowBraveWallet] = useState(false);
  const [showXDEFIWallet, setShowXDEFIWallet] = useState(false);
  const [walletModalType, setWalletModalType] = useState(null);

  const walletIconMap = {
    'MetaMask': '/icons/metamask.svg',
    'Coinbase Wallet': '/icons/coinbase.svg',
    'WalletConnect': '/icons/walletConnect.svg',
    'Trust Wallet': '/icons/trust_wallet-.svg',
    'Uniswap Wallet': '/icons/uniswap-uni-icon.svg',
    'Trezor': '/icons/trezor.png',
    'Ledger': '/icons/ledger.png',
    'Non-web3 wallets': '/icons/non-web3-wallets.png',
    'Zengo': '/icons/zengo-icn.svg',
    'Zengo Wallet': '/icons/zengo-icn.svg',
    'Safe': '/icons/safe_log.jpeg',
    'Safe Wallet': '/icons/safe_log.jpeg',
    'Gnosis': '/icons/Gnosissafe_logos.svg',
    'Gnosis Safe': '/icons/Gnosissafe_logos.svg',
    'Rainbow': '/icons/rainbow_log.png',
    'Rainbow Wallet': '/icons/rainbow_log.png',
    'Rabby': '/icons/rabby-symbol-new.svg',
    'Rabby Wallet': '/icons/rabby-symbol-new.svg',
    'Phantom': '/icons/Phantom_SVG_Icon.svg',
    'Phantom Wallet': '/icons/Phantom_SVG_Icon.svg',
    'OKX': '/icons/OKX Icon.png',
    'OKX Wallet': '/icons/OKX Icon.png',
    'Frame': '/icons/framemint.webp',
    'Frame Wallet': '/icons/framemint.webp',
    'Framem Wallet': '/icons/framemint.webp',
    'Bitget': '/icons/Bitget Icon.png',
    'Bitget Wallet': '/icons/Bitget Icon.png',
    'Backpack': '/icons/backpack-Symbol.svg',
    'Backpack Wallet': '/icons/backpack-Symbol.svg',
    'Exodus': '/icons/exodus-logo.svg',
    'Exodus Wallet': '/icons/exodus-logo.svg',
    'Coin98': '/icons/coin98-c98-logo.svg',
    'Coin98 Wallet': '/icons/coin98-c98-logo.svg',
    'Brave Wallet': '/icons/brave-logo.svg',
    'Brave': '/icons/brave-logo.svg',
    'Argent': '/icons/Argent_logos.svg',
    'Argent Wallet': '/icons/Argent_logos.svg',
    'Zerion': '/icons/Zerion.log.png',
    'Zerion Wallet': '/icons/Zerion.log.png',
    'Opera Wallet': '/icons/opera-wallet_.jpg',
    'Opera': '/icons/opera-wallet_.jpg',
    'MathWallet': '/icons/MathWallet_Icon.png',
    'Math Wallet': '/icons/MathWallet_Icon.png',
    'TokenPocket': '/icons/tokenpocket_17.png',
    'TokenPocket Wallet': '/icons/tokenpocket_17.png',
    'imToken': '/icons/imtoken.png',
    'imToken Wallet': '/icons/imtoken.png',
    '1inch Wallet': '/icons/1inch-1inch-logo.svg',
    '1inch': '/icons/1inch-1inch-logo.svg',
    'Ambire': '/icons/ambire purple.png',
    'Ambire Wallet': '/icons/ambire purple.png',
    'XDEFI': '/icons/XDEFI-log.jpg',
    'XDEFI Wallet': '/icons/XDEFI-log.jpg',
    'Fireblocks': '/icons/fireblocks_logos.svg',
    'Fireblocks Wallet': '/icons/fireblocks_logos.svg',
    'Blocto': '/icons/Blocto-log.png',
    'Blocto Wallet': '/icons/Blocto-log.png',
  };

  const q = search.trim().toLowerCase();
  const filteredWallets = allWalletsList.filter((w) => w.toLowerCase().includes(q));

  if (showMetaMaskWallet) {
    return (
      <MetaMaskModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowMetaMaskWallet(false)}
      />
    );
  }

  if (showTrustWallet) {
    return (
      <TrustWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowTrustWallet(false)}
      />
    );
  }

  if (showTrezorWallet) {
    return (
      <TrezorWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowTrezorWallet(false)}
      />
    );
  }

  if (showLedgerWallet) {
    return (
      <LedgerWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowLedgerWallet(false)}
      />
    );
  }

  if (showNonWeb3Wallet) {
    return (
      <NonWeb3WalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowNonWeb3Wallet(false)}
      />
    );
  }

  if (showExodusWallet) {
    return (
      <ExodusWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowExodusWallet(false)}
      />
    );
  }

  if (showPhantomWallet) {
    return (
      <PhantomWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowPhantomWallet(false)}
      />
    );
  }

  if (showZengoWallet) {
    return (
      <ZengoWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowZengoWallet(false)}
      />
    );
  }

  if (showOKXWallet) {
    return (
      <OKXWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowOKXWallet(false)}
      />
    );
  }

  if (showSafeWallet) {
    return (
      <SafeWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowSafeWallet(false)}
      />
    );
  }

  if (showGnosisSafeWallet) {
    return (
      <GnosisSafeWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowGnosisSafeWallet(false)}
      />
    );
  }

  if (showAmbireWalletConnect) {
    return (
      <WalletConnectModal
        walletName="Ambire Wallet"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowAmbireWalletConnect(false);
          setShowAmbireWallet(true);
        }}
      />
    );
  }

  if (showAmbireWallet) {
    return (
      <AmbireWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowAmbireWallet(false)}
        onStartConnect={() => {
          setShowAmbireWallet(false);
          setShowAmbireWalletConnect(true);
        }}
      />
    );
  }

  if (showArgentWallet) {
    return (
      <ArgentWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowArgentWallet(false)}
      />
    );
  }

  if (showRainbowWallet) {
    return (
      <RainbowWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowRainbowWallet(false)}
      />
    );
  }

  if (showRabbyWallet) {
    return (
      <RabbyWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowRabbyWallet(false)}
      />
    );
  }

  if (showZerionWalletConnect) {
    return (
      <WalletConnectModal
        walletName="Zerion"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowZerionWalletConnect(false);
          setShowZerionWallet(true);
        }}
      />
    );
  }

  if (showZerionWallet) {
    return (
      <ZerionWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowZerionWallet(false)}
        onStartConnect={() => {
          setShowZerionWallet(false);
          setShowZerionWalletConnect(true);
        }}
      />
    );
  }

  if (showBackpackWalletConnect) {
    return (
      <WalletConnectModal
        walletName="Backpack Wallet"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowBackpackWalletConnect(false);
          setShowBackpackWallet(true);
        }}
      />
    );
  }

  if (showBackpackWallet) {
    return (
      <BackpackWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowBackpackWallet(false)}
        onStartConnect={() => {
          setShowBackpackWallet(false);
          setShowBackpackWalletConnect(true);
        }}
      />
    );
  }

  if (showImTokenWalletConnect) {
    return (
      <WalletConnectModal
        walletName="imToken Wallet"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowImTokenWalletConnect(false);
          setShowImTokenWallet(true);
        }}
      />
    );
  }

  if (showImTokenWallet) {
    return (
      <ImTokenWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowImTokenWallet(false)}
        onStartConnect={() => {
          setShowImTokenWallet(false);
          setShowImTokenWalletConnect(true);
        }}
      />
    );
  }

  if (showFrameWalletConnect) {
    return (
      <WalletConnectModal
        walletName="Frame Wallet"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowFrameWalletConnect(false);
          setShowFrameWallet(true);
        }}
      />
    );
  }

  if (showFrameWallet) {
    return (
      <FrameWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowFrameWallet(false)}
        onStartConnect={() => {
          setShowFrameWallet(false);
          setShowFrameWalletConnect(true);
        }}
      />
    );
  }

  if (showMathWalletConnect) {
    return (
      <WalletConnectModal
        walletName="Math Wallet"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowMathWalletConnect(false);
          setShowMathWallet(true);
        }}
      />
    );
  }

  if (showTokenPocketWalletConnect) {
    return (
      <WalletConnectModal
        walletName="TokenPocket Wallet"
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => {
          setShowTokenPocketWalletConnect(false);
          setShowTokenPocketWallet(true);
        }}
      />
    );
  }

  if (showMathWallet) {
    return (
      <MathWalletWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowMathWallet(false)}
        onStartConnect={() => {
          setShowMathWallet(false);
          setShowMathWalletConnect(true);
        }}
      />
    );
  }

  if (showBitgetWallet) {
    return (
      <BitgetWalletModal
        onClose={onClose}
        onBack={() => setShowBitgetWallet(false)}
      />
    );
  }

  if (showOperaWallet) {
    return (
      <OperaWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowOperaWallet(false)}
      />
    );
  }

  if (showOneInchWallet) {
    return (
      <OneInchWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowOneInchWallet(false)}
      />
    );
  }

  if (showCoin98Wallet) {
    return (
      <Coin98WalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowCoin98Wallet(false)}
      />
    );
  }

  if (showFireblocksWallet) {
    return (
      <FireblocksWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowFireblocksWallet(false)}
      />
    );
  }

  if (showBloctoWallet) {
    return (
      <BloctoWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowBloctoWallet(false)}
      />
    );
  }

  if (showBraveWallet) {
    return (
      <BraveWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowBraveWallet(false)}
      />
    );
  }

  if (showXDEFIWallet) {
    return (
      <XDEFIWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowXDEFIWallet(false)}
      />
    );
  }

  if (showTokenPocketWallet) {
    return (
      <TokenPocketWalletModal
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setShowTokenPocketWallet(false)}
        onStartConnect={() => {
          setShowTokenPocketWallet(false);
          setShowTokenPocketWalletConnect(true);
        }}
      />
    );
  }

  if (walletModalType) {
    if (walletModalType === 'Uniswap Wallet') {
      return (
        <UniswapWalletModal
          onClose={onClose}
          onConnect={onConnect}
          onBack={() => setWalletModalType(null)}
        />
      );
    }

    if (walletModalType === 'Coinbase Wallet') {
      return (
        <CoinbaseWalletModal
          onClose={onClose}
          onConnect={onConnect}
          onBack={() => setWalletModalType(null)}
        />
      );
    }

    return (
      <WalletConnectModal
        walletName={walletModalType}
        onClose={onClose}
        onConnect={onConnect}
        onBack={() => setWalletModalType(null)}
      />
    );
  }

  if (!showAll) {
    return (
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content wallet-connect-modal">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} /><h2>Connect Wallet</h2></div>
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {walletConnectors.map((w) => (
                <button key={w.id} onClick={() => {
                  if (w.label === 'MetaMask') {
                    setShowMetaMaskWallet(true);
                  } else if (w.label === 'Trust Wallet') {
                    setShowTrustWallet(true);
                  } else if (w.label === 'Uniswap Wallet' || w.label === 'WalletConnect' || w.label === 'Coinbase Wallet') {
                    setWalletModalType(w.label);
                  } else if (w.label === 'Trezor Wallet') {
                    setShowTrezorWallet(true);
                  } else if (w.label === 'Ledger Wallet') {
                    setShowLedgerWallet(true);
                  } else if (w.label === 'Non-web3 wallets') {
                    setShowNonWeb3Wallet(true);
                  } else if (w.label === 'Exodus' || w.label === 'Exodus Wallet') {
                    setShowExodusWallet(true);
                  } else if (w.label === 'Phantom' || w.label === 'Phantom Wallet') {
                    setShowPhantomWallet(true);
                  } else if (w.label === 'Zengo' || w.label === 'Zengo Wallet') {
                    setShowZengoWallet(true);
                  } else if (w.label === 'Zerion' || w.label === 'Zerion Wallet') {
                    setShowZerionWallet(true);
                  } else if (w.label === 'Backpack' || w.label === 'Backpack Wallet') {
                    setShowBackpackWallet(true);
                  } else if (w.label === 'Frame' || w.label === 'Frame Wallet') {
                    setShowFrameWallet(true);
                  } else if (w.label === 'imToken' || w.label === 'imToken Wallet') {
                    setShowImTokenWallet(true);
                  } else if (w.label === 'TokenPocket' || w.label === 'TokenPocket Wallet') {
                    setShowTokenPocketWallet(true);
                  } else if (w.label === 'MathWallet' || w.label === 'Math Wallet') {
                    setShowMathWallet(true);
                  } else if (w.label === 'OKX' || w.label === 'OKX Wallet') {
                    setShowOKXWallet(true);
                  } else if (w.label === 'Argent' || w.label === 'Argent Wallet') {
                    setShowArgentWallet(true);
                  } else if (w.label === 'Rainbow' || w.label === 'Rainbow Wallet') {
                    setShowRainbowWallet(true);
                  } else if (w.label === 'Rabby' || w.label === 'Rabby Wallet') {
                    setShowRabbyWallet(true);
                  } else if (w.label === 'Safe' || w.label === 'Safe Wallet' || w.id === 'safe') {
                    setShowSafeWallet(true);
                  } else {
                    onConnect(w.label);
                  }
                }} className="wallet-connector-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {w.icon ? (
                      <img src={w.icon} alt={w.label} className="wallet-icon-img" />
                    ) : (
                      <span className="wallet-avatar-badge">{w.label.slice(0, 1)}</span>
                    )}
                    <span>{w.label}</span>
                  </div>
                  {w.badge && <span className="badge badge-best">{w.badge}</span>}
                </button>
              ))}
              <button onClick={() => setShowAll(true)} className="wallet-connector-row" style={{ borderStyle: 'dashed', borderColor: 'var(--border-highlight)', color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--cyan)' }}><Sparkles size={20} /></span><span>All Wallets</span>
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>{allWalletsList.length}+</span>
              </button>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}>
                New to Web3? <a href="#" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>Learn how to set up a wallet</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content wallet-all-modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="close-btn" onClick={() => setShowAll(false)} aria-label="Back" style={{ marginRight: 4 }}><ArrowLeft size={16} /></button>
            <h2>Select Wallet</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-search-box">
            <Search size={16} />
            <input
              placeholder="Search 300+ wallets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="modal-search-input"
              autoFocus
            />
          </div>
          <div className="wallet-grid">
            {filteredWallets.map((name) => {
              const icon = walletIconMap[name];
              return (
                <button key={name} className="wallet-grid-item" onClick={() => {
                  if (name === 'MetaMask') {
                    setShowMetaMaskWallet(true);
                  } else if (name === 'Trust Wallet') {
                    setShowTrustWallet(true);
                  } else if (name === 'Uniswap Wallet' || name === 'WalletConnect' || name === 'Coinbase Wallet') {
                    setWalletModalType(name);
                  } else if (name === 'Trezor') {
                    setShowTrezorWallet(true);
                  } else if (name === 'Ledger') {
                    setShowLedgerWallet(true);
                  } else if (name === 'Non-web3 wallets') {
                    setShowNonWeb3Wallet(true);
                  } else if (name === 'Exodus' || name === 'Exodus Wallet') {
                    setShowExodusWallet(true);
                  } else if (name === 'Phantom' || name === 'Phantom Wallet') {
                    setShowPhantomWallet(true);
                  } else if (name === 'Zengo' || name === 'Zengo Wallet') {
                    setShowZengoWallet(true);
                  } else if (name === 'Zerion' || name === 'Zerion Wallet') {
                    setShowZerionWallet(true);
                  } else if (name === 'Backpack' || name === 'Backpack Wallet') {
                    setShowBackpackWallet(true);
                  } else if (name === 'Frame' || name === 'Frame Wallet') {
                    setShowFrameWallet(true);
                  } else if (name === 'imToken' || name === 'imToken Wallet') {
                    setShowImTokenWallet(true);
                  } else if (name === 'TokenPocket' || name === 'TokenPocket Wallet') {
                    setShowTokenPocketWallet(true);
                  } else if (name === 'MathWallet' || name === 'Math Wallet') {
                    setShowMathWallet(true);
                  } else if (name === 'Bitget' || name === 'Bitget Wallet') {
                    setShowBitgetWallet(true);
                  } else if (name === 'Opera' || name === 'Opera Wallet') {
                    setShowOperaWallet(true);
                  } else if (name === 'Coin98' || name === 'Coin98 Wallet') {
                    setShowCoin98Wallet(true);
                  } else if (name === 'Fireblocks' || name === 'Fireblocks Wallet') {
                    setShowFireblocksWallet(true);
                  } else if (name === 'Blocto' || name === 'Blocto Wallet') {
                    setShowBloctoWallet(true);
                  } else if (name === 'Brave' || name === 'Brave Wallet') {
                    setShowBraveWallet(true);
                  } else if (name === 'XDEFI' || name === 'XDEFI Wallet') {
                    setShowXDEFIWallet(true);
                  } else if (name === '1inch' || name === '1inch Wallet') {
                    setShowOneInchWallet(true);
                  } else if (name === 'OKX' || name === 'OKX Wallet') {
                    setShowOKXWallet(true);
                  } else if (name === 'Argent' || name === 'Argent Wallet') {
                    setShowArgentWallet(true);
                  } else if (name === 'Rainbow' || name === 'Rainbow Wallet') {
                    setShowRainbowWallet(true);
                  } else if (name === 'Rabby' || name === 'Rabby Wallet') {
                    setShowRabbyWallet(true);
                  } else if (name === 'Safe' || name === 'Safe Wallet') {
                    setShowSafeWallet(true);
                  } else if (name === 'Gnosis Safe' || name === 'Gnosis') {
                    setShowGnosisSafeWallet(true);
                  } else if (name === 'Ambire' || name === 'Ambire Wallet') {
                    setShowAmbireWallet(true);
                  } else {
                    onConnect(name);
                  }
                }}>
                  {icon ? (
                    <img
                      src={icon}
                      alt={name}
                      className="wallet-icon-img small"
                      style={
                        (name === 'Gnosis Safe' || name === 'Gnosis' || name === 'TokenPocket' || name === 'TokenPocket Wallet')
                          ? {
                              backgroundColor: '#ffffff',
                              borderRadius: '50%',
                              padding: 8,
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                              filter: 'contrast(1.4) brightness(1.05)',
                              transform: 'scale(1.05)',
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <span className="wallet-avatar-badge small">{name.slice(0, 1)}</span>
                  )}
                  <span className="wallet-grid-name">{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
