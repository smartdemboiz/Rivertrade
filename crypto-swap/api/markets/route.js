export async function GET() {
  try {
    // Return real-time market data
    // This could be fetched from Llama, Uniswap API, or your own database
    const markets = [
      {
        id: 'eth-usdc-uniswap',
        pair: 'ETH/USDC',
        protocol: 'Uniswap',
        volume24h: 1200000000,
        fee: '0.05%',
        liquidity: 45000000,
        tvl: 45000000,
      },
      {
        id: 'sol-usdc-raydium',
        pair: 'SOL/USDC',
        protocol: 'Raydium',
        volume24h: 850000000,
        fee: '0.25%',
        liquidity: 28000000,
        tvl: 28000000,
      },
      {
        id: 'arb-eth-uniswap',
        pair: 'ARB/ETH',
        protocol: 'Uniswap',
        volume24h: 120000000,
        fee: '0.05%',
        liquidity: 8500000,
        tvl: 8500000,
      },
    ];

    return Response.json({
      markets,
      timestamp: Date.now(),
      count: markets.length,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Markets API error:', error);
    return Response.json(
      { error: 'Failed to fetch markets', markets: [] },
      { status: 500 }
    );
  }
}
