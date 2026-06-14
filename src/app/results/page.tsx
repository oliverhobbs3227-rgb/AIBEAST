'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuditDashboard } from '@/components/results/AuditDashboard'
import type { AuditReport } from '@/types/audit'

export default function ResultsPage() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('roi_audit_report')
      const name = sessionStorage.getItem('roi_audit_company') ?? 'Your Company'
      if (!stored) {
        setError(true)
        return
      }
      setReport(JSON.parse(stored))
      setCompanyName(name)
    } catch {
      setError(true)
    }
  }, [])

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">No audit data found</h1>
          <p className="text-slate-400 mb-6">
            Complete the audit form to generate your business ROI report.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            Start Audit
          </Link>
        </div>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-16">
      <AuditDashboard report={report} companyName={companyName} />
    </main>
  )
}
