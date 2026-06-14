'use client'
import { useReducer } from 'react'
import type { AuditFormData, FinancialData, MarketingData, OperationsData, GrowthData } from '@/types/audit'

type FormState = {
  currentStep: number
  formData: Partial<AuditFormData>
}

type FormAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_META'; payload: Pick<AuditFormData, 'companyName' | 'industry' | 'companyStage'> }
  | { type: 'UPDATE_FINANCIAL'; payload: FinancialData }
  | { type: 'UPDATE_MARKETING'; payload: MarketingData }
  | { type: 'UPDATE_OPERATIONS'; payload: OperationsData }
  | { type: 'UPDATE_GROWTH'; payload: GrowthData }

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'UPDATE_META':
      return { ...state, formData: { ...state.formData, ...action.payload } }
    case 'UPDATE_FINANCIAL':
      return { ...state, formData: { ...state.formData, financial: action.payload } }
    case 'UPDATE_MARKETING':
      return { ...state, formData: { ...state.formData, marketing: action.payload } }
    case 'UPDATE_OPERATIONS':
      return { ...state, formData: { ...state.formData, operations: action.payload } }
    case 'UPDATE_GROWTH':
      return { ...state, formData: { ...state.formData, growth: action.payload } }
    default:
      return state
  }
}

const TOTAL_STEPS = 4

export function useAuditForm() {
  const [state, dispatch] = useReducer(reducer, {
    currentStep: 0,
    formData: {},
  })

  const goNext = () =>
    dispatch({ type: 'SET_STEP', payload: Math.min(state.currentStep + 1, TOTAL_STEPS - 1) })

  const goBack = () =>
    dispatch({ type: 'SET_STEP', payload: Math.max(state.currentStep - 1, 0) })

  const updateMeta = (data: Pick<AuditFormData, 'companyName' | 'industry' | 'companyStage'>) =>
    dispatch({ type: 'UPDATE_META', payload: data })

  const updateFinancial = (data: FinancialData) =>
    dispatch({ type: 'UPDATE_FINANCIAL', payload: data })

  const updateMarketing = (data: MarketingData) =>
    dispatch({ type: 'UPDATE_MARKETING', payload: data })

  const updateOperations = (data: OperationsData) =>
    dispatch({ type: 'UPDATE_OPERATIONS', payload: data })

  const updateGrowth = (data: GrowthData) =>
    dispatch({ type: 'UPDATE_GROWTH', payload: data })

  return {
    currentStep: state.currentStep,
    formData: state.formData,
    totalSteps: TOTAL_STEPS,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === TOTAL_STEPS - 1,
    goNext,
    goBack,
    updateMeta,
    updateFinancial,
    updateMarketing,
    updateOperations,
    updateGrowth,
  }
}
