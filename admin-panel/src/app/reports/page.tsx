'use client'
import React, { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Download, Printer, TrendingUp, Car, Wrench, Landmark } from 'lucide-react'

// ─── Static Data ───────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: 'Dec', value: 18.2 },
  { month: 'Jan', value: 22.5 },
  { month: 'Feb', value: 19.8 },
  { month: 'Mar', value: 31.2 },
  { month: 'Apr', value: 26.7 },
  { month: 'May', value: 28.4 },
]

const FUNNEL_STAGES = [
  { label: 'New', count: 18, pct: 100, color: '#084D8C' },
  { label: 'Qualified', count: 12, pct: 67, color: '#1565C0' },
  { label: 'Proposal Sent', count: 8, pct: 44, color: '#1976D2' },
  { label: 'Negotiation', count: 5, pct: 28, color: '#1E88E5' },
  { label: 'Won / Closed', count: 3, pct: 17, color: '#42A5F5' },
]

const STAFF = [
  { rank: '🥇', name: 'Rajesh Sharma', closed: 8, revenue: '₹12.4L', calls: 47, gold: true },
  { rank: '🥈', name: 'Amit Patel', closed: 5, revenue: '₹8.9L', calls: 38, gold: false },
  { rank: '🥉', name: 'Priya Desai', closed: 3, revenue: '₹5.2L', calls: 29, gold: false },
  { rank: '4', name: 'Harsh Mehta', closed: 2, revenue: '₹3.1L', calls: 22, gold: false },
]

const VEHICLE_MODELS = [
  { label: 'AVTR 2820', pct: 32, color: '#084D8C' },
  { label: 'Bada Dost i4', pct: 28, color: '#1E7BC4' },
  { label: 'Dost LiTE', pct: 20, color: '#D8232A' },
  { label: 'Partner Super', pct: 12, color: '#E85D04' },
  { label: 'Ecomet Star', pct: 8, color: '#F48C06' },
]

// ─── SVG Bar Chart ─────────────────────────────────────────────────────────────

