'use client'
import { useEffect, useState } from 'react'

const MESSAGES = [
  'Analyzing financial metrics...',
  'Evaluating marketing efficiency...',
  'Assessing operational health...',
  'Benchmarking against industry standards...',
  'Generating strategic recommendations...',
  'Compiling your audit report...',
]

export function LoadingOverlay() {
  const [messageIdx, setMessageIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(msgInterval)
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p
        return p + Math.random() * 8
      })
    }, 600)
    return () => clearInterval(progressInterval)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center gap-8 text-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">AI is analyzing your business</h2>
          <p className="text-slate-400 text-sm min-h-[1.25rem] transition-all">{MESSAGES[messageIdx]}</p>
        </div>

        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-600">This typically takes 10–20 seconds</p>
      </div>
    </div>
  )
}
