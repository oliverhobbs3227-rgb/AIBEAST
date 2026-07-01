import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const recordingUrl = formData.get('RecordingUrl') as string;
  const from = formData.get('From') as string;
  const transcriptionText = formData.get('TranscriptionText') as string | null;

  console.log(`Voicemail from ${from}: ${recordingUrl}`);
  if (transcriptionText) {
    console.log(`Transcription: ${transcriptionText}`);
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Your message has been recorded. Thank you for calling AI Beast Automation.</Say>
  <Hangup />
</Response>`;

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
