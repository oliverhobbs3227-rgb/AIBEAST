'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { scoreToColor } from '@/lib/utils'
import type { RatingLevel } from '@/types/audit'

interface Props {
  score: number
  rating: RatingLevel
}

export function OverallScoreRing({ score, rating }: Props) {
  const color = scoreToColor(score)
  const data = [{ value: score, fill: color }]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={90 - (score / 100) * 360}
            barSize={14}
          >
            <RadialBar dataKey="value" cornerRadius={7} background={{ fill: '#1e293b' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-slate-100">{score}</span>
          <span className="text-sm text-slate-400 -mt-1">/ 100</span>
        </div>
      </div>
      <div>
        <span
          className="px-4 py-1.5 rounded-full text-sm font-semibold border capitalize"
          style={{ color, borderColor: color + '40', background: color + '15' }}
        >
          {rating}
        </span>
      </div>
    </div>
  )
}
