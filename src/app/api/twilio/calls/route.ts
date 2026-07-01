import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const client = twilio(
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { accountSid: process.env.TWILIO_ACCOUNT_SID }
    );

    const calls = await client.calls.list({
      to: process.env.TWILIO_PHONE_NUMBER,
      limit: 50,
    });

    const outbound = await client.calls.list({
      from: process.env.TWILIO_PHONE_NUMBER,
      limit: 20,
    });

    const allCalls = [...calls, ...outbound]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 50)
      .map((c) => ({
        sid: c.sid,
        from: c.from,
        to: c.to,
        status: c.status,
        direction: c.direction,
        duration: c.duration,
        startTime: c.startTime,
      }));

    return NextResponse.json({ calls: allCalls });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
