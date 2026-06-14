'use client'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { AuditReport } from '@/types/audit'

interface Props {
  report: AuditReport
}

export function CategoryRadarChart({ report }: Props) {
  const data = [
    { category: 'Financial', score: report.categories.financial.score, fullMark: 100 },
    { category: 'Marketing', score: report.categories.marketing.score, fullMark: 100 },
    { category: 'Operations', score: report.categories.operations.score, fullMark: 100 },
    { category: 'Growth', score: report.categories.growth.score, fullMark: 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value: number) => [`${value}/100`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
