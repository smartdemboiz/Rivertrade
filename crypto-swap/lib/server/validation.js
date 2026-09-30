const ROUTE_PRIORITIES = new Set(['Best Return', 'Fastest', 'Safest', 'Lowest Gas']);
const SENSITIVE_KEYS = new Set([
  'seed', 'seedPhrase', 'phrase', 'mnemonic', 'words', 'privateKey', 'authHeader', 'authorization', 'token', 'password', 'rawAuth', 'secret', 'backup', 'recoveryFileName', 'email', 'walletInfo', 'raw', 'rawData', 'payload', 'signature', 'jwt', 'accessToken', 'refreshToken',
]);

export function normalizeWalletAddress(address) {
  if (typeof address !== 'string') return null;
  const text = address.trim();
  if (/^0x[a-fA-F0-9]{40}$/i.test(text)) {
    return text.toLowerCase();
  }
  if (/^[a-zA-Z0-9]{32,64}$/.test(text)) {
    return text;
  }
  return text;
}

export function isValidWalletAddress(address) {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (Array.isArray(body)) return body.map(sanitizeRequestBody);
  return Object.entries(body).reduce((acc, [key, value]) => {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      acc[key] = 'REDACTED';
      return acc;
    }
    if (typeof value === 'string') {
      acc[key] = sanitizeString(value, lowerKey);
      return acc;
    }
    acc[key] = sanitizeRequestBody(value);
    return acc;
  }, {});
}

function sanitizeString(value, key) {
  if (SENSITIVE_KEYS.has(key)) return 'REDACTED';
  if (/^0x[a-fA-F0-9]{40}$/i.test(value)) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }
  return value;
}

export function validateQuotePayload(body) {
  if (!body || typeof body !== 'object') return { valid: false, message: 'Request body must be JSON object.' };
  if (!body.fromToken || !body.toToken) return { valid: false, message: 'fromToken and toToken are required.' };
  if (!isValidAmount(body.sendAmount)) return { valid: false, message: 'sendAmount must be a positive number.' };
  if (!ROUTE_PRIORITIES.has(body.routePriority || 'Best Return')) {
    return { valid: false, message: 'routePriority is invalid.' };
  }
  return { valid: true };
}

export function validateSwapPayload(body) {
  if (!body || typeof body !== 'object') return { valid: false, message: 'Request body must be JSON object.' };
  if (!body.fromToken || !body.toToken) return { valid: false, message: 'fromToken and toToken are required.' };
  if (!isValidAmount(body.sendAmount)) return { valid: false, message: 'sendAmount must be a positive number.' };
  if (!body.destination || typeof body.destination !== 'string') {
    return { valid: false, message: 'destination wallet address is required.' };
  }
  return { valid: true };
}
