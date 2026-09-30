'use client';

import { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';

export default function ScanTransactionsModal({ onClose, transactions }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const filteredTransactions = useMemo(() => {
    const items = transactions || [];
    if (!query) return items;
    return items.filter((tx) =>
      tx.txHash.toLowerCase().includes(query)
      || tx.fromToken.toLowerCase().includes(query)
      || tx.toToken.toLowerCase().includes(query)
      || tx.via.toLowerCase().includes(query)
      || tx.status.toLowerCase().includes(query)
      || tx.destination?.toLowerCase().includes(query)
    );
  }, [query, transactions]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: 660 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <h2 style={{ flex: 1 }}>Recent transactions</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-search-box" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'var(--field)', padding: '10px 14px', borderRadius: 16, border: '1px solid var(--border)' }}>
              <Search size={18} />
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search transfers or wallets"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredTransactions.length ? filteredTransactions.map((tx) => (
              <div key={tx.id} className="scan-transaction-card" style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{tx.txHash}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{tx.timeLabel}</span>
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{tx.status}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 150 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Via</div>
                    <div style={{ fontWeight: 700 }}>{tx.via}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>From</span>
                    <span style={{ fontWeight: 700 }}>{tx.fromToken}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>To</span>
                    <span style={{ fontWeight: 700 }}>{tx.toToken}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 13, color: 'var(--text-dim)' }}>
                  <span>Destination: {tx.destination}</span>
                  <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: 24, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: 'var(--text-dim)' }}>
                No transactions match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
