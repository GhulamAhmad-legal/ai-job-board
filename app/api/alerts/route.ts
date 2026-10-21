import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { getSiteUrl } from '../../lib/siteUrl';
import { siteConfig } from '../../lib/siteConfig';

// Needs these in Vercel (Settings > Environment Variables):
//   RESEND_API_KEY   your Resend API key
//   ALERTS_FROM      e.g.  CoreTechRoles <alerts@coretechroles.com>   (the domain must be verified in Resend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const clean = (value: unknown, max: number) =>
  String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail('Invalid request.', 400);
  }

  // Spam trap: a real person never fills this hidden field. Pretend it worked.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const email = clean(body.email, 254).toLowerCase();
  const keywords = clean(body.keywords, 80).toLowerCase();
  const location = clean(body.location, 60).toLowerCase();
  const remoteOnly = body.remoteOnly === true;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return fail('Please enter a valid email address.', 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERTS_FROM;
  if (!apiKey || !from) {
    console.error('Job alerts: RESEND_API_KEY or ALERTS_FROM is not set.');
    return fail('Job alerts are temporarily unavailable. Please try again later.', 503);
  }

  const confirmToken = randomBytes(24).toString('hex');
  const unsubToken = randomBytes(24).toString('hex');

  const { data, error } = await supabase.rpc('create_alert', {
    p_email: email,
    p_keywords: keywords,
    p_location: location,
    p_remote: remoteOnly,
    p_confirm_token: confirmToken,
    p_unsub_token: unsubToken,
  });

  if (error) {
    console.error('create_alert failed:', error.message);
    return fail('Something went wrong. Please try again.', 500);
  }
  if (data === 'invalid') return fail('Please enter a valid email address.', 400);
  if (data === 'limit') return fail('This address already has the maximum number of alerts (5).', 429);

  // 'sent' = new alert (or a re-send); 'exists' = nothing to send. Both get the same answer,
  // so the form never reveals whether an address is already subscribed.
  if (data === 'sent') {
    const link = `${getSiteUrl()}/alerts/confirm?token=${confirmToken}`;
    const what = [
      keywords ? `“${escapeHtml(keywords)}”` : 'all new roles',
      location ? `in ${escapeHtml(location)}` : '',
      remoteOnly ? '(fully remote only)' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;color:#111;line-height:1.5">
  <h2 style="margin:0 0 12px">Confirm your job alert</h2>
  <p>You asked ${escapeHtml(siteConfig.name)} to email you about ${what}.</p>
  <p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Yes, send me these alerts</a></p>
  <p style="color:#555;font-size:14px">If the button does not work, copy this link into your browser:<br>${link}</p>
  <p style="color:#555;font-size:14px">If you did not ask for this, ignore this email and nothing will be sent.</p>
</div>`;
    const text = `Confirm your job alert\n\nYou asked ${siteConfig.name} to email you about ${what.replace(/&[a-z]+;/g, '')}.\n\nConfirm here: ${link}\n\nIf you did not ask for this, ignore this email and nothing will be sent.`;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [email], subject: 'Confirm your job alert', html, text }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.error('Resend rejected the confirmation email:', res.status, await res.text());
        return fail('We could not send the confirmation email. Please try again in a few minutes.', 502);
      }
    } catch (err) {
      console.error('Could not reach Resend:', err);
      return fail('We could not send the confirmation email. Please try again in a few minutes.', 502);
    }
  }

  return NextResponse.json({ ok: true });
}
