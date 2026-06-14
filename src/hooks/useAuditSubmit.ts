'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AuditFormData, AuditReport } from '@/types/audit'

export function useAuditSubmit() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(formData: AuditFormData) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Audit failed. Please try again.')
      }

      const report: AuditReport = json.report
      sessionStorage.setItem('roi_audit_report', JSON.stringify(report))
      sessionStorage.setItem('roi_audit_company', formData.companyName)
      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  return { submit, isLoading, error }
}
