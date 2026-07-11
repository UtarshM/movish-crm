"use client"
import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import {
  Target, Users2, ShieldCheck, FileText, DownloadCloud, Plus,
  Clock, AlertCircle, TrendingUp, BarChart2, Briefcase, Activity,
  MapPin, Phone, UserCheck, RefreshCw, Calendar, X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Revenue & Activity Data ────────────────────────────────────────────────
const REVENUE_DATA = [185000, 220000, 175000, 310000, 265000, 390000, 285000]
const REVENUE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_REVENUE = Math.max(...REVENUE_DATA)

const ACTIVITY_FEED = [
  { dot: '#22c55e', title: 'New Lead: Karnavati Builders', time: '2 min ago' },
  { dot: '#3b82f6', title: 'Job Card opened: GJ-01-XX-2920', time: '15 min ago' },
  { dot: '#eab308', title: 'Follow-up due: Patel Earthmovers', time: '32 min ago' },
  { dot: '#a855f7', title: 'Loan approved: Gujarat Agro ₹18.5L', time: '1 hr ago' },
  { dot: '#ef4444', title: 'Workshop QC pending: Mehta Transports', time: '2 hrs ago' },
  { dot: '#22c55e', title: 'Payment received: ₹15,500 via UPI', time: '3 hrs ago' },
]

const FAB_ITEMS = [
  { label: '+ New Lead', href: '/leads' },
  { label: '+ Job Card', href: '/services' },
  { label: '+ Finance Application', href: '/loans' },
  { label: '+ Schedule Visit', href: '/follow-ups' },
]

// ─── Live Clock ─────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      setTime(`${hh}:${mm}:${ss}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#084D8C]/8 border border-[#084D8C]/15 rounded-2xl">
      <Clock size={16} className="text-[#084D8C]" />
      <span className="text-sm font-black text-[#084D8C] tabular-nums tracking-widest">{time}</span>
    </div>
  )
}

// ─── Revenue Chart ───────────────────────────────────────────────────────────
function RevenueChart() {
  const fmt = (v: number) =>
    '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : (v / 1000).toFixed(0) + 'K')

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex-1">
      <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
        <BarChart2 size={20} className="text-[#084D8C]" />
        Weekly Revenue Overview
      </h3>
      <p className="text-xs font-semibold text-gray-400 mb-6 tracking-wide uppercase">
        Movish Auto Ahmedabad
      </p>

      <div className="flex items-end gap-3 h-48">
        {REVENUE_DATA.map((val, i) => {
          const heightPct = Math.round((val / MAX_REVENUE) * 100)
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex flex-col justify-end" style={{ height: '180px' }}>
                <div
                  title={`₹${val.toLocaleString('en-IN')}`}
                  style={{
                    height: `${heightPct}%`,
                    background: 'linear-gradient(to top, #084D8C, #D8232A)',
                    borderRadius: '8px 8px 4px 4px',
                    transition: 'height 0.6s ease',
                    cursor: 'default',
                    position: 'relative',
                  }}
                  className="w-full hover:opacity-80 transition-opacity group"
                >
                  {/* Hover tooltip */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '-28px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#084D8C',
                      background: '#EBF2FA',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      pointerEvents: 'none',
                      opacity: 0,
                    }}
                    className="group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {fmt(val)}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400">{REVENUE_DAYS[i]}</span>
            </div>
          )
        })}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between mt-4 border-t border-gray-50 pt-3">
        <span className="text-xs text-gray-300 font-bold">₹0</span>
        <span className="text-xs text-gray-300 font-bold">{fmt(MAX_REVENUE / 2)}</span>
        <span className="text-xs text-gray-300 font-bold">{fmt(MAX_REVENUE)}</span>
      </div>
    </div>
  )
}

// ─── Activity Feed ───────────────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full lg:w-96 flex-shrink-0">
      <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
        <Activity size={20} className="text-[#D8232A]" />
        Today's Activity Feed
      </h3>
      <div className="space-y-4 overflow-y-auto max-h-64 pr-1 scrollbar-thin scrollbar-thumb-gray-100">
        {ACTIVITY_FEED.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 group">
            <div
              className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: ev.dot }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 leading-tight truncate">{ev.title}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{ev.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Floating Action Button ───────────────────────────────────────────────────
