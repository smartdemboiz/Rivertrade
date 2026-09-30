const leftChains = [
  'Arbitrum',
  'Avalanche',
  'Base',
  'BNB Chain',
  'Cronos',
  'Data',
  'Ethereum',
  'HyperEVM',
  'Injective',
  'Linea',
  'MegaETH',
  'Monad',
  'Optimism',
  'Plasma',
  'Polygon',
  'Robinhood',
  'Solana',
  'Tron',
];

const rightChains = [
  'Arbitrum',
  'Avalanche',
  'Base',
  'BNB Chain',
  'Cronos',
  'Data',
  'Ethereum',
  'HyperEVM',
  'Injective',
  'Linea',
  'MegaETH',
  'Monad',
  'Optimism',
  'Plasma',
  'Polygon',
  'Robinhood',
  'Solana',
  'Tron',
];

const flows = [
  { from: 'Arbitrum', to: 'Arbitrum', color: '#57bafc', width: 4 },
  { from: 'Arbitrum', to: 'Solana', color: '#5d8bfd', width: 2.6 },
  { from: 'Avalanche', to: 'Ethereum', color: '#f87171', width: 2.8 },
  { from: 'Avalanche', to: 'Base', color: '#f6b26b', width: 2.4 },
  { from: 'Base', to: 'Ethereum', color: '#4ec9f5', width: 2.8 },
  { from: 'Base', to: 'Solana', color: '#c77dff', width: 3.1 },
  { from: 'BNB Chain', to: 'Base', color: '#fdba74', width: 2.7 },
  { from: 'BNB Chain', to: 'Polygon', color: '#fb923c', width: 2.7 },
  { from: 'Cronos', to: 'BNB Chain', color: '#facc15', width: 2.6 },
  { from: 'Data', to: 'Ethereum', color: '#60a5fa', width: 2.5 },
  { from: 'Ethereum', to: 'Optimism', color: '#4ade80', width: 2.9 },
  { from: 'Ethereum', to: 'Base', color: '#60a5fa', width: 4.1 },
  { from: 'Ethereum', to: 'Solana', color: '#c084fc', width: 3.7 },
  { from: 'HyperEVM', to: 'Polygon', color: '#38bdf8', width: 2.8 },
  { from: 'Injective', to: 'Arbitrum', color: '#a78bfa', width: 2.8 },
  { from: 'Injective', to: 'Base', color: '#67e8f9', width: 2.6 },
  { from: 'Linea', to: 'Ethereum', color: '#34d399', width: 2.8 },
  { from: 'Linea', to: 'Polygon', color: '#a7f3d0', width: 2.5 },
  { from: 'MegaETH', to: 'Solana', color: '#fda4af', width: 2.4 },
  { from: ' Monad', to: 'Ethereum', color: '#93c5fd', width: 2.3 },
  { from: 'Monad', to: 'Base', color: '#7dd3fc', width: 2.7 },
  { from: 'Optimism', to: 'Ethereum', color: '#fb7185', width: 2.8 },
  { from: 'Plasma', to: 'Arbitrum', color: '#22d3ee', width: 3.3 },
  { from: 'Polygon', to: 'Solana', color: '#a78bfa', width: 2.9 },
  { from: 'Polygon', to: 'Optimism', color: '#f472b6', width: 2.7 },
  { from: 'Robinhood', to: 'Arbitrum', color: '#bef264', width: 3.2 },
  { from: 'Robinhood', to: 'Base', color: '#eab308', width: 3.2 },
  { from: 'Solana', to: 'Ethereum', color: '#f472b6', width: 3.8 },
  { from: 'Solana', to: 'Base', color: '#a78bfa', width: 3.2 },
  { from: 'Tron', to: 'Solana', color: '#f9a8d4', width: 2.5 },
  { from: 'Tron', to: 'Arbitrum', color: '#fca5a5', width: 2.7 },
  { from: 'Tron', to: 'Polygon', color: '#fbbf24', width: 2.8 },
  { from: 'Arbitrum', to: 'Polygon', color: '#7dd3fc', width: 2.4 },
  { from: 'Base', to: 'Optimism', color: '#34d399', width: 2.8 },
  { from: 'BNB Chain', to: 'Ethereum', color: '#f59e0b', width: 2.5 },
  { from: 'Cronos', to: 'Arbitrum', color: '#fbbf24', width: 2.3 },
  { from: 'Data', to: 'Solana', color: '#fca5a5', width: 2.2 },
  { from: 'Ethereum', to: 'Tron', color: '#60a5fa', width: 3.1 },
  { from: 'HyperEVM', to: 'Optimism', color: '#8b5cf6', width: 2.8 },
  { from: 'Injective', to: 'Solana', color: '#67e8f9', width: 2.6 },
  { from: 'Linea', to: 'Base', color: '#a7f3d0', width: 2.7 },
  { from: 'MegaETH', to: 'Polygon', color: '#fda4af', width: 2.5 },
  { from: 'Monad', to: 'Ethereum', color: '#93c5fd', width: 2.3 },
  { from: 'Optimism', to: 'Solana', color: '#f87171', width: 3.1 },
  { from: 'Plasma', to: 'Polygon', color: '#22d3ee', width: 2.9 },
  { from: 'Polygon', to: 'Ethereum', color: '#a78bfa', width: 3.3 },
  { from: 'Robinhood', to: 'Solana', color: '#bef264', width: 3.0 },
  { from: 'Solana', to: 'Avalanche', color: '#f472b6', width: 2.8 },
  { from: 'Tron', to: 'Ethereum', color: '#f9a8d4', width: 2.9 },
  { from: 'Tron', to: 'BNB Chain', color: '#fbbf24', width: 2.3 },
];

