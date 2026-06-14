'use client'
import { useAuditForm } from '@/hooks/useAuditForm'
import { useAuditSubmit } from '@/hooks/useAuditSubmit'
import { StepIndicator } from './StepIndicator'
import { FinancialStep } from './FinancialStep'
import { MarketingStep } from './MarketingStep'
import { OperationsStep } from './OperationsStep'
import { GrowthStep } from './GrowthStep'
import { LoadingOverlay } from './LoadingOverlay'
import type { AuditFormData, FinancialData, MarketingData, OperationsData, GrowthData } from '@/types/audit'

export function AuditWizard() {
  const form = useAuditForm()
  const { submit, isLoading, error } = useAuditSubmit()

  const handleFinancialNext = (
    meta: Pick<AuditFormData, 'companyName' | 'industry' | 'companyStage'>,
    financial: FinancialData
  ) => {
    form.updateMeta(meta)
    form.updateFinancial(financial)
    form.goNext()
  }

  const handleMarketingNext = (data: MarketingData) => {
    form.updateMarketing(data)
    form.goNext()
  }

  const handleOperationsNext = (data: OperationsData) => {
    form.updateOperations(data)
    form.goNext()
  }

  const handleGrowthNext = (data: GrowthData) => {
    const completeFormData = {
      ...form.formData,
      growth: data,
    } as AuditFormData
    submit(completeFormData)
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <StepIndicator currentStep={form.currentStep} />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        {form.currentStep === 0 && (
          <FinancialStep
            defaultValues={form.formData}
            onNext={handleFinancialNext}
          />
        )}
        {form.currentStep === 1 && (
          <MarketingStep
            defaultValues={form.formData.marketing}
            onNext={handleMarketingNext}
            onBack={form.goBack}
          />
        )}
        {form.currentStep === 2 && (
          <OperationsStep
            defaultValues={form.formData.operations}
            annualRevenue={form.formData.financial?.annualRevenue}
            onNext={handleOperationsNext}
            onBack={form.goBack}
          />
        )}
        {form.currentStep === 3 && (
          <GrowthStep
            defaultValues={form.formData.growth}
            onNext={handleGrowthNext}
            onBack={form.goBack}
            isSubmitting={isLoading}
            submitError={error}
          />
        )}
      </div>
    </div>
  )
}
