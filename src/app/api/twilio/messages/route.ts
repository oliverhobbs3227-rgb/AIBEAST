import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const client = twilio(
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { accountSid: process.env.TWILIO_ACCOUNT_SID }
    );

    const inbound = await client.messages.list({
      to: process.env.TWILIO_PHONE_NUMBER,
      limit: 50,
    });

    const outbound = await client.messages.list({
      from: process.env.TWILIO_PHONE_NUMBER,
      limit: 20,
    });

    const allMessages = [...inbound, ...outbound]
      .sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime())
      .slice(0, 50)
      .map((m) => ({
        sid: m.sid,
        from: m.from,
        to: m.to,
        body: m.body,
        status: m.status,
        direction: m.direction,
        dateSent: m.dateSent,
      }));

    return NextResponse.json({ messages: allMessages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
