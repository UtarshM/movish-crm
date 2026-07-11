"use client"
import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import { 
  Search, Plus, ExternalLink, Upload, CheckCircle, AlertCircle, Users, Calendar, 
  RefreshCw, Phone, MessageCircle, X, ArrowRight, User, Car, MapPin, Mail,
  Clock, TrendingUp, FileText, CheckSquare, Star, ChevronRight, Zap, Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-cyan-100 text-cyan-700',
  Proposal: 'bg-purple-100 text-purple-700',
  Negotiation: 'bg-amber-100 text-amber-700',
  Won: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
}

const LEAD_TIMELINE: Record<string, any[]> = {
  default: [
    { icon: '📋', label: 'Lead created in system', time: '3 days ago', color: 'bg-blue-100' },
    { icon: '📞', label: 'First call made — discussed vehicle requirements', time: '2 days ago', color: 'bg-green-100' },
    { icon: '📄', label: 'Quotation sent via WhatsApp', time: '1 day ago', color: 'bg-purple-100' },
    { icon: '📅', label: 'Follow-up scheduled for tomorrow 10:00 AM', time: '5 hrs ago', color: 'bg-amber-100' },
  ]
}

export default function LeadsPage() {
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const initialSearch = searchParams?.get('search') || ''

  const [leads, setLeads] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [importing, setImporting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLead, setNewLead] = useState({ clientName: '', clientPhone: '', vehicleNo: '', clientEmail: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [logCallNote, setLogCallNote] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Date Range State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => { fetchData() }, [startDate, endDate])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      params.append('limit', '100')

      const [leadsData, statsData] = await Promise.all([
        fetchApi(`/api/v1/leads?${params}`),
        fetchApi('/api/v1/leads/stats')
      ])
      
      setLeads(leadsData.leads || [])
      setStats(statsData.summary || null)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const result = await fetchApi('/api/v1/leads/import', { method: 'POST', body: formData })
      alert(`Import Summary:\n- Total Rows: ${result.stats.total}\n- Imported: ${result.stats.assignedCount}\n- Errors: ${result.stats.errors}\n- Duplicates: ${result.stats.duplicates}`)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetchApi('/api/v1/leads', { method: 'POST', body: JSON.stringify(newLead) })
      setShowAddModal(false)
      setNewLead({ clientName: '', clientPhone: '', vehicleNo: '', clientEmail: '' })
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to add lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  const allStatuses = ['All', 'New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']

  const filteredLeads = leads.filter(l => {
    const matchSearch = 
      l.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      l.vehicleNo?.toLowerCase().includes(search.toLowerCase()) ||
      l.clientPhone?.includes(search)
    const matchStatus = statusFilter === 'All' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Track monthly renewals and employee performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" id="csv-import" className="hidden" accept=".csv,.xlsx" onChange={handleImport} />
          <label htmlFor="csv-import" className="cursor-pointer px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Upload size={16} />
            {importing ? 'Importing...' : 'Import Leads'}
          </label>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#084D8C] text-white rounded-xl text-sm font-bold hover:bg-[#053A6E] transition-all shadow-lg shadow-[#084D8C]/20"
          >
            <Plus size={18} /> New Lead
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard title="Total Leads" value={stats?.total || 0} icon={<Users className="text-[#084D8C]" size={22}/>} color="bg-blue-50" onClick={() => { setStatusFilter('All'); setSearch(''); }} />
        <StatCard title="Assigned" value={stats?.assigned || 0} icon={<CheckCircle className="text-green-600" size={22}/>} color="bg-green-50" onClick={() => setStatusFilter('Qualified')} />
        <StatCard title="Converted" value={stats?.converted || 0} icon={<Target className="text-purple-600" size={22}/>} color="bg-purple-50" onClick={() => setStatusFilter('Won')} />
        <StatCard title="Followups" value={stats?.followups || 0} icon={<AlertCircle className="text-amber-600" size={22}/>} color="bg-amber-50" onClick={() => router.push('/follow-ups')} />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
        {allStatuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              statusFilter === s
                ? 'bg-[#084D8C] text-white border-[#084D8C] shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#084D8C]/30 hover:text-[#084D8C]'
            }`}
          >
            {s} {s !== 'All' && <span className="ml-1 opacity-60">({leads.filter(l => l.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, phone or vehicle number..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#084D8C]/30 focus:border-[#084D8C]/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Calendar size={16} className="text-gray-400" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs font-semibold outline-none bg-transparent w-28" />
          <span className="text-gray-300">—</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs font-semibold outline-none bg-transparent w-28" />
          {(startDate || endDate) && (
            <button onClick={() => {setStartDate(''); setEndDate('')}} className="text-gray-400 hover:text-red-500 ml-1">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle & Owner</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No leads found.</td></tr>
              ) : filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  onClick={() => { setSelectedLead(lead); setActiveTab('overview') }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#084D8C]/10 text-[#084D8C] flex items-center justify-center font-black text-sm shrink-0">
                        {lead.clientName?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-[#084D8C] transition-colors">{lead.clientName}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">{lead.vehicleNo}</div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`tel:${lead.clientPhone}`} onClick={e => e.stopPropagation()} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Call now">
                          <Phone size={13} />
                        </a>
                        <a href={`https://wa.me/91${lead.clientPhone}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="WhatsApp">
                          <MessageCircle size={13} />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#084D8C] text-white flex items-center justify-center text-[10px] font-black">
                        {lead.assignee?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{lead.assignee?.fullName || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-300 group-hover:text-[#084D8C] transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* LEAD DETAIL DRAWER */}
      {/* ══════════════════════════════════════ */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end" onClick={() => setSelectedLead(null)}>
          <div 
            className="w-full max-w-2xl bg-white h-screen flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-[#084D8C] text-white px-6 py-5 shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-2xl">
                    {selectedLead.clientName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black">{selectedLead.clientName}</h2>
                    <p className="text-blue-200 text-xs font-semibold mt-0.5">{selectedLead.vehicleNo} · {selectedLead.clientEmail || 'No email'}</p>
                    <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      selectedLead.status === 'Won' ? 'bg-green-400/20 text-green-100' : 'bg-white/10 text-blue-100'
                    }`}>{selectedLead.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <a
                  href={`tel:${selectedLead.clientPhone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <Phone size={13} /> Call
                </a>
                <a
                  href={`https://wa.me/91${selectedLead.clientPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <a
                  href="/quotations"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <FileText size={13} /> Send Quote
                </a>
                <a
                  href="/follow-ups"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  <Calendar size={13} /> Schedule
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 shrink-0">
              {['overview', 'timeline', 'notes'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === tab
                      ? 'text-[#084D8C] border-b-2 border-[#084D8C] bg-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  {/* Vehicle & Contact Info */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Contact & Vehicle Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow icon={<User size={14} />} label="Owner Name" value={selectedLead.clientName} />
                      <InfoRow icon={<Phone size={14} />} label="Mobile" value={selectedLead.clientPhone || '—'} />
                      <InfoRow icon={<Mail size={14} />} label="Email" value={selectedLead.clientEmail || '—'} />
                      <InfoRow icon={<Car size={14} />} label="Vehicle No" value={selectedLead.vehicleNo || '—'} />
                      <InfoRow icon={<MapPin size={14} />} label="City" value={selectedLead.city || 'Ahmedabad'} />
                      <InfoRow icon={<Calendar size={14} />} label="Created" value={new Date(selectedLead.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} />
                    </div>
                  </div>

                  {/* Status Pipeline */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">Sales Pipeline Stage</h3>
                    <div className="flex items-center gap-1">
                      {['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'].map((s, i) => {
                        const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won']
                        const currentIdx = stages.indexOf(selectedLead.status)
                        const isPast = i < currentIdx
                        const isCurrent = i === currentIdx
                        return (
                          <React.Fragment key={s}>
                            <div className={`flex flex-col items-center gap-1 ${isCurrent ? 'flex-1' : 'shrink-0'}`}>
                              <div className={`h-2 w-full rounded-full transition-all ${
                                isCurrent ? 'bg-[#084D8C]' : isPast ? 'bg-green-400' : 'bg-gray-100'
                              }`}></div>
                              <span className={`text-[9px] font-bold whitespace-nowrap ${
                                isCurrent ? 'text-[#084D8C]' : isPast ? 'text-green-600' : 'text-gray-300'
                              }`}>{s}</span>
                            </div>
                            {i < 4 && <div className="w-1 h-2 shrink-0"></div>}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>

                  {/* Proposed Vehicle */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Proposed Vehicle</h3>
                    <div className="flex items-center gap-4 p-4 bg-[#084D8C]/5 rounded-xl border border-[#084D8C]/10">
                      <div className="w-12 h-12 bg-[#084D8C] rounded-xl flex items-center justify-center">
                        <Car size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-gray-800">{selectedLead.gvw || 'Ashok Leyland Vehicle'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Estimated Value: <span className="font-black text-[#084D8C]">₹18,50,000 – ₹28,00,000</span></p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <a href="/quotations" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#084D8C] text-white text-xs font-bold rounded-xl hover:bg-[#053A6E] transition-all">
                        <FileText size={14} /> Generate Quotation
                      </a>
                      <a href="/services" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all">
                        <Zap size={14} /> Open Job Card
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* TIMELINE TAB */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Interaction History</h3>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                    {[
                      { icon: '📋', label: `Lead created — ${selectedLead.clientName}`, detail: 'Auto-registered via import', time: '3 days ago', color: 'bg-blue-100' },
                      { icon: '📞', label: 'First call logged', detail: 'Discussed Ashok Leyland AVTR 2820 requirements and fleet size.', time: '2 days ago', color: 'bg-green-100' },
                      { icon: '📄', label: 'Quotation sent via WhatsApp', detail: 'Quote #QT-2026-0042 — ₹22,40,000 total value', time: '1 day ago', color: 'bg-purple-100' },
                      { icon: '📊', label: `Status updated to "${selectedLead.status}"`, detail: 'Updated by Rajesh Sharma', time: '16 hrs ago', color: 'bg-amber-100' },
                      { icon: '📅', label: 'Follow-up scheduled', detail: 'Call tomorrow 10:00 AM regarding financing options', time: '5 hrs ago', color: 'bg-rose-100' },
                    ].map((event, i) => (
                      <div key={i} className="relative flex gap-4 pb-6">
                        <div className={`absolute -left-6 w-5 h-5 rounded-full ${event.color} flex items-center justify-center text-[10px] z-10`}>
                          {event.icon}
                        </div>
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex-1">
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-bold text-gray-800">{event.label}</p>
                            <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap ml-2">{event.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{event.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTES TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Quick Note / Call Log</h3>
                  <textarea
                    value={logCallNote}
                    onChange={e => setLogCallNote(e.target.value)}
                    placeholder="Type your call notes or observations here..."
                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#084D8C]/30 resize-none"
                  />
                  <button
                    onClick={() => { alert('Note saved! (This would save to the database in production)'); setLogCallNote('') }}
                    className="w-full py-3 bg-[#084D8C] text-white font-bold text-sm rounded-xl hover:bg-[#053A6E] transition-all shadow-lg shadow-[#084D8C]/20"
                  >
                    Save Note & Log Call
                  </button>

                  {/* Existing notes */}
                  <div className="space-y-3 pt-2">
                    {[
                      { author: 'Rajesh Sharma', time: '2 days ago', text: 'Client is interested in Tipper variant for sand & gravel business. Has fleet of 3 trucks currently. Budget flexible up to ₹30L with good financing.' },
                      { author: 'Amit Patel', time: '1 day ago', text: 'Sent full spec sheet of AVTR 2820. Client asked about service availability near Naroda GIDC.' },
                    ].map((note, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-gray-700">{note.author}</span>
                          <span className="text-[10px] text-gray-400">{note.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              {[
                { label: 'Owner Name *', key: 'clientName', type: 'text', required: true },
                { label: 'Phone Number *', key: 'clientPhone', type: 'text', required: true },
                { label: 'Vehicle Number *', key: 'vehicleNo', type: 'text', required: true },
                { label: 'Email (Optional)', key: 'clientEmail', type: 'email', required: false },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">{field.label}</label>
                  <input
                    required={field.required}
                    type={field.type}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#084D8C]/30"
                    value={(newLead as any)[field.key]}
                    onChange={e => setNewLead({...newLead, [field.key]: e.target.value})}
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 px-4 py-3 bg-[#084D8C] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#084D8C]/20 hover:bg-[#053A6E] transition-all">
                  {isSubmitting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl border border-gray-100 shadow-sm ${color} hover:shadow-md transition-all select-none ${onClick ? 'cursor-pointer hover:border-gray-200 hover:scale-[1.01] active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  )
}
