'use client'
import { useForm, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { MarketingData } from '@/types/audit'

interface Props {
  defaultValues?: MarketingData
  onNext: (data: MarketingData) => void
  onBack: () => void
}

type FormValues = {
  monthlyAdSpend: string
  monthlyLeads: string
  monthlyConversions: string
  customerAcquisitionCost: string
  customerLifetimeValue: string
  returnOnAdSpend: string
}

export function MarketingStep({ defaultValues, onNext, onBack }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      monthlyAdSpend: defaultValues?.monthlyAdSpend?.toString() ?? '',
      monthlyLeads: defaultValues?.monthlyLeads?.toString() ?? '',
      monthlyConversions: defaultValues?.monthlyConversions?.toString() ?? '',
      customerAcquisitionCost: defaultValues?.customerAcquisitionCost?.toString() ?? '',
      customerLifetimeValue: defaultValues?.customerLifetimeValue?.toString() ?? '',
      returnOnAdSpend: defaultValues?.returnOnAdSpend?.toString() ?? '',
    },
  })

  const adSpend = parseFloat(useWatch({ control, name: 'monthlyAdSpend' }) ?? '0') || 0
  const conversions = parseFloat(useWatch({ control, name: 'monthlyConversions' }) ?? '0') || 0
  const leads = parseFloat(useWatch({ control, name: 'monthlyLeads' }) ?? '0') || 0
  const autoCAC = conversions > 0 ? `~$${(adSpend / conversions).toFixed(0)}` : null
  const convRate = leads > 0 ? `~${((conversions / leads) * 100).toFixed(1)}%` : null

  const onSubmit = (values: FormValues) => {
    onNext({
      monthlyAdSpend: parseFloat(values.monthlyAdSpend),
      monthlyLeads: parseFloat(values.monthlyLeads),
      monthlyConversions: parseFloat(values.monthlyConversions),
      customerAcquisitionCost: parseFloat(values.customerAcquisitionCost),
      customerLifetimeValue: parseFloat(values.customerLifetimeValue),
      returnOnAdSpend: parseFloat(values.returnOnAdSpend),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Marketing Efficiency</h2>
        <p className="text-slate-400 text-sm">Ad spend, lead generation, and customer economics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Monthly Ad Spend"
          type="number"
          prefix="$"
          placeholder="25000"
          hint="Total paid marketing spend per month"
          error={errors.monthlyAdSpend?.message}
          {...register('monthlyAdSpend', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Monthly Leads Generated"
          type="number"
          placeholder="800"
          hint="Total leads (trials, signups, inquiries) per month"
          error={errors.monthlyLeads?.message}
          {...register('monthlyLeads', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Monthly Conversions"
          type="number"
          placeholder="40"
          hint={convRate ? `Conversion rate: ${convRate}` : 'Leads that became paying customers'}
          error={errors.monthlyConversions?.message}
          {...register('monthlyConversions', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Customer Acquisition Cost (CAC)"
          type="number"
          prefix="$"
          placeholder="625"
          hint={autoCAC ? `Calculated from your data: ${autoCAC}` : 'Total cost to acquire one customer'}
          error={errors.customerAcquisitionCost?.message}
          {...register('customerAcquisitionCost', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Customer Lifetime Value (LTV)"
          type="number"
          prefix="$"
          placeholder="8400"
          hint="Average total revenue per customer over their lifetime"
          error={errors.customerLifetimeValue?.message}
          {...register('customerLifetimeValue', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
        <Input
          label="Return on Ad Spend (ROAS)"
          type="number"
          suffix="x"
          placeholder="3.2"
          hint="Revenue generated per $1 of ad spend"
          error={errors.returnOnAdSpend?.message}
          {...register('returnOnAdSpend', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </Button>
        <Button type="submit">
          Next: Operations
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
