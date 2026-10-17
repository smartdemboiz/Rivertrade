function formatReceiptAmount(value, currency) {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 8,
  }).format(Number(value));
  return `${formatted} ${currency || ""}`.trim();
}

export default function DepositSuccessReceipt({ deposit, onClose }) {
  if (!deposit) return null;
  return (
    <div className="deposit-success-backdrop">
      <section className="deposit-success-receipt" role="dialog" aria-modal="true" aria-labelledby="deposit-success-title">
        <div className="deposit-success-heading">
          <span className="deposit-success-check" aria-hidden="true">✓</span>
          <h3 id="deposit-success-title">Success!</h3>
          <p>Your deposit has been confirmed and credited.</p>
        </div>
        <strong className="deposit-success-amount">{formatReceiptAmount(deposit.creditedAmount, deposit.creditedCurrency)}</strong>
        <dl>
          <div><dt>Deposit request</dt><dd>{deposit.id.replace(/^deposit-/, "")}</dd></div>
          <div><dt>Payment method</dt><dd>{deposit.method || "Deposit"}</dd></div>
          <div><dt>Amount paid</dt><dd>{formatReceiptAmount(deposit.amount, deposit.currency)}</dd></div>
          <div><dt>Amount credited</dt><dd>{formatReceiptAmount(deposit.creditedAmount, deposit.creditedCurrency)}</dd></div>
          <div><dt>Status</dt><dd>Confirmed</dd></div>
        </dl>
        <button type="button" onClick={onClose}>Continue</button>
      </section>
    </div>
  );
}
