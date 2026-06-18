/* ============================================
   PRASHANT CAPTURES — /api/subscribe
   Vercel serverless function (Node 18, no npm deps)

   What it does:
     1. Validates the submitted email
     2. Adds the contact to a Resend Audience (contact list)
     3. Sends a branded welcome email immediately
     4. Schedules an introduction email 3 days later

   Environment variables (set in Vercel dashboard → Settings → Environment Variables):
     RESEND_API_KEY       Required. From resend.com → API Keys
     RESEND_FROM_EMAIL    Required. Verified sender, e.g. "Prashant Captures <hello@yourdomain.com>"
     RESEND_AUDIENCE_ID   Optional. From resend.com → Audiences → your audience ID
     SITE_URL             Optional. Defaults to the live Vercel URL
   ============================================ */

/* In-memory rate limit — lightweight guard per serverless instance */
const recentRequests = new Map();

function isRateLimited(email) {
  const now  = Date.now();
  const last = recentRequests.get(email);
  if (last && now - last < 60_000) return true;
  recentRequests.set(email, now);
  if (recentRequests.size > 500) {
    const cutoff = now - 60_000;
    for (const [k, t] of recentRequests) {
      if (t < cutoff) recentRequests.delete(k);
    }
  }
  return false;
}

async function resendPost(path, apiKey, body) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/* ---- Email templates ----------------------------------------- */

