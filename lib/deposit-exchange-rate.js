const sourceCoinIds = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  USDC: "usd-coin",
  SOL: "solana",
  ADA: "cardano",
  LINK: "chainlink",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  USD: "tether",
};

export async function getDepositExchangeRate(sourceCurrency, targetCurrency) {
  const source = String(sourceCurrency || "").trim().toUpperCase();
  const target = String(targetCurrency || "").trim().toUpperCase();
  if (!/^[A-Z]{3,10}$/.test(source) || !/^[A-Z]{3}$/.test(target)) {
    throw new Error("A valid source and account currency are required for conversion.");
  }
  if (source === target) {
    return { rate: 1, quotedAt: new Date().toISOString() };
  }

  const coinId = sourceCoinIds[source];
  if (!coinId) {
    throw new Error(`Live conversion is not available for deposit currency ${source}.`);
  }

  const vsCurrencies = source === "USD" ? `${target.toLowerCase()},usd` : target.toLowerCase();
  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("ids", coinId);
  url.searchParams.set("vs_currencies", vsCurrencies);
  url.searchParams.set("include_last_updated_at", "true");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Live conversion rates are temporarily unavailable. Please try again.");
  }

  const data = await response.json();
  const quote = data?.[coinId];
  const targetRate = Number(quote?.[target.toLowerCase()]);
  const sourceUsdRate = source === "USD" ? Number(quote?.usd) : 1;
  const rate = targetRate / sourceUsdRate;
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`A live ${source} to ${target} exchange rate is not available.`);
  }

  const quotedAtSeconds = Number(quote?.last_updated_at);
  return {
    rate,
    quotedAt: Number.isFinite(quotedAtSeconds) && quotedAtSeconds > 0
      ? new Date(quotedAtSeconds * 1000).toISOString()
      : new Date().toISOString(),
  };
}

export function getCurrencyFractionDigits(currency) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    throw new Error(`The account currency ${currency} is not a valid currency code.`);
  }
}
