'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ShieldCheck, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { allWalletsList, walletConnectors } from '@/lib/data';
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
  const [connectionError, setConnectionError] = useState('');

  const selectSupportedWallet = (wallet) => {
    setConnectionError('');

    if (wallet.id === 'injected') {
      if (window.ethereum?.request) {
        connectBrowserWallet();
      } else {
        setShowMetaMaskWallet(true);
      }
    } else if (wallet.id === 'walletConnect' || wallet.id === 'coinbase') {
      setWalletModalType(wallet.label);
    } else if (wallet.id === 'trustWallet') {
      setShowTrustWallet(true);
    } else if (wallet.id === 'trezor') {
      setShowTrezorWallet(true);
    } else if (wallet.id === 'ledger') {
      setShowLedgerWallet(true);
    } else if (wallet.id === 'non-web3') {
      setShowNonWeb3Wallet(true);
    }
  };

  const connectBrowserWallet = async () => {
    setConnectionError('');
    const provider = window.ethereum;
    if (!provider?.request) {
      setConnectionError('No browser wallet extension was detected.');
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (!accounts?.[0]) throw new Error('No account was returned.');
      onConnect('MetaMask', accounts[0]);
      onClose();
    } catch (error) {
      setConnectionError(error?.code === 4001
        ? 'Wallet connection was rejected.'
        : 'Unable to connect to the browser wallet.');
    }
  };

  const walletIconMap = {
    'MetaMask': '/Icons/metamask.svg',
    'Coinbase Wallet': '/Icons/coinbase.svg',
    'WalletConnect': '/Icons/walletConnect.svg',
    'Trust Wallet': '/Icons/trust_wallet-.svg',
    'Uniswap Wallet': '/Icons/uniswap-uni-icon.svg',
    'Trezor': '/Icons/trezor.png',
    'Ledger': '/Icons/ledger.png',
    'Non-web3 wallets': '/Icons/non-web3-wallets.png',
    'Zengo': '/Icons/zengo-icn.svg',
    'Zengo Wallet': '/Icons/zengo-icn.svg',
    'Safe': '/Icons/safe_log.jpeg',
    'Safe Wallet': '/Icons/safe_log.jpeg',
    'Gnosis': '/Icons/Gnosissafe_logos.svg',
    'Gnosis Safe': '/Icons/Gnosissafe_logos.svg',
    'Rainbow': '/Icons/rainbow_log.png',
    'Rainbow Wallet': '/Icons/rainbow_log.png',
    'Rabby': '/Icons/rabby-symbol-new.svg',
    'Rabby Wallet': '/Icons/rabby-symbol-new.svg',
    'Phantom': '/Icons/Phantom_SVG_Icon.svg',
    'Phantom Wallet': '/Icons/Phantom_SVG_Icon.svg',
    'OKX': '/Icons/OKX Icon.png',
    'OKX Wallet': '/Icons/OKX Icon.png',
    'Frame': '/Icons/framemint.webp',
    'Frame Wallet': '/Icons/framemint.webp',
    'Framem Wallet': '/Icons/framemint.webp',
    'Bitget': '/Icons/Bitget Icon.png',
    'Bitget Wallet': '/Icons/Bitget Icon.png',
    'Backpack': '/Icons/backpack-Symbol.svg',
    'Backpack Wallet': '/Icons/backpack-Symbol.svg',
    'Exodus': '/Icons/exodus-logo.svg',
    'Exodus Wallet': '/Icons/exodus-logo.svg',
    'Coin98': '/Icons/coin98-c98-logo.svg',
    'Coin98 Wallet': '/Icons/coin98-c98-logo.svg',
    'Brave Wallet': '/Icons/brave-logo.svg',
    'Brave': '/Icons/brave-logo.svg',
    'Argent': '/Icons/Argent_logos.svg',
    'Argent Wallet': '/Icons/Argent_logos.svg',
    'Zerion': '/Icons/Zerion.log.png',
    'Zerion Wallet': '/Icons/Zerion.log.png',
    'Opera Wallet': '/Icons/opera-wallet_.jpg',
    'Opera': '/Icons/opera-wallet_.jpg',
    'MathWallet': '/Icons/MathWallet_Icon.png',
    'Math Wallet': '/Icons/MathWallet_Icon.png',
    'TokenPocket': '/Icons/tokenpocket_17.png',
    'TokenPocket Wallet': '/Icons/tokenpocket_17.png',
    'imToken': '/Icons/imtoken.png',
    'imToken Wallet': '/Icons/imtoken.png',
    '1inch Wallet': '/Icons/1inch-1inch-logo.svg',
    '1inch': '/Icons/1inch-1inch-logo.svg',
    'Ambire': '/Icons/ambire purple.png',
    'Ambire Wallet': '/Icons/ambire purple.png',
    'XDEFI': '/Icons/XDEFI-log.jpg',
    'XDEFI Wallet': '/Icons/XDEFI-log.jpg',
    'Fireblocks': '/Icons/fireblocks_logos.svg',
    'Fireblocks Wallet': '/Icons/fireblocks_logos.svg',
    'Blocto': '/Icons/Blocto-log.png',
    'Blocto Wallet': '/Icons/Blocto-log.png',
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
              {walletConnectors.map((wallet) => (
                <button key={wallet.id} onClick={() => selectSupportedWallet(wallet)} className="wallet-connector-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Image src={wallet.icon} alt="" width={42} height={42} className="wallet-icon-img" />
                    <span>{wallet.label}</span>
                  </div>
                  {wallet.badge && <span className="badge-best">{wallet.badge}</span>}
                </button>
              ))}
              {connectionError && <p role="alert" className="wallet-connection-error">{connectionError}</p>}
            </div>
            <button type="button" className="wallet-all-cta" onClick={() => setShowAll(true)}>
              <span><Sparkles size={20} />All Wallets</span>
              <span className="wallet-all-count">{allWalletsList.length}+</span>
            </button>
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
