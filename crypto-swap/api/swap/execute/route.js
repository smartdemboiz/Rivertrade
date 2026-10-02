export async function POST(request) {
  return Response.json(
    { error: 'Swap execution is not available. No transaction was sent.' },
    {
      status: 501,
      headers: { 'cache-control': 'no-store' },
    },
  );
}
