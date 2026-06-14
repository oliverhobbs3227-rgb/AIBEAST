import type { AuditFormData } from '@/types/audit'

export const AUDIT_SYSTEM_PROMPT = `You are a senior business analyst and ROI consultant with 20+ years of experience advising companies across all industries and stages. Your task is to perform a comprehensive Business ROI Audit based on the structured data provided.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON — no markdown fences, no explanations, no preamble.
2. The JSON must exactly match the schema provided in the user message.
3. All scores are integers from 0 to 100.
4. Base your analysis on industry benchmarks appropriate for the company's stage and sector.
5. Be specific and actionable — avoid generic advice. Reference the actual numbers provided.
6. Identify the single most impactful lever for improvement as the topPriority field.
7. Each category must have exactly 3 recommendations, 2-4 strengths, 2-4 weaknesses, and 3-4 keyMetrics.

SCORING RUBRIC:
- 85–100: excellent (top quartile performance)
- 70–84:  good     (above average)
- 50–69:  fair     (at or near average, improvement needed)
- 30–49:  poor     (below average, significant gaps)
- 0–29:   critical (urgent intervention required)

CATEGORY WEIGHTS for overallScore calculation:
- Financial Returns: 35%
- Marketing Efficiency: 25%
- Operational Efficiency: 20%
- Growth & Scalability: 20%`

export function buildAuditUserMessage(data: AuditFormData): string {
  const { financial: f, marketing: m, operations: o, growth: g } = data

  const conversionRate = m.monthlyLeads > 0
    ? ((m.monthlyConversions / m.monthlyLeads) * 100).toFixed(1)
    : '0'
  const ltvCacRatio = m.customerAcquisitionCost > 0
    ? (m.customerLifetimeValue / m.customerAcquisitionCost).toFixed(1)
    : '0'
  const netGrowth = (g.yoyGrowthRate - g.monthlyChurnRate * 12).toFixed(1)
  const roi = f.totalInvestment > 0
    ? (((f.annualRevenue - f.totalCosts) / f.totalInvestment) * 100).toFixed(1)
    : '0'

  return `## BUSINESS AUDIT REQUEST

**Company:** ${data.companyName}
**Industry:** ${data.industry}
**Stage:** ${data.companyStage}

### Financial Metrics
- Annual Revenue: $${f.annualRevenue.toLocaleString()}
- Total Costs: $${f.totalCosts.toLocaleString()}
- Profit Margin: ${f.profitMargin}%
- Total Investment: $${f.totalInvestment.toLocaleString()}
- Operating Expenses: $${f.operatingExpenses.toLocaleString()}
- YoY Revenue Growth Rate: ${f.revenueGrowthRate}%
- Calculated ROI: ${roi}%

### Marketing Metrics
- Monthly Ad Spend: $${m.monthlyAdSpend.toLocaleString()}
- Monthly Leads: ${m.monthlyLeads.toLocaleString()}
- Monthly Conversions: ${m.monthlyConversions.toLocaleString()}
- Conversion Rate: ${conversionRate}%
- Customer Acquisition Cost: $${m.customerAcquisitionCost.toLocaleString()}
- Customer Lifetime Value: $${m.customerLifetimeValue.toLocaleString()}
- LTV:CAC Ratio: ${ltvCacRatio}x
- Return on Ad Spend: ${m.returnOnAdSpend}x

### Operations Metrics
- Total Headcount: ${o.totalHeadcount}
- Monthly Overhead: $${o.monthlyOverhead.toLocaleString()}
- Revenue Per Employee: $${o.revenuePerEmployee.toLocaleString()}
- Automation Level: ${o.automationLevel}%
- Process Efficiency Score: ${o.processEfficiencyScore}/10
- Avg Project Delivery: ${o.avgProjectDeliveryDays} days

### Growth Metrics
- MoM Growth Rate: ${g.momGrowthRate}%
- YoY Growth Rate: ${g.yoyGrowthRate}%
- Monthly Churn Rate: ${g.monthlyChurnRate}%
- Net Annual Growth (YoY minus annualized churn): ${netGrowth}%
- Total Addressable Market: $${g.totalAddressableMarket.toLocaleString()}
- Current Market Share: ${g.currentMarketShare}%
- New Products/Services Per Year: ${g.newProductsLaunchedPerYear}

---

## REQUIRED JSON RESPONSE SCHEMA

Respond with ONLY this JSON structure (no other text, no markdown):

{
  "overallScore": <integer 0-100>,
  "overallRating": <"excellent"|"good"|"fair"|"poor"|"critical">,
  "executiveSummary": "<3-4 sentences summarizing the business health>",
  "topPriority": "<single most impactful action the business should take now>",
  "generatedAt": "<ISO 8601 timestamp>",
  "categories": {
    "financial": {
      "score": <integer 0-100>,
      "rating": <"excellent"|"good"|"fair"|"poor"|"critical">,
      "summary": "<2-3 sentences>",
      "strengths": ["<string>", "<string>"],
      "weaknesses": ["<string>", "<string>"],
      "recommendations": [
        {
          "title": "<short action title>",
          "description": "<specific actionable description referencing the actual data>",
          "priority": <"high"|"medium"|"low">,
          "estimatedImpact": "<quantified impact estimate>",
          "timeframe": "<e.g. 30 days, Q2 2025>"
        }
      ],
      "keyMetrics": [
        {
          "label": "<metric name>",
          "value": "<formatted value>",
          "benchmark": "<industry benchmark for this stage>",
          "status": <"above"|"at"|"below">
        }
      ]
    },
    "marketing": { "<same structure as financial>" },
    "operations": { "<same structure as financial>" },
    "growth": { "<same structure as financial>" }
  }
}`
}

export function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  return text.trim()
}
