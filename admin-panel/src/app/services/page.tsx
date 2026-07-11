"use client"
import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { fetchApi } from '@/lib/api'
import { 
  FileText, Clock, CheckCircle2, AlertCircle, Search, Plus, X, 
  Wrench, ShieldCheck, ShoppingCart, UserCheck, CheckSquare, 
  Receipt, ClipboardCheck, Sparkles, ChevronRight, Check,
  Share2, Copy, MessageCircle, ExternalLink, QrCode, Activity
} from 'lucide-react'

// Define the 10 stages of the Ashok Leyland Workshop Lifecycle
const LIFE_STAGES = [
  { stage: 1, name: "Arrival & Job Card", icon: FileText, desc: "Gate entry, odo, chassis and driver complaints" },
  { stage: 2, name: "Vehicle Inspection", icon: Search, desc: "General inspection & complaint diagnosis" },
  { stage: 3, name: "Periodic Schedule", icon: Clock, desc: "Mileage-based periodic maintenance schedule" },
  { stage: 4, name: "Service Operations", icon: Wrench, desc: "Engine, transmission, axle and brake execution" },
  { stage: 5, name: "Washing & Greasing", icon: Sparkles, desc: "Pressure wash and greasing points lubrication" },
  { stage: 6, name: "Spare Parts DMS", icon: ShoppingCart, desc: "Parts indent and store issue slips" },
  { stage: 7, name: "Technician Allocation", icon: UserCheck, desc: "Mechanic, electrician and washing team allocation" },
  { stage: 8, name: "Quality Check (QC)", icon: ClipboardCheck, desc: "Torque checks, leakage tests & test drive sign-off" },
  { stage: 9, name: "Billing & GST", icon: Receipt, desc: "Labor, parts, GST calculation & warranty claim" },
  { stage: 10, name: "Vehicle Delivery", icon: ShieldCheck, desc: "Explain work, set next due, sign & feedback" }
]

