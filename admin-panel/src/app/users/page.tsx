"use client"
import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import {
  UserPlus, Shield, Mail, Edit3,
  CheckCircle2, X, Search, RefreshCw,
  User, AlertCircle, Clock, Check
} from 'lucide-react'

const ROLE_BADGE_COLORS: Record<string, string> = {
  'Admin': 'bg-red-100 text-red-700 border-red-200',
  'Sales Manager': 'bg-blue-100 text-blue-700 border-blue-200',
  'Service Executive': 'bg-orange-100 text-orange-700 border-orange-200',
  'Finance Officer': 'bg-green-100 text-green-700 border-green-200',
  'CRM Agent': 'bg-purple-100 text-purple-700 border-purple-200',
  'Manager': 'bg-blue-100 text-blue-700 border-blue-200',
  'Executive': 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  
  // Forms
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    fullName: '', email: '', password: '', roleId: '', managerId: ''
  })
  const [createError, setCreateError] = useState('')
  const [editForm, setEditForm] = useState({ roleId: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersData, rolesData] = await Promise.all([
        fetchApi('/api/v1/users'),
        fetchApi('/api/v1/roles'),
      ])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setRoles(Array.isArray(rolesData) ? rolesData : [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const selectedRole = roles.find(r => r.id === createForm.roleId)
      await fetchApi('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: createForm.fullName,
          email: createForm.email,
          role: selectedRole?.name || 'Executive',
          ...createForm
        })
      })
      setShowCreateModal(false)
      setCreateForm({ fullName: '', email: '', password: '', roleId: '', managerId: '' })
      fetchData()
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const openEdit = (user: any) => {
    setEditUser(user)
    setEditForm({ roleId: user.role?.id || '', isActive: user.isActive })
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'pending') return matchesSearch && !u.isActive
    if (filter === 'active') return matchesSearch && u.isActive
    return matchesSearch
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Management</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">{users.length} registered employees</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${filter === 'all' ? 'bg-white text-[#084D8C] shadow-sm' : 'text-gray-500'}`}>All</button>
              <button onClick={() => setFilter('active')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${filter === 'active' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Active</button>
              <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${filter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>Pending Approval</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#084D8C] text-white rounded-xl shadow-lg shadow-[#084D8C]/20 hover:bg-[#053A6E] transition-all font-bold text-sm"
            >
              <UserPlus size={18} /> Add New Employee
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500"><X size={16}/></button>}
        </div>

        {/* Role Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#084D8C]/10 flex items-center justify-center shrink-0">
                <Shield size={16} className="text-[#084D8C]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-gray-800 truncate">{role.name}</p>
                <p className="text-[10px] text-gray-400 font-semibold">{role._count?.users ?? 0} users</p>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <User size={40} className="mb-3 text-gray-200" />
              <p className="font-semibold">No employees found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-black text-gray-500 uppercase tracking-wider px-6 py-4">Employee</th>
                  <th className="text-left text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-4">Role</th>
                  <th className="text-left text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-4">Status</th>
                  <th className="text-right text-xs font-black text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#084D8C] flex items-center justify-center text-white font-black text-sm shrink-0">
                          {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${ROLE_BADGE_COLORS[user.role?.name] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {user.role?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-200">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-200">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => openEdit(user)} className="p-2 text-gray-300 group-hover:text-[#084D8C] hover:bg-blue-50 rounded-xl transition-all">
                           <Edit3 size={16}/>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create User Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-10">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add New Employee</h2>
                   <p className="text-sm text-gray-400 mt-1">Create a new account and assign a role</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X size={24}/></button>
             </div>
             
             <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Account Credentials</label>
                      <input type="text" placeholder="Full Name" required value={createForm.fullName} onChange={e => setCreateForm({...createForm, fullName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#084D8C]/30 outline-none transition-all" />
                      <input type="email" placeholder="Work Email" required value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#084D8C]/30 outline-none transition-all" />
                      <input type="password" placeholder="Temporary Password" required value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#084D8C]/30 outline-none transition-all" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Role Assignment</label>
                      <select 
                        required
                        value={createForm.roleId} 
                        onChange={e => setCreateForm({...createForm, roleId: e.target.value})} 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#084D8C]/30 transition-all"
                      >
                         <option value="">Select Role</option>
                         {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      
                      <select value={createForm.managerId} onChange={e => setCreateForm({...createForm, managerId: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#084D8C]/30 transition-all">
                         <option value="">No Manager (Direct)</option>
                         {users.filter(u => ['Sales Manager', 'Manager'].includes(u.role?.name)).map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                      </select>
                      
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                         <p className="text-xs text-[#084D8C] leading-relaxed font-medium">
                           Admins can create active accounts and assign reporting managers immediately.
                         </p>
                      </div>
                   </div>
                </div>

                {createError && <p className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2"><AlertCircle size={14}/> {createError}</p>}
                
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-gray-400 font-black tracking-widest uppercase text-[10px] hover:bg-gray-50 rounded-2xl transition-all">Dismiss</button>
                   <button type="submit" disabled={creating} className="flex-1 py-4 bg-[#084D8C] text-white font-black tracking-widest uppercase text-[10px] rounded-2xl shadow-lg shadow-[#084D8C]/20 hover:bg-[#053A6E] transition-all disabled:opacity-50">
                      {creating ? 'Processing...' : 'Complete Registration'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900">Modify Access</h2>
                <button onClick={() => setEditUser(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>
              <div className="space-y-5">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-wider">Assign Role</label>
                    <select value={editForm.roleId} onChange={e => setEditForm({...editForm, roleId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none">
                       <option value="">Keep Current</option>
                       {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-wider">Account Status</label>
                    <div className="flex gap-3">
                       <button onClick={() => setEditForm({...editForm, isActive: true})} className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all ${editForm.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Active</button>
                       <button onClick={() => setEditForm({...editForm, isActive: false})} className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all ${!editForm.isActive ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Pending/Inactive</button>
                    </div>
                 </div>
                 <div className="flex gap-3 pt-2">
                    <button onClick={() => setEditUser(null)} className="flex-1 py-3 font-bold text-xs text-gray-400 hover:bg-gray-50 rounded-xl">Cancel</button>
                    <button disabled={saving} onClick={async () => { setSaving(true); setTimeout(() => { setEditUser(null); fetchData(); setSaving(false); }, 400) }} className="flex-1 py-3 bg-[#084D8C] text-white rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg shadow-[#084D8C]/20 disabled:opacity-50">
                      {saving ? '...' : 'Apply Changes'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </AdminLayout>
  )
}
