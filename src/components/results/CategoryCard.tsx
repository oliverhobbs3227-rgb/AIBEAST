'use client'
import { useState } from 'react'
import { scoreToColor, ratingToColor, priorityColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CategoryAudit } from '@/types/audit'

interface Props {
  title: string
  icon: string
  audit: CategoryAudit
}

export function CategoryCard({ title, icon, audit }: Props) {
  const [showRecs, setShowRecs] = useState(false)
  const color = scoreToColor(audit.score)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-slate-100">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-bold"
            style={{ color }}
          >
            {audit.score}
          </span>
          <span
            className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize', ratingToColor(audit.rating))}
          >
            {audit.rating}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800">
        <div
          className="h-full transition-all duration-700 rounded-r-full"
          style={{ width: `${audit.score}%`, backgroundColor: color }}
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Summary */}
        <p className="text-slate-300 text-sm leading-relaxed">{audit.summary}</p>

        {/* Key metrics */}
        {audit.keyMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {audit.keyMetrics.map((metric) => (
              <div key={metric.label} className="bg-slate-800/60 rounded-lg p-2.5">
                <div className="text-xs text-slate-500 mb-0.5">{metric.label}</div>
                <div className="text-sm font-semibold text-slate-200">{metric.value}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    metric.status === 'above' && 'bg-green-400',
                    metric.status === 'at' && 'bg-yellow-400',
                    metric.status === 'below' && 'bg-red-400',
                  )} />
                  <span className="text-xs text-slate-500">{metric.benchmark}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Strengths</p>
            <ul className="space-y-1.5">
              {audit.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-300">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Weaknesses</p>
            <ul className="space-y-1.5">
              {audit.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-300">
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations toggle */}
        <button
          onClick={() => setShowRecs(!showRecs)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          <span>{showRecs ? 'Hide' : 'View'} Recommendations</span>
          <svg
            className={cn('w-4 h-4 transition-transform', showRecs && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showRecs && (
          <div className="space-y-3 pt-1">
            {audit.recommendations.map((rec, i) => (
              <div key={i} className="bg-slate-800/60 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">{rec.title}</h4>
                  <span className={cn('shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize', priorityColor(rec.priority))}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Impact: <span className="text-slate-300">{rec.estimatedImpact}</span></span>
                  <span>Timeline: <span className="text-slate-300">{rec.timeframe}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