const createNodeMap = (items) => {
  const map = {};
  items.forEach((item, index) => {
    map[item] = index;
  });
  return map;
};

export default function RealTimeFlows() {
  const leftMap = createNodeMap(leftChains);
  const rightMap = createNodeMap(rightChains);

  const leftX = 16;
  const rightX = 740;
  const labelWidth = 150;
  const nodeHeight = 36;

  const leftY = (index) => 30 + index * (nodeHeight + 8);
  const rightY = (index) => 30 + index * (nodeHeight + 8);

  return (
    <div className="real-time-flows-wrap">
      <div className="real-time-flows-shell">
        <div className="flow-column flow-column-left">
          {leftChains.map((chain, index) => (
            <div key={`${chain}-left`} className="flow-chain-row" style={{ top: leftY(index) }}>
              <span className="flow-dot" title={chain} />
              <span>{chain}</span>
            </div>
          ))}
        </div>

        <svg className="flow-svg" viewBox="0 0 820 760" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Real-time cross-chain flow map">
          <defs>
            <linearGradient id="flowBg" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#020d1f" />
              <stop offset="50%" stopColor="#071a2d" />
              <stop offset="100%" stopColor="#020d1f" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="820" height="760" fill="url(#flowBg)" opacity="0.7" />

          {flows.map((flow, index) => {
            const fromIndex = leftMap[flow.from];
            const toIndex = rightMap[flow.to];
            const y1 = leftY(fromIndex) + 16;
            const y2 = rightY(toIndex) + 16;

            const controlX1 = 250 + (index % 6) * 18;
            const controlX2 = 560 - (index % 5) * 16;

            return (
              <path
                key={`${flow.from}-${flow.to}-${index}`}
                d={`M ${leftX + 150} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${rightX - 16} ${y2}`}
                stroke={flow.color}
                strokeWidth={flow.width}
                fill="none"
                opacity={0.62}
                filter="url(#softGlow)"
              />
            );
          })}

          {leftChains.map((chain, index) => {
            const y = leftY(index) + 2;
            return (
              <g key={`${chain}-left-label`}>
                <rect x="120" y={y} width={labelWidth} height={nodeHeight - 2} rx={10} fill="rgba(11, 25, 38, 0.7)" stroke="rgba(255,255,255,0.06)" />
                <text x="150" y={y + 22} fill="rgba(255,255,255,0.9)" fontSize="13" fontWeight="600">{chain}</text>
              </g>
            );
          })}

          {rightChains.map((chain, index) => {
            const y = rightY(index) + 2;
            return (
              <g key={`${chain}-right-label`}>
                <rect x="600" y={y} width={labelWidth} height={nodeHeight - 2} rx={10} fill="rgba(11, 25, 38, 0.7)" stroke="rgba(255,255,255,0.06)" />
                <text x="636" y={y + 22} fill="rgba(255,255,255,0.9)" fontSize="13" fontWeight="600">{chain}</text>
              </g>
            );
          })}
        </svg>

        <div className="flow-column flow-column-right">
          {rightChains.map((chain, index) => (
            <div key={`${chain}-right`} className="flow-chain-row flow-chain-row-right" style={{ top: rightY(index) }}>
              <span>{chain}</span>
              <span className="flow-dot flow-dot-right" title={chain} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
