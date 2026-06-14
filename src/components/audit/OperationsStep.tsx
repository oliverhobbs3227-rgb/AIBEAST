'use client'
import { useForm, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { OperationsData } from '@/types/audit'

interface Props {
  defaultValues?: OperationsData
  annualRevenue?: number
  onNext: (data: OperationsData) => void
  onBack: () => void
}

type FormValues = {
  totalHeadcount: string
  monthlyOverhead: string
  revenuePerEmployee: string
  automationLevel: string
  processEfficiencyScore: string
  avgProjectDeliveryDays: string
}

export function OperationsStep({ defaultValues, annualRevenue, onNext, onBack }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      totalHeadcount: defaultValues?.totalHeadcount?.toString() ?? '',
      monthlyOverhead: defaultValues?.monthlyOverhead?.toString() ?? '',
      revenuePerEmployee: defaultValues?.revenuePerEmployee?.toString() ?? '',
      automationLevel: defaultValues?.automationLevel?.toString() ?? '50',
      processEfficiencyScore: defaultValues?.processEfficiencyScore?.toString() ?? '5',
      avgProjectDeliveryDays: defaultValues?.avgProjectDeliveryDays?.toString() ?? '',
    },
  })

  const headcount = parseFloat(useWatch({ control, name: 'totalHeadcount' }) ?? '0') || 0
  const autoRPE = annualRevenue && headcount > 0
    ? `~$${Math.round(annualRevenue / headcount).toLocaleString()}`
    : null

  const automationLevel = useWatch({ control, name: 'automationLevel' }) ?? '50'
  const efficiencyScore = useWatch({ control, name: 'processEfficiencyScore' }) ?? '5'

  const onSubmit = (values: FormValues) => {
    onNext({
      totalHeadcount: parseInt(values.totalHeadcount),
      monthlyOverhead: parseFloat(values.monthlyOverhead),
      revenuePerEmployee: parseFloat(values.revenuePerEmployee),
      automationLevel: parseFloat(values.automationLevel),
      processEfficiencyScore: parseFloat(values.processEfficiencyScore),
      avgProjectDeliveryDays: parseInt(values.avgProjectDeliveryDays),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Operational Efficiency</h2>
        <p className="text-slate-400 text-sm">Team productivity, overhead, and process maturity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Total Headcount"
          type="number"
          placeholder="18"
          hint="Full-time employees + full-time contractors"
          error={errors.totalHeadcount?.message}
          {...register('totalHeadcount', { required: 'Required', min: { value: 1, message: 'Must be ≥ 1' } })}
        />
        <Input
          label="Monthly Overhead"
          type="number"
          prefix="$"
          placeholder="95000"
          hint="Fixed monthly costs (rent, salaries, subscriptions)"
          error={errors.monthlyOverhead?.message}
          {...register('monthlyOverhead', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Revenue Per Employee"
          type="number"
          prefix="$"
          placeholder="133333"
          hint={autoRPE ? `Calculated: ${autoRPE} (annual revenue ÷ headcount)` : 'Annual revenue ÷ total headcount'}
          error={errors.revenuePerEmployee?.message}
          {...register('revenuePerEmployee', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Avg Project Delivery Days"
          type="number"
          suffix="days"
          placeholder="21"
          hint="Average days to deliver a project or feature"
          error={errors.avgProjectDeliveryDays?.message}
          {...register('avgProjectDeliveryDays', { required: 'Required', min: { value: 1, message: 'Must be ≥ 1' } })}
        />
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">
            Automation Level — <span className="text-blue-400">{automationLevel}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full accent-blue-500"
            {...register('automationLevel')}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0% — Fully manual</span>
            <span>100% — Fully automated</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">
            Process Efficiency Score — <span className="text-blue-400">{efficiencyScore}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            className="w-full accent-blue-500"
            {...register('processEfficiencyScore')}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 — Chaotic / ad-hoc</span>
            <span>10 — Best-in-class</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </Button>
        <Button type="submit">
          Next: Growth
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