function BarChart() {
  const maxVal = Math.max(...MONTHLY_REVENUE.map(d => d.value))
  const chartH = 180
  const barW = 36
  const gap = 20
  const leftPad = 44
  const topPad = 12
  const totalW = leftPad + MONTHLY_REVENUE.length * (barW + gap) + 10

  const yTicks = [0, 10, 20, 30, 40]

  return (
    <svg
      viewBox={`0 0 ${totalW} ${chartH + 36}`}
      className="w-full"
      style={{ minHeight: 220 }}
    >
      {/* Y-axis grid lines & labels */}
      {yTicks.map(tick => {
        const y = topPad + chartH - (tick / maxVal) * chartH
        return (
          <g key={tick}>
            <line
              x1={leftPad - 4}
              y1={y}
              x2={totalW - 4}
              y2={y}
              stroke="#F1F5F9"
              strokeWidth="1"
            />
            <text
              x={leftPad - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="#94A3B8"
              fontWeight="600"
            >
              {tick}L
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {MONTHLY_REVENUE.map((d, i) => {
        const barH = (d.value / maxVal) * chartH
        const x = leftPad + i * (barW + gap)
        const y = topPad + chartH - barH
        return (
          <g key={d.month}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              fill="#084D8C"
              opacity={i === MONTHLY_REVENUE.length - 1 ? 1 : 0.7}
            />
            {/* Value label on top */}
            <text
              x={x + barW / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#084D8C"
              fontWeight="700"
            >
              ₹{d.value}L
            </text>
            {/* X-axis month label */}
            <text
              x={x + barW / 2}
              y={topPad + chartH + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
              fontWeight="600"
            >
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── SVG Donut Chart ───────────────────────────────────────────────────────────

function DonutChart() {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 56
  const strokeWidth = 28

  const total = VEHICLE_MODELS.reduce((s, m) => s + m.pct, 0)
  let cumulative = 0

  const circumference = 2 * Math.PI * r

  const arcs = VEHICLE_MODELS.map(m => {
    const ratio = m.pct / total
    const dashArray = ratio * circumference
    const offset = circumference - cumulative * circumference / total
    cumulative += m.pct
    return { ...m, dashArray, offset }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dashArray} ${circumference}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
          {/* Center text */}
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            fontSize="13"
            fill="#1E293B"
            fontWeight="800"
          >
            Sales
          </text>
          <text
            x={cx}
            y={cy + 13}
            textAnchor="middle"
            fontSize="10"
            fill="#64748B"
            fontWeight="600"
          >
            Mix
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {VEHICLE_MODELS.map(m => (
          <div key={m.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: m.color }}
              />
              <span className="text-xs text-gray-600 font-medium truncate">{m.label}</span>
            </div>
            <span
              className="text-xs font-black flex-shrink-0"
              style={{ color: m.color }}
            >
              {m.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const PERIODS = ['This Week', 'This Month', 'This Quarter'] as const
type Period = typeof PERIODS[number]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('This Month')

  const handleExportCSV = () => {
    const rows = [
      ['Month', 'Revenue (Lakhs)'],
      ...MONTHLY_REVENUE.map(d => [d.month, d.value.toString()]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `movish_analytics_${period.replace(/\s+/g, '_').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Analytics &amp; Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Business intelligence for Movish Auto dealership operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
              style={{ backgroundColor: '#084D8C' }}
            >
              <Printer size={15} />
              Print Report
            </button>
          </div>
        </div>

        {/* ── Period Selector ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={
                period === p
                  ? { backgroundColor: '#084D8C', color: '#ffffff' }
                  : { backgroundColor: 'transparent', color: '#6B7280' }
              }
            >
              {p}
            </button>
          ))}
        </div>

        {/* ── Row 1: KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <TrendingUp size={18} style={{ color: '#084D8C' }} />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">
                ▲ +18.4%
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₹28,45,000</p>
            <p className="text-xs text-gray-400 mt-1">vs last month</p>
          </div>

          {/* New Vehicles Sold */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50">
                <Car size={18} className="text-indigo-600" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">
                ▲ +2 units
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">New Vehicles Sold</p>
            <p className="text-2xl font-black text-gray-900 mt-1">7</p>
            <p className="text-xs text-gray-400 mt-1">vs last month</p>
          </div>

          {/* Service Jobs */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-orange-50">
                <Wrench size={18} className="text-orange-600" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">
                ▲ +31%
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Service Jobs Completed</p>
            <p className="text-2xl font-black text-gray-900 mt-1">24</p>
            <p className="text-xs text-gray-400 mt-1">vs last month</p>
          </div>

          {/* Loan Disbursements */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <Landmark size={18} className="text-emerald-600" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">
                ▲ +12.1%
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Loan Disbursements</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₹96,50,000</p>
            <p className="text-xs text-gray-400 mt-1">vs last month</p>
          </div>
        </div>

        {/* ── Row 2: Revenue Chart + Lead Funnel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Monthly Revenue Bar Chart (60%) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-4">
              <h2 className="font-black text-gray-900">Monthly Revenue Trend</h2>
              <p className="text-sm text-gray-500">₹ Lakhs · Dec 2024 – May 2025</p>
            </div>
            <BarChart />
          </div>

          {/* Lead Conversion Funnel (40%) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="font-black text-gray-900">Lead Conversion Funnel</h2>
              <p className="text-sm text-gray-500">Active pipeline breakdown</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {FUNNEL_STAGES.map(stage => (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-700">{stage.label}</span>
                    <span
                      className="text-xs font-black"
                      style={{ color: stage.color }}
                    >
                      {stage.count} &nbsp;
                      <span className="font-medium text-gray-400">({stage.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                      style={{
                        width: `${stage.pct}%`,
                        backgroundColor: stage.color,
                      }}
                    >
                      <span className="text-white text-[10px] font-black">{stage.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Leaderboard + Vehicle Sales ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Staff Leaderboard */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="font-black text-gray-900">Top Staff Leaderboard</h2>
              <p className="text-sm text-gray-500">Performance by agent this period</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="pb-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Agent</th>
                    <th className="pb-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Closed</th>
                    <th className="pb-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="pb-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Calls</th>
                  </tr>
                </thead>
                <tbody>
                  {STAFF.map((s, i) => (
                    <tr
                      key={s.name}
                      className={`border-b border-gray-50 transition-colors ${
                        s.gold ? 'bg-amber-50' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="py-3 pr-2">
                        <span className="text-base">{s.rank}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`font-bold text-gray-900 text-sm ${s.gold ? 'text-amber-800' : ''}`}>
                          {s.name}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-black text-gray-900 text-sm">{s.closed}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-sm" style={{ color: '#084D8C' }}>
                          {s.revenue}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-gray-600 text-sm font-medium">{s.calls}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Model Sales Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="font-black text-gray-900">Sales by Vehicle Model</h2>
              <p className="text-sm text-gray-500">Unit sales distribution this period</p>
            </div>
            <DonutChart />

            {/* Horizontal bar breakdown */}
            <div className="mt-6 space-y-2.5">
              {VEHICLE_MODELS.map(m => (
                <div key={m.label} className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-bold w-8 text-right">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
