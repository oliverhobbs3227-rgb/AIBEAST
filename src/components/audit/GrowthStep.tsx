'use client'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { GrowthData } from '@/types/audit'

interface Props {
  defaultValues?: GrowthData
  onNext: (data: GrowthData) => void
  onBack: () => void
  isSubmitting?: boolean
  submitError?: string | null
}

type FormValues = {
  momGrowthRate: string
  yoyGrowthRate: string
  monthlyChurnRate: string
  totalAddressableMarket: string
  currentMarketShare: string
  newProductsLaunchedPerYear: string
}

export function GrowthStep({ defaultValues, onNext, onBack, isSubmitting, submitError }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      momGrowthRate: defaultValues?.momGrowthRate?.toString() ?? '',
      yoyGrowthRate: defaultValues?.yoyGrowthRate?.toString() ?? '',
      monthlyChurnRate: defaultValues?.monthlyChurnRate?.toString() ?? '',
      totalAddressableMarket: defaultValues?.totalAddressableMarket?.toString() ?? '',
      currentMarketShare: defaultValues?.currentMarketShare?.toString() ?? '',
      newProductsLaunchedPerYear: defaultValues?.newProductsLaunchedPerYear?.toString() ?? '',
    },
  })

  const onSubmit = (values: FormValues) => {
    onNext({
      momGrowthRate: parseFloat(values.momGrowthRate),
      yoyGrowthRate: parseFloat(values.yoyGrowthRate),
      monthlyChurnRate: parseFloat(values.monthlyChurnRate),
      totalAddressableMarket: parseFloat(values.totalAddressableMarket),
      currentMarketShare: parseFloat(values.currentMarketShare),
      newProductsLaunchedPerYear: parseInt(values.newProductsLaunchedPerYear),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Growth & Scalability</h2>
        <p className="text-slate-400 text-sm">Growth rates, retention, and market opportunity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="MoM Growth Rate"
          type="number"
          suffix="%"
          placeholder="3.5"
          hint="Month-over-month revenue growth"
          error={errors.momGrowthRate?.message}
          {...register('momGrowthRate', { required: 'Required' })}
        />
        <Input
          label="YoY Growth Rate"
          type="number"
          suffix="%"
          placeholder="45"
          hint="Year-over-year revenue growth"
          error={errors.yoyGrowthRate?.message}
          {...register('yoyGrowthRate', { required: 'Required' })}
        />
        <Input
          label="Monthly Churn Rate"
          type="number"
          suffix="%"
          placeholder="2.1"
          hint="Percentage of customers lost per month"
          error={errors.monthlyChurnRate?.message}
          {...register('monthlyChurnRate', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' }, max: { value: 100, message: 'Max 100%' } })}
        />
        <Input
          label="New Products/Services Per Year"
          type="number"
          placeholder="3"
          hint="New offerings launched in the past 12 months"
          error={errors.newProductsLaunchedPerYear?.message}
          {...register('newProductsLaunchedPerYear', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Total Addressable Market (TAM)"
          type="number"
          prefix="$"
          placeholder="850000000"
          hint="Total market size you could potentially serve"
          error={errors.totalAddressableMarket?.message}
          {...register('totalAddressableMarket', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Current Market Share"
          type="number"
          suffix="%"
          placeholder="0.3"
          hint="Your current % of the addressable market"
          error={errors.currentMarketShare?.message}
          {...register('currentMarketShare', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' }, max: { value: 100, message: 'Max 100%' } })}
        />
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={isSubmitting}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              Generate Audit Report
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
