"use client"
import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import {
  Shield, CheckCircle2, Circle, Save,
  ChevronRight, Search, ChevronDown, Plus, Trash2,
  X, AlertCircle, RefreshCw, Users, Lock, CheckSquare
} from 'lucide-react'

const GROUP_LABELS: Record<string, string> = {
  auth: 'Authentication & Security',
  role: 'Role & Permission Management',
  lead: 'Lead Management',
  rate: 'Rate Calculator',
  rto: 'RTO Work Management',
  vahan: 'Vahan Work Management',
  fitness: 'Fitness Work Management',
  claims: 'Claims Management',
  accounts: 'Accounts & Finance',
  hr: 'HR Management',
  loan: 'Loan Department',
  crm: 'CRM System',
  visit: 'Customer Visit Module',
  data: 'Data Management',
  quotation: 'Quotation System',
  dashboard: 'Dashboard & Analytics',
  notification: 'Notifications',
  template: 'Templates (WhatsApp/SMS)',
  system: 'Admin Panel / System Config',
}

const GROUP_ICONS: Record<string, string> = {
  auth: '🔐', role: '🛡️', lead: '📋', rate: '💰', rto: '🚗',
  vahan: '🚘', fitness: '🔧', claims: '📄', accounts: '💳', hr: '👥',
  loan: '🏦', crm: '🤝', visit: '📍', data: '🗄️',
  quotation: '📊', dashboard: '📈', notification: '🔔',
  template: '💬', system: '⚙️',
}

const GROUP_ORDER = [
  'auth', 'role', 'lead', 'rate', 'rto', 'vahan', 'fitness', 'claims',
  'accounts', 'hr', 'loan', 'crm', 'visit', 'data', 'quotation',
  'dashboard', 'notification', 'template', 'system',
]

