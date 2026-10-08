export const chartTypes = {
  live: {
    title: "Live Charts",
    pairs: [
      ["BTC / USD", "COINBASE:BTCUSD"],
      ["ETH / USD", "COINBASE:ETHUSD"],
      ["SOL / USD", "COINBASE:SOLUSD"],
      ["XRP / USD", "COINBASE:XRPUSD"],
    ],
  },
  currency: {
    title: "Currency Chart",
    pairs: [
      ["EUR / USD", "FX:EURUSD"],
      ["GBP / USD", "FX:GBPUSD"],
      ["USD / JPY", "FX:USDJPY"],
      ["AUD / USD", "FX:AUDUSD"],
    ],
  },
  futures: {
    title: "Futures Chart",
    pairs: [
      ["S&P 500 Futures", "CME_MINI:ES1!"],
      ["Nasdaq Futures", "CME_MINI:NQ1!"],
      ["Gold Futures", "COMEX:GC1!"],
      ["Crude Oil Futures", "NYMEX:CL1!"],
    ],
  },
  stocks: {
    title: "Stocks Chart",
    pairs: [
      ["Apple", "NASDAQ:AAPL"],
      ["NVIDIA", "NASDAQ:NVDA"],
      ["Microsoft", "NASDAQ:MSFT"],
      ["Tesla", "NASDAQ:TSLA"],
    ],
  },
  indices: {
    title: "Indices Chart",
    pairs: [
      ["Dow Jones", "TVC:DJI"],
      ["S&P 500", "SP:SPX"],
      ["Nasdaq 100", "NASDAQ:NDX"],
      ["US Dollar Index", "TVC:DXY"],
    ],
  },
  cryptocurrency: {
    title: "Cryptocurrency Chart",
    pairs: [
      ["Bitcoin / USD", "COINBASE:BTCUSD"],
      ["Ethereum / USD", "COINBASE:ETHUSD"],
      ["Solana / USD", "COINBASE:SOLUSD"],
      ["XRP / USD", "COINBASE:XRPUSD"],
      ["BNB / USD", "BINANCE:BNBUSD"],
      ["Dogecoin / USD", "COINBASE:DOGEUSD"],
    ],
  },
};
