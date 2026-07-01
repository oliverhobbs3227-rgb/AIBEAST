import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string;
  const digits = formData.get('Digits') as string | null;
  const forwardTo = process.env.FORWARD_TO_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  const businessNumber = process.env.TWILIO_PHONE_NUMBER;

  const baseUrl = req.nextUrl.origin;

  let twiml: string;

  if (digits === '1') {
    // Forward call to owner
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Please hold while we connect your call.</Say>
  <Dial callerId="${businessNumber}" timeout="30">
    <Number>${forwardTo}</Number>
  </Dial>
  <Say voice="Polly.Matthew" language="en-US">We were unable to reach an agent. Please leave a voicemail after the tone.</Say>
  <Record action="${baseUrl}/api/twilio/voicemail" maxLength="120" transcribe="true" transcribeCallback="${baseUrl}/api/twilio/voicemail" />
</Response>`;
  } else if (digits === '2') {
    // Go to voicemail
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Please leave your message after the tone. Press pound when finished.</Say>
  <Record action="${baseUrl}/api/twilio/voicemail" maxLength="120" finishOnKey="#" transcribe="true" transcribeCallback="${baseUrl}/api/twilio/voicemail" />
</Response>`;
  } else {
    // Initial greeting with IVR menu
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="${baseUrl}/api/twilio/voice" method="POST" timeout="10">
    <Say voice="Polly.Matthew" language="en-US">Thank you for calling AI Beast Automation. To speak with someone, press 1. To leave a voicemail, press 2.</Say>
  </Gather>
  <Say voice="Polly.Matthew" language="en-US">We didn't receive your input. Goodbye.</Say>
  <Hangup />
</Response>`;
  }

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