const ROLE_BADGE_COLORS: Record<string, string> = {
  'Admin': 'bg-red-100 text-red-700 border-red-200',
  'Sales Manager': 'bg-blue-100 text-blue-700 border-blue-200',
  'Service Executive': 'bg-orange-100 text-orange-700 border-orange-200',
  'Finance Officer': 'bg-green-100 text-green-700 border-green-200',
  'CRM Agent': 'bg-purple-100 text-purple-700 border-purple-200',
}

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [rolePermissions, setRolePermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const loadRolePerms = useCallback(async (role: any) => {
    setSelectedRole(role)
    try {
      const data = await fetchApi(`/api/v1/roles/${role.id}`)
      setRolePermissions(Array.isArray(data?.permissions) ? data.permissions.map((p: any) => p.id) : [])
    } catch (err) {
      console.error('Failed to load role permissions', err)
      setRolePermissions([])
    }
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setSaveError('')
    try {
      const [rolesData, permsData] = await Promise.all([
        fetchApi('/api/v1/roles'),
        fetchApi('/api/v1/permissions'),
      ])
      const safeRoles = Array.isArray(rolesData) ? rolesData : []
      const safePerms = Array.isArray(permsData) ? permsData : []
      setRoles(safeRoles)
      setPermissions(safePerms)
      if (safeRoles.length > 0) {
        await loadRolePerms(safeRoles[0])
      }
    } catch (err) {
      console.error('Fetch error', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadRolePerms])

  useEffect(() => { fetchData() }, [fetchData])

  const togglePermission = (id: string) =>
    setRolePermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const handleSave = async () => {
    if (!selectedRole) return
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      await fetchApi(`/api/v1/roles/${selectedRole.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissionIds: rolePermissions }),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const data = await fetchApi('/api/v1/roles', {
        method: 'POST',
        body: JSON.stringify({ name: newRoleName.trim(), description: newRoleDesc.trim() }),
      })
      setShowCreateModal(false)
      setNewRoleName('')
      setNewRoleDesc('')
      await fetchData()
      if (data?.id) loadRolePerms(data)
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create role')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteRole = async (role: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete role "${role.name}"? Users with this role will become unassigned.`)) return
    try {
      await fetchApi(`/api/v1/roles/${role.id}`, { method: 'DELETE' })
      if (selectedRole?.id === role.id) { setSelectedRole(null); setRolePermissions([]) }
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // Build permission groups
  const groups: Record<string, any[]> = {}
  permissions.forEach(p => {
    const g = p.name.split('.')[0]
    if (!groups[g]) groups[g] = []
    groups[g].push(p)
  })

  const orderedGroups = [
    ...GROUP_ORDER.filter(g => groups[g]),
    ...Object.keys(groups).filter(g => !GROUP_ORDER.includes(g)),
  ]

  const filteredGroups = orderedGroups.filter(g =>
    !searchQuery ||
    (GROUP_LABELS[g] || g).toLowerCase().includes(searchQuery.toLowerCase()) ||
    groups[g]?.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleGroup = (g: string) =>
    setExpandedGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const toggleAllInGroup = (g: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const ids = groups[g].map((p: any) => p.id)
    const allOn = ids.every((id: string) => rolePermissions.includes(id))
    setRolePermissions(prev => allOn ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])])
  }

  const totalPerms = permissions.length
  const selectedCount = rolePermissions.length
  const coverage = totalPerms > 0 ? Math.round((selectedCount / totalPerms) * 100) : 0

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {roles.length} roles · {permissions.length} permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {saveSuccess && (
            <span className="text-sm text-green-600 font-bold flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-xl">
              <CheckCircle2 size={16} /> Saved!
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-600 font-semibold">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedRole}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#084D8C] text-white rounded-xl text-sm font-bold hover:bg-[#053A6E] transition-all shadow-lg shadow-[#084D8C]/20 disabled:opacity-50"
          >
            {isSaving
              ? <><RefreshCw size={15} className="animate-spin" /> Saving…</>
              : <><Save size={15} /> Save Changes</>
            }
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Roles Sidebar ── */}
        <div className="w-72 shrink-0 space-y-3">
          <div className="flex items-center justify-between px-1 mb-3">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Roles ({roles.length})
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#084D8C] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
            >
              <Plus size={13} /> New Role
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
              No roles found. Click "+ New Role" to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map(role => (
                <div key={role.id} className="group relative">
                  <button
                    onClick={() => loadRolePerms(role)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                      selectedRole?.id === role.id
                        ? 'bg-[#084D8C] border-[#084D8C] shadow-lg shadow-[#084D8C]/20'
                        : 'bg-white border-gray-100 hover:border-[#084D8C]/20 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole?.id === role.id ? 'bg-white/10' : 'bg-[#084D8C]/10'
                    }`}>
                      <Shield size={18} className={selectedRole?.id === role.id ? 'text-white' : 'text-[#084D8C]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${selectedRole?.id === role.id ? 'text-white' : 'text-gray-800'}`}>
                        {role.name}
                      </p>
                      <p className={`text-[10px] truncate mt-0.5 ${selectedRole?.id === role.id ? 'text-blue-200' : 'text-gray-400'}`}>
                        {role._count?.users ?? 0} users · {role.description?.slice(0, 30)}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`shrink-0 ${selectedRole?.id === role.id ? 'text-blue-200' : 'text-gray-300'}`}
                    />
                  </button>
                  <button
                    onClick={e => handleDeleteRole(role, e)}
                    className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                    title="Delete role"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Role Stats */}
          {selectedRole && (
            <div className="bg-gradient-to-br from-[#084D8C] to-[#1E7BC4] text-white rounded-2xl p-4 mt-4">
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-3">Coverage</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-black">{coverage}%</span>
                <span className="text-blue-200 text-xs mb-1">{selectedCount}/{totalPerms} perms</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${coverage}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Permissions Panel ── */}
        <div className="flex-1 space-y-4 min-w-0">
          {!selectedRole ? (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                <Lock size={32} className="text-gray-200" />
              </div>
              <p className="font-black text-gray-400 text-lg">Select a role</p>
              <p className="text-gray-300 text-sm mt-1">to manage its permissions</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#084D8C] flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-900">{selectedRole.name}</p>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${ROLE_BADGE_COLORS[selectedRole.name] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {selectedRole._count?.users ?? 0} users
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedRole.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setRolePermissions(permissions.map(p => p.id))}
                    className="text-xs font-bold text-[#084D8C] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setRolePermissions([])}
                    className="text-xs font-bold text-gray-600 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    Clear All
                  </button>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                    <Search size={13} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search permissions…"
                      className="text-sm bg-transparent border-none outline-none w-36 text-gray-700 placeholder-gray-400"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Groups */}
              <div className="space-y-3">
                {filteredGroups.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                    No permissions match your search.
                  </div>
                ) : filteredGroups.map(group => {
                  const isExpanded = expandedGroups.includes(group) || !!searchQuery
                  const groupPerms = groups[group] || []
                  const selectedCountInGroup = groupPerms.filter((p: any) => rolePermissions.includes(p.id)).length
                  const allOn = selectedCountInGroup === groupPerms.length && groupPerms.length > 0
                  const someOn = selectedCountInGroup > 0 && !allOn

                  return (
                    <div key={group} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Group header */}
                      <div
                        onClick={() => toggleGroup(group)}
                        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                            allOn ? 'bg-[#084D8C]/10 border-[#084D8C]/20' : someOn ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'
                          }`}>
                            {GROUP_ICONS[group] || '🔧'}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-sm">
                              {GROUP_LABELS[group] || group}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {selectedCountInGroup} of {groupPerms.length} permissions active
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex items-center gap-1.5">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${allOn ? 'bg-[#084D8C]' : someOn ? 'bg-amber-400' : 'bg-gray-200'}`}
                                style={{ width: `${groupPerms.length ? (selectedCountInGroup / groupPerms.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 w-8 text-right">
                              {groupPerms.length ? Math.round((selectedCountInGroup / groupPerms.length) * 100) : 0}%
                            </span>
                          </div>
                          <button
                            onClick={e => toggleAllInGroup(group, e)}
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl transition-all ${
                              allOn
                                ? 'bg-[#084D8C] text-white'
                                : 'bg-blue-50 text-[#084D8C] hover:bg-blue-100'
                            }`}
                          >
                            {allOn ? 'Deselect' : 'Select All'}
                          </button>
                          <ChevronDown
                            size={17}
                            className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Permission items */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-3 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                          {groupPerms.map((p: any) => {
                            const on = rolePermissions.includes(p.id)
                            return (
                              <div
                                key={p.id}
                                onClick={() => togglePermission(p.id)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                  on
                                    ? 'bg-[#084D8C]/5 border-[#084D8C]/20 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50/80'
                                }`}
                              >
                                {on
                                  ? <CheckCircle2 size={16} className="text-[#084D8C] shrink-0" />
                                  : <Circle size={16} className="text-gray-200 shrink-0" />
                                }
                                <div className="min-w-0">
                                  <p className={`text-sm font-bold truncate capitalize ${on ? 'text-[#084D8C]' : 'text-gray-600'}`}>
                                    {p.name.split('.').slice(1).join('.').replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-mono truncate">{p.name}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Create Role Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Create New Role</h2>
                <p className="text-xs text-gray-400 mt-1">Define role and assign permissions after</p>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setCreateError('') }}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Role Name *</label>
                <input
                  type="text" required autoFocus placeholder="e.g. Sales Manager"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#084D8C]/30 focus:border-[#084D8C]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text" placeholder="Optional description"
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#084D8C]/30 focus:border-[#084D8C]/50"
                />
              </div>
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} /> {createError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateError('') }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-[#084D8C] text-white rounded-xl text-sm font-bold hover:bg-[#053A6E] disabled:opacity-50 shadow-lg shadow-[#084D8C]/20"
                >
                  {creating ? 'Creating…' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
