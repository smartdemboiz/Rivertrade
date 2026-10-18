function formatWithdrawalAmount(value, currency) {
  const amount = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 8,
  }).format(Number(value));
  return `${amount} ${currency || ""}`.trim();
}

export default function WithdrawalReceipt({ withdrawal, onClose }) {
  if (!withdrawal) return null;

  const status = withdrawal.status;
  const successful = status === "approved";
  const rejected = status === "rejected";
  const title = successful ? "Withdrawal successful" : rejected ? "Withdrawal rejected" : "Withdrawal request received";
  const description = successful
    ? "An administrator confirmed that your manual payout was sent."
    : rejected
      ? "Your withdrawal request was rejected. No payout was sent."
      : "Your request is awaiting review. No payout has been sent yet.";

  return (
    <div className="withdrawal-receipt-backdrop">
      <section
        className={`withdrawal-receipt${successful ? " is-successful" : ""}${rejected ? " is-rejected" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-receipt-title"
      >
        <div className="withdrawal-receipt-heading">
          <span aria-hidden="true">{successful ? "✓" : rejected ? "×" : "…"}</span>
          <h3 id="withdrawal-receipt-title">{title}</h3>
          <p>{description}</p>
        </div>
        <strong className="withdrawal-receipt-amount">{formatWithdrawalAmount(withdrawal.amount, withdrawal.currency)}</strong>
        <dl>
          <div><dt>Withdrawal request</dt><dd>{withdrawal.requestId}</dd></div>
          {withdrawal.transactionId && <div><dt>Transaction ID</dt><dd>{withdrawal.transactionId}</dd></div>}
          <div><dt>Payment method</dt><dd>{withdrawal.method || "Withdrawal"}</dd></div>
          {withdrawal.asset && <div><dt>Payout asset</dt><dd>{withdrawal.asset}</dd></div>}
          {withdrawal.network && <div><dt>Network</dt><dd>{withdrawal.network}</dd></div>}
          <div><dt>Status</dt><dd>{successful ? "Payout sent" : rejected ? "Rejected" : "Pending review"}</dd></div>
          <div><dt>Request date</dt><dd>{withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleString() : "—"}</dd></div>
        </dl>
        <button type="button" onClick={onClose}>Close receipt</button>
      </section>
    </div>
  );
}
