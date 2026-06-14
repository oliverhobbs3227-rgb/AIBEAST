import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Financial', icon: '💰' },
  { label: 'Marketing', icon: '📈' },
  { label: 'Operations', icon: '⚙️' },
  { label: 'Growth', icon: '🚀' },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isActive = idx === currentStep
        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                  isCompleted && 'bg-blue-600 border-blue-600 text-white',
                  isActive && 'bg-blue-600/20 border-blue-500 text-blue-400',
                  !isCompleted && !isActive && 'bg-slate-800 border-slate-700 text-slate-500'
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive ? 'text-blue-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 -mt-5 sm:-mt-4 transition-colors',
                  idx < currentStep ? 'bg-blue-600' : 'bg-slate-800'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
