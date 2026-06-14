import Link from 'next/link'
import { AuditWizard } from '@/components/audit/AuditWizard'

export default function AuditPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Business ROI Audit</h1>
        <p className="text-slate-400 text-sm">Complete all 4 steps to generate your AI-powered audit report</p>
      </div>
      <AuditWizard />
    </main>
  )
}
