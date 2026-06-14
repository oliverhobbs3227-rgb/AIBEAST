import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/claude'
import { AUDIT_SYSTEM_PROMPT, buildAuditUserMessage, extractJSON } from '@/lib/prompts'
import type { AuditFormData, AuditReport } from '@/types/audit'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: ANTHROPIC_API_KEY is not set' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const formData: AuditFormData = body.formData

    if (!formData || !formData.companyName) {
      return NextResponse.json(
        { error: 'Invalid request: formData is required' },
        { status: 400 }
      )
    }

    const client = getAnthropicClient()
    const userMessage = buildAuditUserMessage(formData)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: AUDIT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonText = extractJSON(rawText)

    let report: AuditReport
    try {
      report = JSON.parse(jsonText)
    } catch {
      console.error('Failed to parse Claude response:', jsonText.slice(0, 500))
      return NextResponse.json(
        { error: 'Analysis parsing failed. Please try again.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ report })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Audit API error:', message)
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    )
  }
}
