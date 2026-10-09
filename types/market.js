export const coinColors = {
  bitcoin: '#f5ad35',
  ethereum: '#a98cff',
  solana: '#61e4c0',
  ripple: '#dbe6e9',
};

export const formatMoney = (value, digits = 2) => value >= 1e12
  ? `$${(value / 1e12).toFixed(2)}T`
  : value >= 1e9
    ? `$${(value / 1e9).toFixed(2)}B`
    : value >= 1e6
      ? `$${(value / 1e6).toFixed(2)}M`
      : `$${value.toLocaleString(undefined, { maximumFractionDigits: digits })}`;

export const formatPercent = (value) => {
  const percentage = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(percentage)) {
    return '--';
  }

  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};
