import { createClient } from "@supabase/supabase-js";

const supportedChains = new Set([1, 8453, 42161]);

function createSupabaseClient(key) {
  const url = process.env.SUPABASE_URL;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function authorize(request) {
  const authClient = createSupabaseClient(process.env.SUPABASE_ANON_KEY);
  const serviceClient = createSupabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!authClient || !serviceClient) {
    return { response: Response.json({ error: "Wallet swap history is not configured." }, { status: 503 }) };
  }
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return { response: Response.json({ error: "Authentication required." }, { status: 401 }) };
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return { response: Response.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 }) };
  }
  return { serviceClient, user: data.user };
}

export async function GET(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const { data, error } = await auth.serviceClient
    .from("swaps")
    .select("id, from_asset, to_asset, amount, from_amount, to_amount, from_chain_id, to_chain_id, tx_hash, route_provider, status, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("Unable to load customer wallet swaps:", error.message);
    return Response.json({ error: "Unable to load wallet swap history." }, { status: 500 });
  }
  return Response.json({
    data: (data || []).map(swap => ({
      id: swap.id,
      fromAsset: swap.from_asset,
      toAsset: swap.to_asset,
      fromAmount: Number(swap.from_amount ?? swap.amount) || 0,
      toAmount: Number(swap.to_amount) || 0,
      fromChainId: swap.from_chain_id,
      toChainId: swap.to_chain_id,
      txHash: swap.tx_hash,
      routeProvider: swap.route_provider,
      status: swap.status,
      createdAt: swap.created_at,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Submit a valid confirmed swap transaction." }, { status: 400 });
  }

  const fromChainId = Number(body?.fromChainId);
  const toChainId = Number(body?.toChainId);
  const fromAmount = Number(body?.fromAmount);
  const toAmount = Number(body?.toAmount);
  const txHash = typeof body?.txHash === "string" ? body.txHash.trim() : "";
  const walletAddress = typeof body?.walletAddress === "string" ? body.walletAddress.trim() : "";
  const fromAsset = typeof body?.fromAsset === "string" ? body.fromAsset.trim().toUpperCase() : "";
  const toAsset = typeof body?.toAsset === "string" ? body.toAsset.trim().toUpperCase() : "";
  const routeProvider = typeof body?.routeProvider === "string" ? body.routeProvider.trim() : "";

  if (!supportedChains.has(fromChainId) || !supportedChains.has(toChainId)
    || !Number.isFinite(fromAmount) || fromAmount <= 0
    || !Number.isFinite(toAmount) || toAmount <= 0
    || !/^0x[a-f0-9]{64}$/i.test(txHash)
    || !/^0x[a-f0-9]{40}$/i.test(walletAddress)
    || !/^[A-Z0-9._-]{1,20}$/.test(fromAsset)
    || !/^[A-Z0-9._-]{1,20}$/.test(toAsset)
    || fromAsset === toAsset
    || !routeProvider || routeProvider.length > 80) {
    return Response.json({ error: "Swap details are invalid or use an unsupported network." }, { status: 400 });
  }

  const { data, error } = await auth.serviceClient.rpc("record_customer_wallet_swap", {
    p_user_id: auth.user.id,
    p_from_asset: fromAsset,
    p_to_asset: toAsset,
    p_from_amount: fromAmount,
    p_to_amount: toAmount,
    p_from_chain_id: fromChainId,
    p_to_chain_id: toChainId,
    p_tx_hash: txHash,
    p_wallet_address: walletAddress,
    p_route_provider: routeProvider,
  });
  if (error) {
    console.error("Unable to record customer wallet swap:", error.message);
    return Response.json({ error: "The transaction was sent, but its swap record could not be saved. Keep the transaction hash and contact support." }, { status: 500 });
  }
  const swap = Array.isArray(data) ? data[0] : data;
  return Response.json({
    data: {
      id: swap?.id,
      txHash: swap?.tx_hash || txHash.toLowerCase(),
      status: swap?.status || "pending",
    },
  }, { status: 201 });
}
