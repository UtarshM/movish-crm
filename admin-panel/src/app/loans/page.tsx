"use client"
import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import { Landmark, FileCheck, ArrowRight, User as UserIcon, Clock, Plus, X } from 'lucide-react'

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  const [newLoan, setNewLoan] = useState({
    lead_id: '',
    amount: '',
    loan_type: 'Vehicle Loan',
    bank_name: ''
  })

  useEffect(() => {
    fetchLoans()
    fetchLeads()
  }, [])

  const fetchLoans = async () => {
    setIsLoading(true)
    try {
      const data = await fetchApi('/api/v1/finance/loans')
      setLoans(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLeads = async () => {
    try {
      const data = await fetchApi('/api/v1/leads?limit=100')
      setLeads(data.leads || [])
    } catch {}
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedLead = leads.find(l => l.id === newLoan.lead_id)
      await fetchApi('/api/v1/finance/loans', {
        method: 'POST',
        body: JSON.stringify({
          ...newLoan,
          customer_name: selectedLead?.clientName,
          amount: parseFloat(newLoan.amount)
        })
      })
      setIsModalOpen(false)
      fetchLoans()
      alert('Loan application created!')
    } catch (error: any) {
      alert(error.message || 'Failed to create')
    }
  }

  const handleUpdateStatus = async (id: string, updates: any) => {
    try {
      await fetchApi('/api/v1/finance/loans', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates })
      })
      fetchLoans()
    } catch (error) {
      alert('Failed to update loan')
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Vehicle Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track commercial vehicle loan and finance applications.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#084D8C] text-white rounded-xl text-sm font-semibold hover:bg-[#053A6E] transition-all shadow-md"
        >
          <Plus size={18} />
          New Finance Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-900 px-1">Active Finance Files</h3>
          {isLoading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : loans.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic">No finance requests found.</div>
          ) : loans.map((loan) => (
            <div key={loan.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{loan.customerName}</h4>
                  <p className="text-xs text-gray-500 font-medium">{loan.loanType} · ₹{parseFloat(loan.amount).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <select 
                      value={loan.conversionStatus}
                      onChange={(e) => handleUpdateStatus(loan.id, { conversionStatus: e.target.value })}
                      className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 border-none rounded-lg p-1 outline-none cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Processing">Processing</option>
                      <option value="Approved">Approved</option>
                      <option value="Disbursed">Disbursed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      loan.conversionStatus === 'Disbursed' ? 'bg-green-50 text-green-700' :
                      loan.conversionStatus === 'Rejected' ? 'bg-red-50 text-[#D8232A]' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {loan.conversionStatus}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    {new Date(loan.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-[#084D8C] p-6 rounded-2xl text-white shadow-lg shadow-blue-50">
            <h4 className="font-bold text-lg">Finance Funnel</h4>
            <p className="text-blue-100 text-sm mt-1">Track files from initial submission to final disbursement.</p>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs">
                <span>Disbursed</span>
                <span className="font-bold">{loans.filter(l => l.conversionStatus === 'Disbursed').length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>In Process</span>
                <span className="font-bold">{loans.filter(l => ['Applied', 'Processing', 'Approved'].includes(l.conversionStatus)).length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4">Partner Financiers</h4>
            <div className="space-y-4">
              {['IndusInd Bank', 'Cholamandalam Finance', 'Sundaram Finance', 'Tata Capital'].map((bank) => (
                <div key={bank} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#084D8C] shadow-sm">
                      <Landmark size={16} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{bank}</span>
                  </div>
                  <FileCheck size={16} className="text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">New Finance File</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Lead</label>
                <select required value={newLoan.lead_id} onChange={e => setNewLoan({...newLoan, lead_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose a lead...</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.clientName} ({l.vehicleNo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Finance Type</label>
                <select value={newLoan.loan_type} onChange={e => setNewLoan({...newLoan, loan_type: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Chassis Funding</option>
                  <option>Body Funding</option>
                  <option>Full Vehicle Loan</option>
                  <option>Refinance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Required Funding (INR)</label>
                <input required type="number" value={newLoan.amount} onChange={e => setNewLoan({...newLoan, amount: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preferred Financier</label>
                <input value={newLoan.bank_name} onChange={e => setNewLoan({...newLoan, bank_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cholamandalam Finance" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#084D8C] text-white rounded-xl font-bold hover:bg-[#053A6E] transition-all shadow-lg mt-2">
                Submit File
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
