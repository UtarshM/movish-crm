"use client"
import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import { FileText, Clock, CheckCircle2, AlertCircle, Search, Plus, X } from 'lucide-react'

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newClaim, setNewClaim] = useState({
    customerName: '',
    vehicleNumber: '',
    type: 'Scheduled Service',
    amount: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchApi('/api/v1/claims')
      setClaims(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchApi('/api/v1/claims', {
        method: 'POST',
        body: JSON.stringify({
          customerName: newClaim.customerName,
          vehicleNumber: newClaim.vehicleNumber,
          type: newClaim.type,
          amount: parseFloat(newClaim.amount),
          description: newClaim.description
        })
      })
      setIsModalOpen(false)
      setNewClaim({
        customerName: '',
        vehicleNumber: '',
        type: 'Scheduled Service',
        amount: '',
        description: ''
      })
      fetchData()
      alert('Workshop Ticket registered successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to submit service ticket')
    }
  }

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'filed' || c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved' || c.status === 'completed').length,
    rejected: claims.filter(c => c.status === 'rejected' || c.status === 'cancelled').length,
  }

  const filteredClaims = claims.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workshop & Service Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage commercial vehicle service tickets, breakdown queries, and warranty claims.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#084D8C] text-white rounded-xl text-sm font-semibold hover:bg-[#053A6E] transition-all shadow-md"
          >
            <Plus size={18} />
            New Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <StatItem label="Total Tickets" count={stats.total} icon={FileText} color="blue" />
        <StatItem label="Active / Pending" count={stats.pending} icon={Clock} color="orange" />
        <StatItem label="Completed" count={stats.approved} icon={CheckCircle2} color="green" />
        <StatItem label="Cancelled" count={stats.rejected} icon={AlertCircle} color="red" />
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ticket ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Service Category</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estimated Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : filteredClaims.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">No tickets found.</td></tr>
            ) : filteredClaims.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                <td className="px-6 py-4 font-medium text-gray-900">#{c.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{c.customerName || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{c.vehicleNumber || 'No Reg Number'}</p>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">{c.claimType}</td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{parseFloat(c.claimAmount || 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    c.status === 'approved' || c.status === 'completed' ? 'bg-green-50 text-green-700' :
                    c.status === 'rejected' || c.status === 'cancelled' ? 'bg-red-50 text-[#D8232A]' :
                    'bg-orange-50 text-orange-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Register New Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
                <input required type="text" value={newClaim.customerName} onChange={e => setNewClaim({...newClaim, customerName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Ahmedabad Logistics" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle No / Chassis No</label>
                <input required type="text" value={newClaim.vehicleNumber} onChange={e => setNewClaim({...newClaim, vehicleNumber: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. GJ-01-XX-9999" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Category</label>
                <select value={newClaim.type} onChange={e => setNewClaim({...newClaim, type: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Scheduled Service</option>
                  <option>Warranty Claim</option>
                  <option>Accident Repair</option>
                  <option>Engine Breakdown</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estimated Cost</label>
                <input required type="number" value={newClaim.amount} onChange={e => setNewClaim({...newClaim, amount: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="₹" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Description</label>
                <textarea rows={3} value={newClaim.description} onChange={e => setNewClaim({...newClaim, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe current complaints or issues..." />
              </div>
              <button type="submit" className="w-full py-3 bg-[#084D8C] text-white rounded-xl font-bold hover:bg-[#053A6E] transition-all shadow-lg mt-2">
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatItem({ label, count, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-[#084D8C]',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-[#D8232A]'
  }
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
    </div>
  )
}