function FloatingFAB() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Menu items */}
      <div
        className="flex flex-col gap-2 items-end"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(16px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        {FAB_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => { router.push(item.href); setOpen(false) }}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-2xl shadow-xl hover:bg-[#084D8C] hover:text-white hover:border-[#084D8C] transition-all duration-200 whitespace-nowrap hover:scale-[1.03] active:scale-95"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* FAB Button */}
      <div className="relative">
        {/* Pulsing ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#084D8C] opacity-30 animate-ping"
          style={{ animationDuration: '1.8s' }}
        />
        <button
          onClick={() => setOpen(v => !v)}
          className="relative w-14 h-14 bg-[#084D8C] hover:bg-[#053A6E] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#084D8C]/40 transition-all duration-200 hover:scale-110 active:scale-95"
          title="Quick Add"
          aria-label="Quick Add"
        >
          <Plus
            size={28}
            style={{
              transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.22s ease',
            }}
          />
        </button>
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, href }: any) {
  const cardContent = (
    <div className={`bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300 group ${href ? 'cursor-pointer hover:shadow-lg hover:shadow-gray-100/50 hover:border-gray-200 hover:scale-[1.01] active:scale-[0.99]' : ''}`}>
      <div className="flex md:flex-col md:items-start justify-between items-center gap-4 mb-3 md:mb-5">
        <div className={`w-8 h-8 md:w-14 md:h-14 ${bg} ${color} rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 md:order-first group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4 md:w-7 md:h-7" />
        </div>
        <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider md:tracking-widest md:mt-4 truncate">{label}</p>
      </div>
      <p className="text-2xl md:text-4xl font-black text-gray-900 leading-none">{value || 0}</p>
    </div>
  )

  if (href) {
    return <Link href={href} className="block select-none">{cardContent}</Link>
  }
  return cardContent
}

// ─── Pipeline Bar ─────────────────────────────────────────────────────────────
function PipelineBar({ pipeline }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="text-red-600" size={24} />
        Sales Pipeline Distribution
      </h3>
      <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-100 shadow-inner mb-6">
        {pipeline.map((p: any, i: number) => (
          <div
            key={p.status}
            style={{ width: `${(p.count / pipeline.reduce((a: any, b: any) => a + b.count, 0)) * 100}%` }}
            className={`h-full transition-all duration-500 ${['bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500'][i % 6]}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipeline.map((p: any) => (
          <div key={p.status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-gray-600">{p.status}</span>
            <span className="text-sm font-black text-gray-900 ml-auto">{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Team List ────────────────────────────────────────────────────────────────
function TeamList({ team }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Users2 className="text-blue-600" size={24} />
        Team Activity Oversight
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Agent Name</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Total Leads</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Calls</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {team.map((agent: any) => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-bold text-gray-800">{agent.name}</td>
                <td className="py-4 px-4 font-black text-gray-900">{agent.totalLeads || 0}</td>
                <td className="py-4 px-4 text-gray-600 font-medium">{agent.totalCalls || 0}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: agent.conversionRate }} />
                    </div>
                    <span className="text-xs font-bold text-green-600">{agent.conversionRate}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeactivated, setIsDeactivated] = useState(false)

  // Date Range State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const load = async () => {
    setLoading(true)
    setIsDeactivated(false)
    try {
      const params = new URLSearchParams({ startDate, endDate })
      const data = await fetchApi(`/api/v1/dashboard/stats?${params}`)
      setStats(data)

      if (data?.view === 'manager') {
        const teamData = await fetchApi('/api/v1/manager/team')
        setTeam(teamData)
      }
    } catch (err: any) {
      if (err.message?.includes('deactivated')) {
        setIsDeactivated(true)
      } else {
        console.error('Stats load error:', err)
      }
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [startDate, endDate])

  const downloadReport = async () => {
    let token = ''
    const isMock = typeof window !== 'undefined' ? localStorage.getItem('movish_mock_session') === 'true' : false
    if (isMock) {
      token = 'mock-token-super-admin'
    } else {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase.auth.getSession()
        token = data.session?.access_token || ''
      } catch (err) {
        console.error('Supabase session load error:', err)
      }
    }
    const params = new URLSearchParams({ type: 'summary', from: startDate, to: endDate, token })
    window.open(`/api/v1/reports?${params}`, '_blank')
  }

  return (
    <AdminLayout>
      {isDeactivated && (
        <div className="mb-6 p-10 bg-red-50 border-2 border-red-200 rounded-3xl text-center shadow-xl shadow-red-50 animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-inner">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-red-900 mb-3 tracking-tight">Account Access Restricted</h2>
          <p className="text-red-700 max-w-md mx-auto text-lg leading-relaxed font-medium">
            Your account is currently inactive. Please contact your system administrator to reactivate your access.
          </p>
        </div>
      )}

      {!isDeactivated && (
        <>
          {/* ── Header Row ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {stats?.view === 'agent' ? 'Sales Performance' :
                   stats?.view === 'manager' ? 'Team Leadership' :
                   'Control Center'}
                </h1>
                <LiveClock />
              </div>
              <p className="text-gray-500 mt-1.5 font-medium">
                {stats?.view === 'agent' ? 'Welcome back! Tracking your daily sales targets.' :
                 stats?.view === 'manager' ? 'Real-time oversight of your team pipeline.' :
                 'Global operations and system management insights.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                <Calendar size={18} className="text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="text-sm font-bold outline-none bg-transparent"
                />
                <span className="text-gray-300 mx-1">—</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="text-sm font-bold outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={load}
                  className="p-3 text-gray-500 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-200"
                  title="Refresh Data"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-6 py-3 bg-[#084D8C] text-white rounded-2xl text-sm font-bold hover:bg-[#053A6E] transition-all shadow-lg shadow-[#084D8C]/20 hover:scale-[1.02] active:scale-95"
                >
                  <DownloadCloud size={18} />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── KPI Cards ── */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="w-8 h-8 bg-gray-50 rounded-lg" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : !stats ? (
            <div className="bg-white rounded-3xl border-2 border-red-50 border-dashed p-16 text-center text-red-500 mt-8">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-xl text-gray-400">Unable to synchronize dashboard statistics.</p>
              <button onClick={load} className="mt-4 text-sm font-bold text-red-600 hover:underline">Try Again</button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Agent View */}
              {stats.view === 'agent' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatCard label="Leads Assigned" value={stats.my_leads} icon={Target} color="text-blue-600" bg="bg-blue-50" href="/leads" />
                  <StatCard label="Fresh Today" value={stats.new_leads_today} icon={Plus} color="text-green-600" bg="bg-green-50" href="/leads" />
                  <StatCard label="Pending Tasks" value={stats.pending_followups} icon={Clock} color="text-amber-600" bg="bg-amber-50" href="/follow-ups" />
                  <StatCard label="Call Activity" value={stats.calls_today} icon={Phone} color="text-purple-600" bg="bg-purple-50" href="/follow-ups" />
                  <StatCard label="My Quotes" value={stats.my_quotations} icon={FileText} color="text-indigo-600" bg="bg-indigo-50" href="/quotations" />
                </div>
              )}

              {/* Manager View */}
              {stats.view === 'manager' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <StatCard label="Team Leads" value={stats.total_leads} icon={Users2} color="text-blue-600" bg="bg-blue-50" href="/leads" />
                    <StatCard label="Conversions" value={stats.won_leads} icon={UserCheck} color="text-green-600" bg="bg-green-50" href="/leads" />
                    <StatCard label="Open Followups" value={stats.pending_followups} icon={Clock} color="text-amber-600" bg="bg-amber-50" href="/follow-ups" />
                    <StatCard label="Overdue Items" value={stats.overdue_followups} icon={AlertCircle} color="text-red-600" bg="bg-red-50" href="/follow-ups" />
                  </div>
                  {stats.pipeline?.length > 0 && <PipelineBar pipeline={stats.pipeline} />}
                  {team.length > 0 && <TeamList team={team} />}
                </>
              )}

              {/* Admin View */}
              {stats.view === 'admin' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard label="Leads Pipeline" value={stats.total_leads} icon={Target} color="text-[#084D8C]" bg="bg-blue-50" href="/leads" />
                  <StatCard label="New Arrivals" value={stats.new_leads_today} icon={Plus} color="text-green-600" bg="bg-green-50" href="/leads" />
                  <StatCard label="Total Staff" value={stats.total_employees} icon={Users2} color="text-violet-600" bg="bg-violet-50" href="/hr" />
                  <StatCard label="Workshop Tickets" value={stats.active_claims} icon={Briefcase} color="text-[#D8232A]" bg="bg-red-50" href="/services" />
                  <StatCard label="Finance Approvals" value={stats.active_loans} icon={BarChart2} color="text-cyan-600" bg="bg-cyan-50" href="/loans" />
                  <StatCard label="Site Visits" value={stats.today_visits} icon={MapPin} color="text-teal-600" bg="bg-teal-50" href="/follow-ups" />
                </div>
              )}

              {/* ── Revenue Chart + Activity Feed ── */}
              <div className="flex flex-col lg:flex-row gap-6">
                <RevenueChart />
                <ActivityFeed />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Floating Action Button ── */}
      <FloatingFAB />
    </AdminLayout>
  )
}
