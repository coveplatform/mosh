/**
 * Generates a branded HTML email template for Mosh-sent emails.
 * Includes both the original language content and a clean, professional layout.
 */
export function buildEmailHtml({
  subject,
  body,
  businessName,
  senderName,
  language,
}: {
  subject: string;
  body: string;
  businessName: string;
  senderName?: string;
  language: string;
}): string {
  // Convert newlines to <br> for HTML
  const htmlBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="${language === 'Japanese' ? 'ja' : language === 'Korean' ? 'ko' : language === 'French' ? 'fr' : language === 'Spanish' ? 'es' : language === 'German' ? 'de' : language === 'Italian' ? 'it' : language === 'Thai' ? 'th' : language === 'Mandarin' ? 'zh' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0f0f14;
      color: #e4e4e7;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #18181f;
      border: 1px solid #27272a;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      padding: 24px 28px 20px;
      border-bottom: 1px solid #27272a;
    }
    .logo {
      font-size: 18px;
      font-weight: 700;
      color: #e4e4e7;
      letter-spacing: -0.02em;
    }
    .logo span {
      background: linear-gradient(135deg, #7c5cfc, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .body-content {
      padding: 28px;
      font-size: 15px;
      line-height: 1.7;
      color: #d4d4d8;
    }
    .footer {
      padding: 20px 28px;
      border-top: 1px solid #27272a;
      text-align: center;
    }
    .footer p {
      margin: 0;
      font-size: 11px;
      color: #71717a;
      line-height: 1.5;
    }
    .footer a {
      color: #7c5cfc;
      text-decoration: none;
    }
    .meta {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #27272a;
    }
    .meta-row {
      display: flex;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .meta-label {
      color: #71717a;
      min-width: 50px;
    }
    .meta-value {
      color: #a1a1aa;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo"><span>mosh</span></div>
      </div>
      <div class="body-content">
        <div class="meta">
          <div class="meta-row">
            <span class="meta-label">To:</span>
            <span class="meta-value">${businessName}</span>
          </div>
          ${senderName ? `<div class="meta-row"><span class="meta-label">From:</span><span class="meta-value">${senderName} (via Mosh)</span></div>` : ''}
        </div>
        ${htmlBody}
      </div>
      <div class="footer">
        <p>Sent via <a href="https://mosh.app">Mosh</a> &mdash; AI that handles calls for you.</p>
        <p style="margin-top: 8px;">If you received this email in error, please disregard it.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
