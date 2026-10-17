export const PENDING_DEPOSITS_KEY = "rivertrade-pending-deposit-receipts";

export function readPendingDepositIds() {
  try {
    const ids = JSON.parse(sessionStorage.getItem(PENDING_DEPOSITS_KEY) || "[]");
    return Array.isArray(ids) ? ids.filter(id => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function addPendingDepositId(id) {
  const ids = readPendingDepositIds();
  if (!ids.includes(String(id))) {
    sessionStorage.setItem(PENDING_DEPOSITS_KEY, JSON.stringify([...ids, String(id)]));
  }
}

export function removePendingDepositId(id) {
  const ids = readPendingDepositIds().filter(pendingId => pendingId !== String(id));
  sessionStorage.setItem(PENDING_DEPOSITS_KEY, JSON.stringify(ids));
}
