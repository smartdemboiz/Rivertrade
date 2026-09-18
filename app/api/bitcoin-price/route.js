const fallbackPrices = {
  usd: 104283,
  eur: 96200,
  gbp: 82000,
  cad: 142000,
  jpy: 15200000,
};

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp,cad,jpy",
      { next: { revalidate: 60 } },
    );

    if (!response.ok) throw new Error("Bitcoin price request failed");

    const { bitcoin } = await response.json();
    return Response.json(bitcoin);
  } catch {
    return Response.json(fallbackPrices);
  }
}
