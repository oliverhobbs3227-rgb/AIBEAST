export interface FinancialData {
  annualRevenue: number
  totalCosts: number
  profitMargin: number
  totalInvestment: number
  operatingExpenses: number
  revenueGrowthRate: number
}

export interface MarketingData {
  monthlyAdSpend: number
  monthlyLeads: number
  monthlyConversions: number
  customerAcquisitionCost: number
  customerLifetimeValue: number
  returnOnAdSpend: number
}

export interface OperationsData {
  totalHeadcount: number
  monthlyOverhead: number
  revenuePerEmployee: number
  automationLevel: number
  processEfficiencyScore: number
  avgProjectDeliveryDays: number
}

export interface GrowthData {
  momGrowthRate: number
  yoyGrowthRate: number
  monthlyChurnRate: number
  totalAddressableMarket: number
  currentMarketShare: number
  newProductsLaunchedPerYear: number
}

export interface AuditFormData {
  companyName: string
  industry: string
  companyStage: 'startup' | 'growth' | 'mature' | 'enterprise'
  financial: FinancialData
  marketing: MarketingData
  operations: OperationsData
  growth: GrowthData
}

export type RatingLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'

export interface ActionItem {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
  timeframe: string
}

export interface MetricSnapshot {
  label: string
  value: string
  benchmark: string
  status: 'above' | 'at' | 'below'
}

export interface CategoryAudit {
  score: number
  rating: RatingLevel
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: ActionItem[]
  keyMetrics: MetricSnapshot[]
}

export interface AuditReport {
  overallScore: number
  overallRating: RatingLevel
  executiveSummary: string
  topPriority: string
  categories: {
    financial: CategoryAudit
    marketing: CategoryAudit
    operations: CategoryAudit
    growth: CategoryAudit
  }
  generatedAt: string
}