export default function ServicesPage() {
  const [jobCards, setJobCards] = useState<any[]>([])
  const [partsCatalog, setPartsCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [activeStageTab, setActiveStageTab] = useState<number>(1)
  const [shareModalCard, setShareModalCard] = useState<any | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [syncingSap, setSyncingSap] = useState(false)
  const [sapError, setSapError] = useState<string | null>(null)

  // New JC Form State
  const [newJC, setNewJC] = useState({
    customerName: '',
    vehicleModel: 'Ashok Leyland Bada Dost i4 LS',
    vehicleNumber: '',
    chassisNumber: '',
    odometerReading: '',
    driverComplaints: '',
    warrantyStatus: 'Under Warranty',
    amcStatus: 'No AMC',
    serviceInterval: '10,000 km',
    serviceCategory: 'Free Service'
  })

  // Part selector state for Stage 6
  const [selectedPartId, setSelectedPartId] = useState('')
  const [partQty, setPartQty] = useState(1)

  // Load Initial Data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const cardsData = await fetchApi('/api/v1/workshop')
      const partsData = await fetchApi('/api/v1/workshop/parts')
      setJobCards(Array.isArray(cardsData) ? cardsData : [])
      setPartsCatalog(Array.isArray(partsData) ? partsData : [])
    } catch (error) {
      console.error("Failed to load workshop data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle New Job Card Submission
  const handleCreateJC = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetchApi('/api/v1/workshop', {
        method: 'POST',
        body: JSON.stringify({
          ...newJC,
          odometerReading: parseInt(newJC.odometerReading || '0')
        })
      })
      setIsNewModalOpen(false)
      setNewJC({
        customerName: '',
        vehicleModel: 'Ashok Leyland Bada Dost i4 LS',
        vehicleNumber: '',
        chassisNumber: '',
        odometerReading: '',
        driverComplaints: '',
        warrantyStatus: 'Under Warranty',
        amcStatus: 'No AMC',
        serviceInterval: '10,000 km',
        serviceCategory: 'Free Service'
      })
      fetchData()
      alert(`Job Card ${res.id} created successfully at Reception!`)
    } catch (error) {
      alert("Failed to create Job Card. Please check connection.")
    }
  }

  // Handle updates to the selected Job Card
  const saveCardUpdates = async (updated: any) => {
    try {
      const res = await fetchApi('/api/v1/workshop', {
        method: 'PUT',
        body: JSON.stringify(updated)
      })
      // Update local state
      setJobCards(prev => prev.map(c => c.id === res.id ? res : c))
      setSelectedCard(res)
    } catch (error) {
      alert("Failed to sync stage progress. Retrying...")
    }
  }

  const handleSyncSap = async () => {
    if (!selectedCard) return
    setSyncingSap(true)
    setSapError(null)
    try {
      const res = await fetchApi('/api/v1/sap/sync', {
        method: 'POST',
        body: JSON.stringify({ jobCard: selectedCard })
      })
      if (res.success) {
        const updated = {
          ...selectedCard,
          sapSynced: true,
          sapDocEntry: res.docEntry,
          sapSyncedAt: new Date().toISOString()
        }
        await saveCardUpdates(updated)
      } else {
        setSapError(res.error || 'Failed to sync with SAP')
      }
    } catch (err: any) {
      console.error('SAP Sync Error:', err)
      setSapError(err.message || 'Network error syncing to SAP')
    } finally {
      setSyncingSap(false)
    }
  }

  // Handle issuing parts in Stage 6
  const issuePart = () => {
    if (!selectedCard || !selectedPartId) return
    const part = partsCatalog.find(p => p.id === selectedPartId)
    if (!part) return

    const updatedParts = [...(selectedCard.partsIssued || [])]
    const existingIndex = updatedParts.findIndex(p => p.id === selectedPartId)
    if (existingIndex !== -1) {
      updatedParts[existingIndex].quantity += partQty
    } else {
      updatedParts.push({
        id: part.id,
        name: part.name,
        quantity: partQty,
        price: part.price
      })
    }

    // Auto update billing calculations
    const partsTotal = updatedParts.reduce((acc, p) => acc + (p.price * p.quantity), 0)
    const laborTotal = selectedCard.technicians?.laborCost || 0
    const gstAmount = (partsTotal + laborTotal) * 0.18
    const totalAmount = partsTotal + laborTotal + gstAmount

    const updatedCard = {
      ...selectedCard,
      partsIssued: updatedParts,
      billing: {
        ...selectedCard.billing,
        partsTotal,
        gstAmount,
        totalAmount
      }
    }
    saveCardUpdates(updatedCard)
    setSelectedPartId('')
    setPartQty(1)
  }

  // Remove issued part
  const removeIssuedPart = (partId: string) => {
    if (!selectedCard) return
    const updatedParts = selectedCard.partsIssued.filter((p: any) => p.id !== partId)
    const partsTotal = updatedParts.reduce((acc: number, p: any) => acc + (p.price * p.quantity), 0)
    const laborTotal = selectedCard.technicians?.laborCost || 0
    const gstAmount = (partsTotal + laborTotal) * 0.18
    const totalAmount = partsTotal + laborTotal + gstAmount

    const updatedCard = {
      ...selectedCard,
      partsIssued: updatedParts,
      billing: {
        ...selectedCard.billing,
        partsTotal,
        gstAmount,
        totalAmount
      }
    }
    saveCardUpdates(updatedCard)
  }

  // Update checkbox nested fields dynamically
  const toggleCheckbox = (category: string, field: string) => {
    if (!selectedCard) return
    const updatedCard = {
      ...selectedCard,
      [category]: {
        ...selectedCard[category],
        [field]: !selectedCard[category][field]
      }
    }
    saveCardUpdates(updatedCard)
  }

  // Advance to next stage in lifecycle
  const advanceStage = () => {
    if (!selectedCard || selectedCard.stage >= 10) return
    const next = selectedCard.stage + 1
    const updatedCard = {
      ...selectedCard,
      stage: next,
      status: next === 10 ? 'delivered' : next >= 8 ? 'qc' : 'in-progress'
    }
    saveCardUpdates(updatedCard)
    setActiveStageTab(next)
  }

  // Workshop Key Metrics Calculation
  const getMetrics = () => {
    const total = jobCards.length
    const active = jobCards.filter(c => c.stage < 10).length
    const delivered = jobCards.filter(c => c.stage === 10).length
    const tat = "4.2 Hrs" // Simulated Turnaround Time
    const ftf = "96.4%" // First Time Fix Rate
    const bayUtil = "88.2%" // Workshop Bay Utilization
    const csi = "4.8 / 5" // Customer Satisfaction Index

    return { total, active, delivered, tat, ftf, bayUtil, csi }
  }

  const metrics = getMetrics()

  // Filter list
  const filteredCards = jobCards.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleModel?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Vehicle Services & Workshop DMS</h1>
          <p className="text-sm text-gray-500 mt-1">End-to-end dealer maintenance process flow. Rebranded under the official Movish Group visual identity.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Reg No, Customer, Chassis..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#084D8C] outline-none w-full md:w-80 shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#084D8C] text-white rounded-xl text-sm font-bold hover:bg-[#053A6E] active:scale-95 transition-all shadow-lg shadow-[#084D8C]/20 shrink-0"
          >
            <Plus size={18} />
            Add Arrival Card
          </button>
        </div>
      </div>

      {/* KPI Performance Section */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
        <KPIItem label="Active Job Cards" value={metrics.active} icon={Clock} color="blue" />
        <KPIItem label="Avg Turnaround (TAT)" value={metrics.tat} icon={FileText} color="indigo" />
        <KPIItem label="First Time Fix" value={metrics.ftf} icon={CheckSquare} color="green" />
        <KPIItem label="Bay Utilization" value={metrics.bayUtil} icon={Wrench} color="orange" />
        <KPIItem label="Satisfaction Index (CSI)" value={metrics.csi} icon={Sparkles} color="red" />
        <KPIItem label="Delivered Fleet" value={metrics.delivered} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Kanban Workshop Status Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <KanbanColumn 
          title="Reception & JC" 
          stageCode={[1]} 
          cards={filteredCards} 
          onSelect={(c) => { setSelectedCard(c); setActiveStageTab(c.stage); }} 
        />
        <KanbanColumn 
          title="Inspection & Estimate" 
          stageCode={[2, 3]} 
          cards={filteredCards} 
          onSelect={(c) => { setSelectedCard(c); setActiveStageTab(c.stage); }} 
        />
        <KanbanColumn 
          title="In Mechanical Bay" 
          stageCode={[4, 5, 6, 7]} 
          cards={filteredCards} 
          onSelect={(c) => { setSelectedCard(c); setActiveStageTab(c.stage); }} 
        />
        <KanbanColumn 
          title="QC & Test Drive" 
          stageCode={[8]} 
          cards={filteredCards} 
          onSelect={(c) => { setSelectedCard(c); setActiveStageTab(c.stage); }} 
        />
        <KanbanColumn 
          title="Invoice & Delivery" 
          stageCode={[9, 10]} 
          cards={filteredCards} 
          onSelect={(c) => { setSelectedCard(c); setActiveStageTab(c.stage); }} 
        />
      </div>

      {/* New JC Opening Dialog Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Stage 1: Vehicle Arrival & Gate Pass</h3>
                <p className="text-xs text-gray-500">Record customer details, odometer values, and driver complaints.</p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateJC} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Customer / Fleet Name</label>
                  <input required type="text" value={newJC.customerName} onChange={e => setNewJC({...newJC, customerName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]" placeholder="e.g. Maruti Roadlines" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Vehicle Registration Number</label>
                  <input required type="text" value={newJC.vehicleNumber} onChange={e => setNewJC({...newJC, vehicleNumber: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]" placeholder="e.g. GJ-01-XX-9999" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Vehicle Model Select</label>
                  <select value={newJC.vehicleModel} onChange={e => setNewJC({...newJC, vehicleModel: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]">
                    <option>Ashok Leyland Bada Dost i4 LS</option>
                    <option>Ashok Leyland Dost LiTE</option>
                    <option>Ashok Leyland AVTR 2820 Tipper</option>
                    <option>Ashok Leyland Partner Super (14ft)</option>
                    <option>Ashok Leyland Ecomet Star 1615</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Chassis / Frame Serial Number</label>
                  <input type="text" value={newJC.chassisNumber} onChange={e => setNewJC({...newJC, chassisNumber: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]" placeholder="Optional (Will be auto-generated if empty)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Odometer Mileage Reading (km)</label>
                  <input required type="number" value={newJC.odometerReading} onChange={e => setNewJC({...newJC, odometerReading: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]" placeholder="Current mileage" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Warranty Status</label>
                  <select value={newJC.warrantyStatus} onChange={e => setNewJC({...newJC, warrantyStatus: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]">
                    <option>Under Warranty</option>
                    <option>Out of Warranty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">AMC / Fleet Contract Status</label>
                  <select value={newJC.amcStatus} onChange={e => setNewJC({...newJC, amcStatus: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]">
                    <option>No AMC</option>
                    <option>AMC Covered</option>
                    <option>Corporate Fleet Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Primary Repair/Service Category</label>
                  <select value={newJC.serviceCategory} onChange={e => setNewJC({...newJC, serviceCategory: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]">
                    <option>Free Service</option>
                    <option>Paid Service</option>
                    <option>Minor Service</option>
                    <option>Major Service</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Driver Complaints & Notes</label>
                <textarea rows={3} value={newJC.driverComplaints} onChange={e => setNewJC({...newJC, driverComplaints: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C]" placeholder="e.g. Engine pickup is low, brakes are hard, routine servicing due..." />
              </div>
              <div className="flex items-center gap-3 pt-3">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-center">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#084D8C] text-white hover:bg-[#053A6E] font-bold rounded-xl shadow-lg">
                  Generate Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master 10-Stage Slide sheet Detail Drawer Panel */}
      {selectedCard && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white h-screen flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold bg-[#084D8C]/10 text-[#084D8C] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Active Job Card
                </span>
                <h3 className="font-extrabold text-gray-900 text-lg mt-0.5">{selectedCard.vehicleNumber} — {selectedCard.vehicleModel}</h3>
                <p className="text-xs text-gray-500 font-medium">Customer: <strong className="text-gray-700">{selectedCard.customerName}</strong> | ID: #{selectedCard.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShareModalCard(selectedCard)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#084D8C] hover:bg-[#084D8C]/90 text-white text-xs font-bold rounded-xl shadow-md shadow-[#084D8C]/20 transition-all"
                >
                  <Share2 size={14} /> Share with Client
                </button>
                <button onClick={() => setSelectedCard(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Stage Selector Stepper Slider Tabs */}
            <div className="bg-gray-50/50 border-b border-gray-100 px-4 py-3 overflow-x-auto custom-scrollbar flex items-center gap-2 shrink-0">
              {LIFE_STAGES.map((s) => {
                const isCurrent = selectedCard.stage === s.stage
                const isPast = selectedCard.stage > s.stage
                const isSelected = activeStageTab === s.stage
                const Icon = s.icon

                return (
                  <button
                    key={s.stage}
                    onClick={() => setActiveStageTab(s.stage)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                      isSelected 
                        ? 'bg-[#084D8C] text-white border-[#084D8C] shadow-md shadow-[#084D8C]/20' 
                        : isCurrent
                        ? 'bg-blue-50/80 text-[#084D8C] border-[#084D8C]/30 animate-pulse'
                        : isPast
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {s.stage}. {s.name.split(" ")[0]}
                    {isPast && <Check size={12} className="stroke-[3px]" />}
                  </button>
                )
              })}
            </div>

            {/* Dynamic Content Body based on Active Tab */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-start mb-2">
                <div className="p-3 bg-[#084D8C]/10 text-[#084D8C] rounded-xl shrink-0">
                  {React.createElement(LIFE_STAGES[activeStageTab - 1].icon, { size: 24 })}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">Stage {activeStageTab}: {LIFE_STAGES[activeStageTab - 1].name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{LIFE_STAGES[activeStageTab - 1].desc}</p>
                </div>
              </div>

              {/* SPECIAL INSPECTION MEDIA SECTION FOR GJ15AX3940 */}
              {selectedCard.vehicleNumber === "GJ15AX3940" && (
                <div className="bg-blue-50/40 border border-blue-100 rounded-3xl p-6 space-y-4 mb-4">
                  <div className="flex items-center gap-2 text-[#084D8C]">
                    <Activity size={20} className="animate-pulse" />
                    <h5 className="font-extrabold text-sm uppercase tracking-wider">Sanand Municipal Inspection Report</h5>
                  </div>
                  
                  {/* Photo Grid */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Images</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {[...Array(13)].map((_, i) => (
                        <div key={i} className="w-40 h-28 shrink-0 rounded-xl overflow-hidden border border-gray-200 relative group cursor-pointer hover:border-[#084D8C] transition-all">
                          <img 
                            src={`/extracted_ppt/ppt/media/image${i+1}.jpeg`} 
                            alt={`Slide Photo ${i+1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            onClick={() => window.open(`/extracted_ppt/ppt/media/image${i+1}.jpeg`, '_blank')}
                          />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Slide {i+1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Playback */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Final Quality Inspection Video</p>
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-black aspect-video max-w-lg">
                      <video 
                        controls 
                        className="w-full h-full object-contain"
                        poster="/extracted_ppt/ppt/media/image1.jpeg"
                      >
                        <source src="/Inspection final.mp4" type="video/mp4" />
                        <source src="/Inspection final.MOV" type="video/quicktime" />
                        Your browser does not support playing this video file.
                      </video>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 1 FORM VIEW */}
              {activeStageTab === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Registration No" value={selectedCard.vehicleNumber} />
                    <DetailRow label="Chassis Number" value={selectedCard.chassisNumber} />
                    <DetailRow label="Odometer Reading" value={`${selectedCard.odometerReading.toLocaleString()} km`} />
                    <DetailRow label="Warranty Status" value={selectedCard.warrantyStatus} />
                    <DetailRow label="AMC Status" value={selectedCard.amcStatus} />
                    <DetailRow label="Time of Entry" value={new Date(selectedCard.createdAt).toLocaleString()} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Driver complaints</label>
                    <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm italic text-gray-700">{selectedCard.driverComplaints || "None recorded."}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">Gate & Workshop Documents Generated</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <DocCheckmark label="Gate Entry Pass" active={selectedCard.documents.gateEntryCreated} 
                        onToggle={() => toggleCheckbox('documents', 'gateEntryCreated')} />
                      <DocCheckmark label="Job Card (JC)" active={selectedCard.documents.jobCardCreated} 
                        onToggle={() => toggleCheckbox('documents', 'jobCardCreated')} />
                      <DocCheckmark label="Estimate Approval Form" active={selectedCard.documents.estimateApproved} 
                        onToggle={() => toggleCheckbox('documents', 'estimateApproved')} />
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2 FORM VIEW */}
              {activeStageTab === 2 && (
                <div className="space-y-6">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Part A: General Inspection Point Checks</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Engine Oil & Oil Condition" active={selectedCard.generalInspection.engineCondition}
                        onToggle={() => toggleCheckbox('generalInspection', 'engineCondition')} />
                      <ToggleCheckItem label="Oil/Fuel Leakage Check" active={selectedCard.generalInspection.oilLeakage}
                        onToggle={() => toggleCheckbox('generalInspection', 'oilLeakage')} />
                      <ToggleCheckItem label="Radiator Coolant Level" active={selectedCard.generalInspection.coolantLevel}
                        onToggle={() => toggleCheckbox('generalInspection', 'coolantLevel')} />
                      <ToggleCheckItem label="Battery Voltage & Terminal Corrosion" active={selectedCard.generalInspection.batteryCondition}
                        onToggle={() => toggleCheckbox('generalInspection', 'batteryCondition')} />
                      <ToggleCheckItem label="Tyre Tread Wear Pattern" active={selectedCard.generalInspection.tyreWear}
                        onToggle={() => toggleCheckbox('generalInspection', 'tyreWear')} />
                      <ToggleCheckItem label="Brake Linings & Air Valve Condition" active={selectedCard.generalInspection.brakeCondition}
                        onToggle={() => toggleCheckbox('generalInspection', 'brakeCondition')} />
                      <ToggleCheckItem label="Leaf Springs & Suspension Checks" active={selectedCard.generalInspection.suspensionCheck}
                        onToggle={() => toggleCheckbox('generalInspection', 'suspensionCheck')} />
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#D8232A] uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Part B: Driver Complaints Diagnosis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Low Pickup / Weak Engine Acceleration" active={selectedCard.driverComplaintsDiagnosis.lowPickup}
                        onToggle={() => toggleCheckbox('driverComplaintsDiagnosis', 'lowPickup')} />
                      <ToggleCheckItem label="Excess Exhaust Smoke (Black/Grey)" active={selectedCard.driverComplaintsDiagnosis.excessSmoke}
                        onToggle={() => toggleCheckbox('driverComplaintsDiagnosis', 'excessSmoke')} />
                      <ToggleCheckItem label="Hard Brake Pedal / Poor Braking" active={selectedCard.driverComplaintsDiagnosis.brakeHard}
                        onToggle={() => toggleCheckbox('driverComplaintsDiagnosis', 'brakeHard')} />
                      <ToggleCheckItem label="Clutch Slipping / Hard Shifting" active={selectedCard.driverComplaintsDiagnosis.clutchSlipping}
                        onToggle={() => toggleCheckbox('driverComplaintsDiagnosis', 'clutchSlipping')} />
                      <ToggleCheckItem label="Steering Wobble & Chassis Vibration" active={selectedCard.driverComplaintsDiagnosis.steeringVibration}
                        onToggle={() => toggleCheckbox('driverComplaintsDiagnosis', 'steeringVibration')} />
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3 FORM VIEW */}
              {activeStageTab === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50/50 border border-[#084D8C]/10 rounded-2xl p-4 text-sm text-[#084D8C] space-y-1">
                    <p className="font-bold">💡 Recommended Periodic Maintenance Schedule (PM)</p>
                    <p className="text-xs">Based on current Odometer Mileage reading of <strong>{selectedCard.odometerReading.toLocaleString()} km</strong>, Ashok Leyland BS6 maintenance guides recommend the nearest schedule below.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Selected Schedule Interval</label>
                      <select 
                        value={selectedCard.serviceSchedule?.interval || '10,000 km'} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            serviceSchedule: { ...selectedCard.serviceSchedule, interval: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      >
                        <option>5,000 km (First Checkup)</option>
                        <option>10,000 km (Free PM)</option>
                        <option>20,000 km (Minor PM)</option>
                        <option>40,000 km (Major PM)</option>
                        <option>80,000 km (Overhaul PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Service Job Classification</label>
                      <select 
                        value={selectedCard.serviceSchedule?.category || 'Free Service'} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            serviceSchedule: { ...selectedCard.serviceSchedule, category: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      >
                        <option>Free Service</option>
                        <option>Paid Service</option>
                        <option>Minor Service</option>
                        <option>Major Service</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 4 FORM VIEW */}
              {activeStageTab === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 mb-2">Tick off the aggregate repair operations as they are physically completed by the technical technicians in the mechanical bays.</p>
                  
                  <div className="space-y-4">
                    <SectionHeader title="Engine & Filters Service" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Engine oil replacement" active={selectedCard.operationsPerformed?.engineOilReplaced} onToggle={() => toggleCheckbox('operationsPerformed', 'engineOilReplaced')} />
                      <ToggleCheckItem label="Oil filter replacement" active={selectedCard.operationsPerformed?.oilFilterReplaced} onToggle={() => toggleCheckbox('operationsPerformed', 'oilFilterReplaced')} />
                      <ToggleCheckItem label="Fuel filter cleaning/replacement" active={selectedCard.operationsPerformed?.fuelFilterServiced} onToggle={() => toggleCheckbox('operationsPerformed', 'fuelFilterServiced')} />
                      <ToggleCheckItem label="Air filter cleaning/replacement" active={selectedCard.operationsPerformed?.airFilterServiced} onToggle={() => toggleCheckbox('operationsPerformed', 'airFilterServiced')} />
                      <ToggleCheckItem label="Drive belt tension check" active={selectedCard.operationsPerformed?.beltTensionChecked} onToggle={() => toggleCheckbox('operationsPerformed', 'beltTensionChecked')} />
                    </div>

                    <SectionHeader title="Transmission & Clutch Driveline" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Gear oil check / level change" active={selectedCard.operationsPerformed?.gearOilChecked} onToggle={() => toggleCheckbox('operationsPerformed', 'gearOilChecked')} />
                      <ToggleCheckItem label="Clutch pedal adjustment (3-6mm play)" active={selectedCard.operationsPerformed?.clutchAdjusted} onToggle={() => toggleCheckbox('operationsPerformed', 'clutchAdjusted')} />
                    </div>

                    <SectionHeader title="Braking Systems (Heavy Duty)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Brake lining inspection" active={selectedCard.operationsPerformed?.brakeLiningInspected} onToggle={() => toggleCheckbox('operationsPerformed', 'brakeLiningInspected')} />
                      <ToggleCheckItem label="Pneumatic air pressure leakage test" active={selectedCard.operationsPerformed?.airLeakageTested} onToggle={() => toggleCheckbox('operationsPerformed', 'airLeakageTested')} />
                      <ToggleCheckItem label="Brake chamber inspection" active={selectedCard.operationsPerformed?.brakeChamberInspected} onToggle={() => toggleCheckbox('operationsPerformed', 'brakeChamberInspected')} />
                    </div>

                    <SectionHeader title="Electrical & Electronics" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Battery voltage load test" active={selectedCard.operationsPerformed?.batteryVoltageTested} onToggle={() => toggleCheckbox('operationsPerformed', 'batteryVoltageTested')} />
                      <ToggleCheckItem label="Alternator output check" active={selectedCard.operationsPerformed?.alternatorChecked} onToggle={() => toggleCheckbox('operationsPerformed', 'alternatorChecked')} />
                      <ToggleCheckItem label="Lighting & signal lamps check" active={selectedCard.operationsPerformed?.lightingInspected} onToggle={() => toggleCheckbox('operationsPerformed', 'lightingInspected')} />
                    </div>

                    <SectionHeader title="Suspension & Chassis Aggregates" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="U-bolt tightening" active={selectedCard.operationsPerformed?.uBoltTightened} onToggle={() => toggleCheckbox('operationsPerformed', 'uBoltTightened')} />
                      <ToggleCheckItem label="Leaf spring inspection" active={selectedCard.operationsPerformed?.leafSpringInspected} onToggle={() => toggleCheckbox('operationsPerformed', 'leafSpringInspected')} />
                    </div>

                    <SectionHeader title="Cooling Systems" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ToggleCheckItem label="Radiator outer core cleaning" active={selectedCard.operationsPerformed?.radiatorCleaned} onToggle={() => toggleCheckbox('operationsPerformed', 'radiatorCleaned')} />
                      <ToggleCheckItem label="Coolant top-up" active={selectedCard.operationsPerformed?.coolantToppedUp} onToggle={() => toggleCheckbox('operationsPerformed', 'coolantToppedUp')} />
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 5 FORM VIEW */}
              {activeStageTab === 5 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 mb-2">Pressure wash clean-down, chassis point lubrication greasing, propeller shaft greasing and kingpin checks are crucial parts of regular vehicle service.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ToggleCheckItem label="Under-body Pressure Wash & Dry" active={selectedCard.washingGreasing?.pressureWash} onToggle={() => toggleCheckbox('washingGreasing', 'pressureWash')} />
                    <ToggleCheckItem label="Chassis Point Greasing & Lube" active={selectedCard.washingGreasing?.chassisGreasing} onToggle={() => toggleCheckbox('washingGreasing', 'chassisGreasing')} />
                    <ToggleCheckItem label="Propeller Shaft Universal Joint Greasing" active={selectedCard.washingGreasing?.propellerShaftGreasing} onToggle={() => toggleCheckbox('washingGreasing', 'propellerShaftGreasing')} />
                    <ToggleCheckItem label="Kingpin Lubrication check" active={selectedCard.washingGreasing?.kingpinLubrication} onToggle={() => toggleCheckbox('washingGreasing', 'kingpinLubrication')} />
                  </div>
                </div>
              )}

              {/* STAGE 6 FORM VIEW */}
              {activeStageTab === 6 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 border border-gray-200 rounded-2xl">
                    <h5 className="text-xs font-bold text-gray-900 uppercase mb-3">Issue Workshop Spare Parts</h5>
                    <div className="flex gap-3">
                      <select
                        value={selectedPartId}
                        onChange={e => setSelectedPartId(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] text-sm"
                      >
                        <option value="">-- Select Consumable / Spare --</option>
                        {partsCatalog.map(p => (
                          <option key={p.id} value={p.id}>{p.name} — ₹{p.price} / {p.unit}</option>
                        ))}
                      </select>
                      <input 
                        type="number"
                        min="1"
                        value={partQty}
                        onChange={e => setPartQty(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 bg-white border border-gray-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-[#084D8C] text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={issuePart}
                        className="px-5 bg-[#084D8C] text-white rounded-xl font-bold hover:bg-[#053A6E] text-sm shadow-md"
                      >
                        Issue Parts
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-100 pb-2 mb-3">Parts Indented & Issued to Bay</h5>
                    {(!selectedCard.partsIssued || selectedCard.partsIssued.length === 0) ? (
                      <p className="text-center py-6 text-gray-400 text-sm italic">No spare parts issued yet for this Job Card.</p>
                    ) : (
                      <div className="overflow-hidden border border-gray-100 rounded-2xl bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs">Part Name</th>
                              <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs">Quantity</th>
                              <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs">Unit Rate</th>
                              <th className="px-4 py-3 font-bold text-gray-500 uppercase text-xs text-right">Total Price</th>
                              <th className="px-4 py-3 text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedCard.partsIssued.map((p: any) => (
                              <tr key={p.id}>
                                <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                                <td className="px-4 py-3 font-medium text-gray-700">{p.quantity}</td>
                                <td className="px-4 py-3 text-gray-600">₹{p.price.toLocaleString()}</td>
                                <td className="px-4 py-3 text-gray-900 font-bold text-right">₹{(p.price * p.quantity).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={() => removeIssuedPart(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                    <X size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50/50">
                              <td colSpan={3} className="px-4 py-3 font-bold text-gray-800 text-right">Parts Subtotal:</td>
                              <td className="px-4 py-3 font-extrabold text-[#084D8C] text-right">₹{selectedCard.billing.partsTotal.toLocaleString()}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 7 FORM VIEW */}
              {activeStageTab === 7 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Lead Mechanical Engineer</label>
                      <select 
                        value={selectedCard.technicians?.mechanic || ''} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            technicians: { ...selectedCard.technicians, mechanic: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      >
                        <option value="">-- Assign Mechanic --</option>
                        <option>Suresh Kumar</option>
                        <option>Kiran Rawal</option>
                        <option>Amit Patel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Electrical Specialist</label>
                      <select 
                        value={selectedCard.technicians?.electrician || ''} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            technicians: { ...selectedCard.technicians, electrician: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      >
                        <option value="">-- Assign Electrician --</option>
                        <option>Manoj Dev</option>
                        <option>Girish Mehta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Washing & Greasing Team</label>
                      <select 
                        value={selectedCard.technicians?.washingCrew || ''} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            technicians: { ...selectedCard.technicians, washingCrew: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      >
                        <option value="">-- Assign Cleaning Crew --</option>
                        <option>Washing Team A</option>
                        <option>Washing Team B</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Final QC Road Test Driver</label>
                      <select 
                        value={selectedCard.technicians?.roadTestDriver || ''} 
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            technicians: { ...selectedCard.technicians, roadTestDriver: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      >
                        <option value="">-- Assign Road Tester --</option>
                        <option>Vikram Singh</option>
                        <option>Amit Patel</option>
                        <option>Rajesh Sharma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Tracked Labor Work Time (Hours)</label>
                      <input 
                        type="number"
                        step="0.5"
                        value={selectedCard.technicians?.laborHours || 0}
                        onChange={(e) => {
                          const hours = parseFloat(e.target.value) || 0
                          const ratePerHour = 400 // Standard service labor hourly billing rate
                          const laborCost = hours * ratePerHour
                          
                          // Recalculate bill
                          const partsTotal = selectedCard.billing.partsTotal || 0
                          const gstAmount = (partsTotal + laborCost) * 0.18
                          const totalAmount = partsTotal + laborCost + gstAmount

                          const updated = {
                            ...selectedCard,
                            technicians: { ...selectedCard.technicians, laborHours: hours, laborCost },
                            billing: {
                              ...selectedCard.billing,
                              laborTotal: laborCost,
                              gstAmount,
                              totalAmount
                            }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] font-semibold text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Calculated Labor Cost</label>
                      <p className="px-4 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-800 text-sm">₹{(selectedCard.technicians?.laborCost || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 8 FORM VIEW */}
              {activeStageTab === 8 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 mb-2">Vehicles require strict Pre-Delivery Inspection (PDI) sign-off by the Quality Control team before billing.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ToggleCheckItem label="Aggregate Torque Tightness Check" active={selectedCard.qualityCheck?.torqueChecks} onToggle={() => toggleCheckbox('qualityCheck', 'torqueChecks')} />
                    <ToggleCheckItem label="Fluid Level / Oil Leakage Check" active={selectedCard.qualityCheck?.leakageInspection} onToggle={() => toggleCheckbox('qualityCheck', 'leakageInspection')} />
                    <ToggleCheckItem label="QC Test Drive Signoff" active={selectedCard.qualityCheck?.testDrive} onToggle={() => toggleCheckbox('qualityCheck', 'testDrive')} />
                    <ToggleCheckItem label="Pneumatic Brake Efficiency Test" active={selectedCard.qualityCheck?.brakeTest} onToggle={() => toggleCheckbox('qualityCheck', 'brakeTest')} />
                    <ToggleCheckItem label="BS6 Smoke Emission Level check" active={selectedCard.qualityCheck?.smokeCheck} onToggle={() => toggleCheckbox('qualityCheck', 'smokeCheck')} />
                  </div>

                  <div className="pt-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Signing Quality Control (QC) Engineer</label>
                    <input 
                      type="text"
                      value={selectedCard.qualityCheck?.signedOffBy || ''}
                      onChange={(e) => {
                        const updated = {
                          ...selectedCard,
                          qualityCheck: { ...selectedCard.qualityCheck, signedOffBy: e.target.value }
                        }
                        saveCardUpdates(updated)
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] text-sm font-semibold"
                      placeholder="Enter QC Inspector Name..."
                    />
                  </div>
                </div>
              )}

              {/* STAGE 9 FORM VIEW */}
              {activeStageTab === 9 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 p-4 border border-gray-200 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-gray-900 uppercase">Warranty Claim Job</p>
                      <p className="text-xs text-gray-400">Under warranty replacements waive customer cost.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const isWarranty = !selectedCard.billing.isWarrantyClaim
                        const total = isWarranty ? 0 : (selectedCard.billing.partsTotal + selectedCard.billing.laborTotal) * 1.18
                        const updated = {
                          ...selectedCard,
                          billing: {
                            ...selectedCard.billing,
                            isWarrantyClaim: isWarranty,
                            totalAmount: total
                          }
                        }
                        saveCardUpdates(updated)
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        selectedCard.billing.isWarrantyClaim ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        selectedCard.billing.isWarrantyClaim ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-3xl p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="font-extrabold text-gray-900">TAX INVOICE BREAKDOWN</span>
                      <span className="text-xs font-bold text-gray-400">Movish Auto Pvt Ltd</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Workshop Spare Parts & Lubricants:</span>
                        <span className="font-semibold text-gray-900">₹{(selectedCard.billing.partsTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Technician Mechanics Labor Charges:</span>
                        <span className="font-semibold text-gray-900">₹{(selectedCard.billing.laborTotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">GST (18% SGST + CGST):</span>
                        <span className="font-semibold text-gray-900">₹{selectedCard.billing.isWarrantyClaim ? "₹0 (Warranty)" : `₹${(selectedCard.billing.gstAmount || 0).toLocaleString()}`}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <span className="font-extrabold text-gray-900">NET GRAND TOTAL DUED:</span>
                      <span className="text-xl font-black text-[#084D8C]">
                        {selectedCard.billing.isWarrantyClaim ? "₹0 (Warranty Claimed)" : `₹${(selectedCard.billing.totalAmount || 0).toLocaleString()}`}
                      </span>
                    </div>

                    {selectedCard.vehicleNumber === "GJ01LT4513" && (
                      <div className="pt-4 border-t border-gray-100">
                        <a 
                          href="/GJ01LT4513.pdf" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition-all"
                        >
                          <FileText size={16} /> View Original PDF Invoice
                        </a>
                      </div>
                    )}

                    {/* SAP Service Layer Integration Controls */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-400 uppercase tracking-wider">SAP ERP Connection</span>
                        {selectedCard.sapSynced ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <CheckCircle2 size={12} /> Synced to SAP
                          </span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                            Not Synced
                          </span>
                        )}
                      </div>

                      {selectedCard.sapSynced ? (
                        <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">SAP Draft DocEntry:</span>
                            <span className="font-bold text-gray-900">{selectedCard.sapDocEntry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Sync Timestamp:</span>
                            <span className="font-semibold text-gray-750">
                              {new Date(selectedCard.sapSyncedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={syncingSap}
                          onClick={handleSyncSap}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-[#084D8C] hover:bg-[#063968] disabled:bg-gray-300 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all text-sm"
                        >
                          {syncingSap ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Syncing with SAP ERP...
                            </>
                          ) : (
                            <>
                              <QrCode size={16} /> Sync Invoice to SAP ERP
                            </>
                          )}
                        </button>
                      )}

                      {sapError && (
                        <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 animate-in fade-in duration-300">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{sapError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 10 FORM VIEW */}
              {activeStageTab === 10 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Next Recommended Service Mileage (Odo km)</label>
                      <input 
                        type="number"
                        value={selectedCard.delivery?.nextServiceDueOdo || 0}
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            delivery: { ...selectedCard.delivery, nextServiceDueOdo: parseInt(e.target.value) || 0 }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Customer Digital Signature Signoff</label>
                      <input 
                        type="text"
                        value={selectedCard.delivery?.customerSignature || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            delivery: { ...selectedCard.delivery, customerSignature: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] text-sm font-semibold"
                        placeholder="Enter Driver / Fleet Owner Name..."
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 border border-gray-200 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold text-gray-900 uppercase">Customer Satisfaction Feedback (CSI Rating)</h5>
                    <div className="flex gap-2 justify-center py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...selectedCard,
                              delivery: { ...selectedCard.delivery, feedbackRating: star }
                            }
                            saveCardUpdates(updated)
                          }}
                          className={`text-2xl transition-all ${
                            selectedCard.delivery?.feedbackRating >= star ? 'text-amber-500 scale-110' : 'text-gray-300 hover:text-amber-400'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Customer Remarks & Feedback comments</label>
                      <textarea
                        rows={2}
                        value={selectedCard.delivery?.feedbackComments || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedCard,
                            delivery: { ...selectedCard.delivery, feedbackComments: e.target.value }
                          }
                          saveCardUpdates(updated)
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#084D8C] text-xs"
                        placeholder="Write customer feedback note..."
                      />
                    </div>
                  </div>

                  <DocCheckmark label="Work Done fully explained to customer" active={selectedCard.delivery?.workExplained}
                    onToggle={() => {
                      const updated = {
                        ...selectedCard,
                        delivery: { ...selectedCard.delivery, workExplained: !selectedCard.delivery.workExplained }
                      }
                      saveCardUpdates(updated)
                    }} 
                  />

                  {selectedCard.vehicleNumber === "GJ01LT4513" && (
                    <div className="pt-4 border-t border-gray-100">
                      <a 
                        href="/GJ01LT4513.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl transition-all"
                      >
                        <FileText size={16} /> View Original PDF Invoice
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-500">
                Current Phase: <strong className="text-[#084D8C] uppercase">Stage {selectedCard.stage} of 10</strong>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 font-bold text-sm text-gray-600 rounded-xl"
                >
                  Close Drawer
                </button>
                {selectedCard.stage < 10 && (
                  <button
                    onClick={advanceStage}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-[#084D8C] hover:bg-[#053A6E] text-white font-extrabold text-sm rounded-xl shadow-lg"
                  >
                    Advance to Stage {selectedCard.stage + 1}
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function KPIItem({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-[#084D8C]',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-[#D8232A]',
    emerald: 'bg-emerald-50 text-emerald-600'
  }
  return (
    <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs flex items-center gap-3">
      <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{label}</p>
        <h3 className="text-base font-extrabold text-gray-900 leading-none">{value}</h3>
      </div>
    </div>
  )
}

function KanbanColumn({ title, stageCode, cards, onSelect }: { title: string, stageCode: number[], cards: any[], onSelect: (c: any) => void }) {
  const columnCards = cards.filter(c => stageCode.includes(c.stage))

  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col h-[70vh] min-w-[200px]">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h4 className="font-extrabold text-sm text-gray-900 tracking-tight">{title}</h4>
        <span className="text-[10px] font-extrabold bg-[#084D8C]/10 text-[#084D8C] px-2 py-0.5 rounded-lg">
          {columnCards.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-0.5">
        {columnCards.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider text-center">Empty Bay</p>
          </div>
        ) : (
          columnCards.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              className="bg-white p-3.5 border border-gray-200 hover:border-[#084D8C] hover:shadow-lg rounded-2xl cursor-pointer transition-all active:scale-95 group relative overflow-hidden"
            >
              {/* Stage accent pill top-right */}
              <div className="absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                Stg {c.stage}
              </div>

              <span className="text-[9px] font-bold text-gray-400">{c.vehicleModel.split(" ")[2]} / {c.id.slice(-4)}</span>
              <h5 className="font-black text-gray-900 text-sm mt-0.5 group-hover:text-[#084D8C]">{c.vehicleNumber}</h5>
              <p className="text-[11px] font-bold text-gray-600 truncate mt-1">{c.customerName}</p>

              {/* Progress Indicator */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3.5 flex">
                <div 
                  className={`h-full ${c.stage === 10 ? 'bg-green-500' : 'bg-[#084D8C] animate-pulse'}`}
                  style={{ width: `${(c.stage / 10) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-2xs">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 leading-none">{value}</p>
    </div>
  )
}

function DocCheckmark({ label, active, onToggle }: { label: string, active: boolean, onToggle?: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-3.5 border rounded-2xl text-left transition-all ${
        active 
          ? 'bg-green-50/50 border-green-200 text-green-700 font-extrabold shadow-sm' 
          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-400 font-semibold'
      }`}
    >
      <span className="text-xs">{label}</span>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
        active ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200'
      }`}>
        {active && <Check size={12} className="stroke-[3px]" />}
      </div>
    </button>
  )
}

function ToggleCheckItem({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-3 border rounded-xl text-left transition-all hover:bg-gray-50/80 active:scale-98 ${
        active ? 'border-green-200 text-green-800 font-bold bg-green-50/20' : 'border-gray-200 text-gray-600 font-medium bg-white'
      }`}
    >
      <span className="text-xs select-none">{label}</span>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
        active ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 bg-white'
      }`}>
        {active && <Check size={12} className="stroke-[3px]" />}
      </div>
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2 shrink-0">
      <span className="w-1.5 h-3 bg-[#084D8C] rounded-full shrink-0" />
      <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{title}</h6>
    </div>
  )
}
