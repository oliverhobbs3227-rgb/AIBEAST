import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          AI-Powered Business Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-100 mb-6 leading-tight">
          AIBEAST<br />
          <span className="text-blue-500">ROI Audit Tool</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Get a comprehensive AI-driven audit of your business across financial returns,
          marketing efficiency, operations, and growth potential — in under 60 seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          {[
            { icon: '💰', title: 'ROI & Financial Returns', desc: 'Revenue, margins, investment returns, and cost efficiency analysis' },
            { icon: '📈', title: 'Marketing Efficiency', desc: 'Ad spend ROI, CAC, LTV ratios, and conversion optimization' },
            { icon: '⚙️', title: 'Operational Efficiency', desc: 'Headcount productivity, overhead ratios, and process maturity' },
            { icon: '🚀', title: 'Growth & Scalability', desc: 'Growth rates, churn, market penetration, and expansion potential' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-100 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/audit"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Start Your Free Audit
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-4 text-sm text-slate-500">Takes ~4 minutes to complete • Results in seconds</p>
      </div>
    </main>
  )
}
