function formatReceiptAmount(value, currency) {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 8,
  }).format(Number(value));
  return `${formatted} ${currency || ""}`.trim();
}

function formatExchangeRate(rate, sourceCurrency, targetCurrency) {
  const digits = sourceCurrency === "USD" && targetCurrency === "USD" ? 2 : 8;
  const formattedRate = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(Number(rate));
  return `1 ${sourceCurrency} = ${formattedRate} ${targetCurrency}`;
}

export default function DepositSuccessReceipt({ deposit, onReturnToDashboard }) {
  if (!deposit) return null;
  const rejected = deposit.status === "rejected";
  const receiptTitle = rejected ? "Payment rejected" : "Payment successful";
  const depositId = deposit.id.replace(/^deposit-/, "");

  return (
    <div className="deposit-success-backdrop">
      <section className={`deposit-success-receipt${rejected ? " is-rejected" : ""}`} role="dialog" aria-modal="true" aria-labelledby="deposit-success-title">
        <div className="deposit-success-heading">
          <span className="deposit-success-check" aria-hidden="true">{rejected ? "×" : "✓"}</span>
          <h3 id="deposit-success-title">{receiptTitle}</h3>
          <p>{rejected
            ? "This deposit request was rejected. No funds were credited."
            : "Your deposit has been confirmed and credited."}</p>
        </div>
        <strong className="deposit-success-amount">
          {formatReceiptAmount(rejected ? deposit.amount : deposit.creditedAmount, rejected ? deposit.currency : deposit.creditedCurrency)}
        </strong>
        <dl>
          <div><dt>Deposit request</dt><dd>{depositId}</dd></div>
          {!rejected && deposit.transactionId && <div><dt>Transaction ID</dt><dd>{deposit.transactionId}</dd></div>}
          <div><dt>Payment method</dt><dd>{deposit.method || "Deposit"}</dd></div>
          {deposit.method === "PayPal" && deposit.reference && <div><dt>PayPal email</dt><dd>{deposit.reference}</dd></div>}
          {deposit.network && <div><dt>Network</dt><dd>{deposit.network}</dd></div>}
          {rejected ? (
            <div><dt>Amount requested</dt><dd>{formatReceiptAmount(deposit.amount, deposit.currency)}</dd></div>
          ) : (
            <>
              <div>
                <dt>Exchange rate</dt>
                <dd>
                  {deposit.exchangeRate
                    ? formatExchangeRate(deposit.exchangeRate, deposit.currency, deposit.creditedCurrency)
                    : "Unavailable"}
                  {deposit.exchangeRateQuotedAt && (
                    <small>Quoted {new Date(deposit.exchangeRateQuotedAt).toLocaleString()}</small>
                  )}
                </dd>
              </div>
              <div><dt>Total due</dt><dd>{formatReceiptAmount(deposit.amount, deposit.currency)}</dd></div>
              <div><dt>Amount paid</dt><dd>{formatReceiptAmount(deposit.amount, deposit.currency)}</dd></div>
              <div><dt>Amount credited</dt><dd>{formatReceiptAmount(deposit.creditedAmount, deposit.creditedCurrency)}</dd></div>
            </>
          )}
          <div><dt>Status</dt><dd>{rejected ? "Rejected" : "Successful"}</dd></div>
        </dl>
        <button type="button" onClick={onReturnToDashboard}>Return to dashboard</button>
      </section>
    </div>
  );
}
