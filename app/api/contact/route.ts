import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { siteConfig } from '../../lib/siteConfig';

// Needs RESEND_API_KEY and a verified sender in Vercel:
//   CONTACT_FROM (optional) or ALERTS_FROM, e.g.  CoreTechRoles <alerts@coretechroles.com>

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const oneLine = (value: unknown, max: number) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const multiLine = (value: unknown, max: number) => String(value ?? '').replace(/\r\n/g, '\n').trim().slice(0, max);

// Basic abuse limit (per server instance): 5 messages per IP every 10 minutes.
// Every message uses the same email quota as job alerts, so a flood must not be able to use it all up.
const recent = new Map<string, number[]>();
function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (times.length >= 5) {
    recent.set(ip, times);
    return true;
  }
  times.push(now);
  recent.set(ip, times);
  if (recent.size > 5000) recent.clear();
  return false;
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // Spam trap: a real person never fills this hidden field. Pretend it worked.
    if (oneLine(body.website, 200)) {
      return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    }

    const name = oneLine(body.name, 100);
    const email = oneLine(body.email, 254);
    const subject = oneLine(body.subject, 150);
    const message = multiLine(body.message, 5000);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: 'Please write a little more in your message.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (tooManyRequests(ip)) {
      return NextResponse.json({ error: 'Too many messages. Please try again in a few minutes.' }, { status: 429 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM || process.env.ALERTS_FROM;
    if (!apiKey || !from) {
      console.error('Contact form: RESEND_API_KEY or CONTACT_FROM / ALERTS_FROM is not set.');
      return NextResponse.json({ error: 'Messages are temporarily unavailable. Please email us instead.' }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [siteConfig.contactEmail],
      replyTo: email,
      subject: `[${siteConfig.name}] ${subject} - from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">New contact form message</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
