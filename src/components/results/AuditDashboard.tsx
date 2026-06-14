'use client'
import Link from 'next/link'
import { OverallScoreRing } from './OverallScoreRing'
import { CategoryCard } from './CategoryCard'
import { CategoryRadarChart } from './CategoryRadarChart'
import type { AuditReport } from '@/types/audit'

interface Props {
  report: AuditReport
  companyName: string
}

export function AuditDashboard({ report, companyName }: Props) {
  const generatedAt = new Date(report.generatedAt).toLocaleString()

  const categories = [
    { key: 'financial' as const, title: 'Financial Returns', icon: '💰' },
    { key: 'marketing' as const, title: 'Marketing Efficiency', icon: '📈' },
    { key: 'operations' as const, title: 'Operational Efficiency', icon: '⚙️' },
    { key: 'growth' as const, title: 'Growth & Scalability', icon: '🚀' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-sm text-slate-500 mb-1">Business ROI Audit</div>
          <h1 className="text-3xl font-bold text-slate-100">{companyName}</h1>
          <p className="text-slate-500 text-sm mt-1">Generated {generatedAt}</p>
        </div>
        <Link
          href="/audit"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Audit
        </Link>
      </div>

      {/* Overall Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overall Score</h2>
          <OverallScoreRing score={report.overallScore} rating={report.overallRating} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h2>
            <p className="text-slate-300 leading-relaxed">{report.executiveSummary}</p>
          </div>
          <div className="bg-blue-950/40 border border-blue-500/20 rounded-2xl p-5 flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Top Priority Action</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{report.topPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {categories.map(({ key, title, icon }) => (
            <div key={key} className="bg-slate-800/60 rounded-xl p-3 text-center">
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-xs text-slate-400 mb-1">{title}</div>
              <div className="text-xl font-bold text-slate-100">{report.categories[key].score}</div>
            </div>
          ))}
        </div>
        <CategoryRadarChart report={report} />
      </div>

      {/* Category Detail Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Detailed Category Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map(({ key, title, icon }) => (
            <CategoryCard
              key={key}
              title={title}
              icon={icon}
              audit={report.categories[key]}
            />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center py-6 border-t border-slate-800">
        <p className="text-slate-500 text-sm mb-4">Want to track improvements over time?</p>
        <Link
          href="/audit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
        >
          Run Another Audit
        </Link>
      </div>
    </div>
  )
}