function welcomeEmail(siteUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Welcome to Prashant Captures</title>
</head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F1E8;">
  <tr><td align="center" style="padding:48px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

      <!-- Brand -->
      <tr><td align="center" style="padding:0 0 36px;">
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:400;color:#5C4033;letter-spacing:0.06em;">Prashant Captures</p>
        <p style="margin:6px 0 0;font-size:10px;color:#8B6F47;letter-spacing:0.22em;text-transform:uppercase;">Portrait Photographer &middot; Osaka, Japan</p>
      </td></tr>

      <!-- Rule -->
      <tr><td style="padding:0 0 36px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:1px solid #D9D0C0;"></td></tr></table>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#FFFFFF;border-radius:3px;padding:48px 48px 44px;">

        <p style="margin:0 0 18px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#8B6F47;">Welcome</p>

        <h1 style="margin:0 0 26px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#3E2723;line-height:1.25;">You're in.</h1>

        <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.8;">Thank you for subscribing to Prashant Captures.</p>

        <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;">
          I'm Prashant &mdash; a portrait photographer based in Osaka. I work with tourists exploring Japan, couples, portrait clients, and anyone who wants photos that actually feel like them rather than a stock image. I shoot in a candid, documentary style and I care just as much about the conversation before the shoot as the shoot itself.
        </p>

        <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.8;">Here's what to expect from me:</p>

        <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin:0 0 28px;">
          <tr><td style="padding:11px 0;border-bottom:1px solid #F0EDE6;font-size:14px;color:#3E2723;line-height:1.6;"><span style="color:#8B6F47;margin-right:12px;">&mdash;</span>Session stories and photography notes from Osaka</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #F0EDE6;font-size:14px;color:#3E2723;line-height:1.6;"><span style="color:#8B6F47;margin-right:12px;">&mdash;</span>Portrait location guides across Kansai</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #F0EDE6;font-size:14px;color:#3E2723;line-height:1.6;"><span style="color:#8B6F47;margin-right:12px;">&mdash;</span>Behind-the-scenes moments from client sessions</td></tr>
          <tr><td style="padding:11px 0;font-size:14px;color:#3E2723;line-height:1.6;"><span style="color:#8B6F47;margin-right:12px;">&mdash;</span>Early access to new Lightroom preset packs</td></tr>
        </table>

        <p style="margin:0 0 36px;font-size:14px;color:#8B6F47;font-style:italic;line-height:1.8;border-left:2px solid #D9D0C0;padding-left:16px;">
          I don't email on a schedule. I write when I have something worth saying &mdash; usually once or twice a month. No noise.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 40px;">
          <tr><td>
            <a href="${siteUrl}/blog.html" style="display:inline-block;background:#5C4033;color:#F5F1E8;text-decoration:none;padding:14px 30px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;border-radius:2px;">Read the Blog</a>
          </td></tr>
        </table>

        <!-- Sign-off -->
        <p style="margin:0 0 4px;font-size:15px;color:#3E2723;">Prashant</p>
        <p style="margin:0;font-size:12px;color:#8B6F47;">Portrait Photographer &middot; Osaka, Japan</p>

      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding:28px 0 0;">
        <p style="margin:0 0 8px;font-size:11px;color:#8B6F47;">
          <a href="${siteUrl}" style="color:#8B6F47;text-decoration:none;">Prashant Captures</a>
          &nbsp;&middot;&nbsp;
          <a href="https://instagram.com/prashantsub12" style="color:#8B6F47;text-decoration:none;">@prashantsub12</a>
        </p>
        <p style="margin:0;font-size:10px;color:#AAAAAA;line-height:1.7;">
          You're receiving this because you subscribed at ${siteUrl.replace('https://', '')}.<br />
          To unsubscribe, reply with "unsubscribe" in the subject line.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function introEmail(siteUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>What brought me to Osaka — and to photography</title>
</head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F1E8;">
  <tr><td align="center" style="padding:48px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

      <!-- Brand -->
      <tr><td align="center" style="padding:0 0 36px;">
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:400;color:#5C4033;letter-spacing:0.06em;">Prashant Captures</p>
        <p style="margin:6px 0 0;font-size:10px;color:#8B6F47;letter-spacing:0.22em;text-transform:uppercase;">Portrait Photographer &middot; Osaka, Japan</p>
      </td></tr>

      <!-- Rule -->
      <tr><td style="padding:0 0 36px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:1px solid #D9D0C0;"></td></tr></table>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#FFFFFF;border-radius:3px;padding:48px 48px 44px;">

        <p style="margin:0 0 18px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#8B6F47;">A Proper Introduction</p>

        <h1 style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#3E2723;line-height:1.3;">What brought me to Osaka &mdash; and to photography.</h1>

        <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.8;">
          I've been meaning to write this properly since you subscribed.
        </p>

        <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.8;">
          I'm Prashant. I moved to Osaka because I was drawn to a city that operates at its own pace &mdash; busy but unhurried, traditional but restless. I picked up a camera shortly after arriving, first just to remember things, then because I realized I was seeing something in people's faces here that I wanted to hold onto.
        </p>

        <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.8;">
          There's a kind of ease that happens when someone stops performing for the camera. The moment they forget I'm there, or decide they don't care. That's the shot. Not the posed one, not the one where everything is technically correct &mdash; the one where they just exist. That's what I'm always chasing.
        </p>

        <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.8;">
          My sessions start with a conversation. I want to know who you are, what you care about, what makes you laugh. That's not a warm-up exercise &mdash; that's the work. By the time I raise the camera, I already know what I'm looking for.
        </p>

        <p style="margin:0 0 36px;font-size:15px;color:#555555;line-height:1.8;">
          As a subscriber, you're getting a view into how I think about all of this &mdash; the sessions, the locations, the gear decisions, the failed experiments. I write when something feels worth saying. I hope that adds up to something useful for you.
        </p>

        <p style="margin:0 0 36px;font-size:14px;color:#8B6F47;font-style:italic;line-height:1.8;border-left:2px solid #D9D0C0;padding-left:16px;">
          If you ever want to shoot in Osaka &mdash; portrait, tourist walk, event, whatever &mdash; just reply to this email. That's the fastest way to reach me.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 40px;">
          <tr><td>
            <a href="${siteUrl}/about.html" style="display:inline-block;background:#5C4033;color:#F5F1E8;text-decoration:none;padding:14px 30px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;border-radius:2px;">About Me</a>
          </td></tr>
        </table>

        <!-- Sign-off -->
        <p style="margin:0 0 4px;font-size:15px;color:#3E2723;">Prashant</p>
        <p style="margin:0;font-size:12px;color:#8B6F47;">Portrait Photographer &middot; Osaka, Japan</p>

      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding:28px 0 0;">
        <p style="margin:0 0 8px;font-size:11px;color:#8B6F47;">
          <a href="${siteUrl}" style="color:#8B6F47;text-decoration:none;">Prashant Captures</a>
          &nbsp;&middot;&nbsp;
          <a href="https://instagram.com/prashantsub12" style="color:#8B6F47;text-decoration:none;">@prashantsub12</a>
        </p>
        <p style="margin:0;font-size:10px;color:#AAAAAA;line-height:1.7;">
          You're receiving this because you subscribed at ${siteUrl.replace('https://', '')}.<br />
          To unsubscribe, reply with "unsubscribe" in the subject line.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ---- Main handler -------------------------------------------- */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body    = req.body   || {};
  const email   = typeof body.email   === 'string' ? body.email.trim().toLowerCase()   : '';
  const website = typeof body.website === 'string' ? body.website : '';

  /* Honeypot — silent fake-success to confuse bots */
  if (website) {
    return res.status(200).json({ success: true });
  }

  /* Email format validation */
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  /* Rate limit */
  if (isRateLimited(email)) {
    return res.status(429).json({ error: 'You subscribed recently — check your inbox.' });
  }

  const apiKey     = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromEmail  = process.env.RESEND_FROM_EMAIL || 'Prashant Captures <onboarding@resend.dev>';
  const siteUrl    = (process.env.SITE_URL || 'https://photography-site-bay-three.vercel.app').replace(/\/$/, '');

  if (!apiKey) {
    console.error('[subscribe] RESEND_API_KEY is not set');
    return res.status(503).json({ error: 'Newsletter service is not configured yet.' });
  }

  try {
    /* 1. Save contact to Resend Audience (optional — skipped if no audience ID) */
    if (audienceId) {
      const { ok, status } = await resendPost(
        `/audiences/${audienceId}/contacts`,
        apiKey,
        { email, unsubscribed: false }
      );
      /* 422 = already exists — not a failure */
      if (!ok && status !== 422) {
        throw new Error(`Failed to save contact (status ${status})`);
      }
    }

    /* 2. Send welcome email immediately */
    const { ok: w_ok, status: w_status, data: w_data } = await resendPost('/emails', apiKey, {
      from:    fromEmail,
      to:      [email],
      subject: 'Welcome to Prashant Captures 📷',
      html:    welcomeEmail(siteUrl),
    });

    if (!w_ok) {
      throw new Error(`Welcome email failed (${w_status}): ${w_data.message || 'unknown'}`);
    }

    /* 3. Schedule introduction email 3 days later */
    const introAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { ok: i_ok } = await resendPost('/emails', apiKey, {
      from:         fromEmail,
      to:           [email],
      subject:      'What brought me to Osaka — and to photography',
      html:         introEmail(siteUrl),
      scheduled_at: introAt,
    });

    /* Introduction email failure is non-fatal — subscriber still gets the welcome */
    if (!i_ok) {
      console.warn('[subscribe] Introduction email scheduling failed — continuing');
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[subscribe] Error:', err.message);
    return res.status(500).json({
      error: 'Something went wrong. Please try again or email me directly.',
    });
  }
};
