'use client'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { FinancialData, AuditFormData } from '@/types/audit'

interface Props {
  defaultValues?: Partial<AuditFormData>
  onNext: (meta: Pick<AuditFormData, 'companyName' | 'industry' | 'companyStage'>, financial: FinancialData) => void
}

const STAGE_OPTIONS = [
  { value: 'startup', label: 'Startup (0–2 years)' },
  { value: 'growth', label: 'Growth (2–7 years, scaling)' },
  { value: 'mature', label: 'Mature (7+ years, stable)' },
  { value: 'enterprise', label: 'Enterprise (large-scale)' },
]

type FormValues = {
  companyName: string
  industry: string
  companyStage: 'startup' | 'growth' | 'mature' | 'enterprise'
  annualRevenue: string
  totalCosts: string
  profitMargin: string
  totalInvestment: string
  operatingExpenses: string
  revenueGrowthRate: string
}

export function FinancialStep({ defaultValues, onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      companyName: defaultValues?.companyName ?? '',
      industry: defaultValues?.industry ?? '',
      companyStage: defaultValues?.companyStage ?? 'growth',
      annualRevenue: defaultValues?.financial?.annualRevenue?.toString() ?? '',
      totalCosts: defaultValues?.financial?.totalCosts?.toString() ?? '',
      profitMargin: defaultValues?.financial?.profitMargin?.toString() ?? '',
      totalInvestment: defaultValues?.financial?.totalInvestment?.toString() ?? '',
      operatingExpenses: defaultValues?.financial?.operatingExpenses?.toString() ?? '',
      revenueGrowthRate: defaultValues?.financial?.revenueGrowthRate?.toString() ?? '',
    },
  })

  const onSubmit = (values: FormValues) => {
    onNext(
      {
        companyName: values.companyName,
        industry: values.industry,
        companyStage: values.companyStage,
      },
      {
        annualRevenue: parseFloat(values.annualRevenue),
        totalCosts: parseFloat(values.totalCosts),
        profitMargin: parseFloat(values.profitMargin),
        totalInvestment: parseFloat(values.totalInvestment),
        operatingExpenses: parseFloat(values.operatingExpenses),
        revenueGrowthRate: parseFloat(values.revenueGrowthRate),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Company & Financial Overview</h2>
        <p className="text-slate-400 text-sm">Basic company info and your key financial metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          placeholder="Acme Corp"
          error={errors.companyName?.message}
          {...register('companyName', { required: 'Company name is required' })}
        />
        <Input
          label="Industry"
          placeholder="e.g. SaaS, E-commerce, Healthcare"
          error={errors.industry?.message}
          {...register('industry', { required: 'Industry is required' })}
        />
      </div>

      <Select
        label="Company Stage"
        options={STAGE_OPTIONS}
        error={errors.companyStage?.message}
        {...register('companyStage', { required: 'Select a stage' })}
      />

      <div className="border-t border-slate-800 pt-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Financial Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Annual Revenue"
            type="number"
            prefix="$"
            placeholder="2400000"
            hint="Total revenue for the past 12 months"
            error={errors.annualRevenue?.message}
            {...register('annualRevenue', {
              required: 'Required',
              min: { value: 0, message: 'Must be ≥ 0' },
            })}
          />
          <Input
            label="Total Costs"
            type="number"
            prefix="$"
            placeholder="1800000"
            hint="All costs including COGS, salaries, overhead"
            error={errors.totalCosts?.message}
            {...register('totalCosts', { required: 'Required' })}
          />
          <Input
            label="Profit Margin"
            type="number"
            suffix="%"
            placeholder="25"
            hint="Net profit as percentage of revenue"
            error={errors.profitMargin?.message}
            {...register('profitMargin', {
              required: 'Required',
              min: { value: -100, message: 'Invalid' },
              max: { value: 100, message: 'Max 100%' },
            })}
          />
          <Input
            label="Total Investment"
            type="number"
            prefix="$"
            placeholder="500000"
            hint="Total capital deployed in the business"
            error={errors.totalInvestment?.message}
            {...register('totalInvestment', { required: 'Required' })}
          />
          <Input
            label="Operating Expenses"
            type="number"
            prefix="$"
            placeholder="1200000"
            hint="Salaries, rent, software, overhead"
            error={errors.operatingExpenses?.message}
            {...register('operatingExpenses', { required: 'Required' })}
          />
          <Input
            label="YoY Revenue Growth Rate"
            type="number"
            suffix="%"
            placeholder="45"
            hint="Year-over-year revenue growth (can be negative)"
            error={errors.revenueGrowthRate?.message}
            {...register('revenueGrowthRate', { required: 'Required' })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">
          Next: Marketing
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
