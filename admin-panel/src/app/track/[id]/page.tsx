"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  FileText, Clock, CheckCircle2, AlertCircle, Search, Wrench, 
  Sparkles, ShoppingCart, UserCheck, ClipboardCheck, Receipt, 
  ShieldCheck, ArrowLeft, Check, Phone, MapPin, QrCode, ThumbsUp
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

export default function ClientTrackPage() {
  const params = useParams()
  const id = params?.id as string

  const [card, setCard] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeViewTab, setActiveViewTab] = useState<number>(1)
  const [approving, setApproving] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Load Job Card from localStorage Mock Database
  useEffect(() => {
    loadJobCard()
    
    // Auto-reload tracking every 5 seconds to simulate real-time live synchronization!
    const interval = setInterval(loadJobCard, 5000)
    return () => clearInterval(interval)
  }, [id])

  const loadJobCard = () => {
    try {
      const dbRaw = localStorage.getItem('movish_db')
      if (!dbRaw) {
        setError('No database found. Please create a Job Card in the Admin Panel first.')
        setLoading(false)
        return
      }
      
      const db = JSON.parse(dbRaw)
      const jobCards = db.workshopJobCards || []
      const foundCard = jobCards.find((c: any) => c.id === id)
      
      if (!foundCard) {
        setError(`Job Card #${id} not found in the workshop catalog.`)
      } else {
        setCard(foundCard)
        // Set the active viewing tab to their current stage on first load
        if (!card) {
          setActiveViewTab(foundCard.stage)
        }
      }
    } catch (err) {
      setError('Error loading live vehicle tracking data.')
    } finally {
      setLoading(false)
    }
  }

  // Client Estimate Approval Action
  const approveEstimate = () => {
    if (!card) return
    setApproving(true)
    setTimeout(() => {
      try {
        const dbRaw = localStorage.getItem('movish_db')
        if (dbRaw) {
          const db = JSON.parse(dbRaw)
          const index = db.workshopJobCards.findIndex((c: any) => c.id === card.id)
          if (index !== -1) {
            db.workshopJobCards[index].documents.estimateApproved = true
            // Also automatically progress Stage from 3 to 4 as estimate is approved!
            if (db.workshopJobCards[index].stage === 3) {
              db.workshopJobCards[index].stage = 4
              db.workshopJobCards[index].status = 'in-progress'
            }
            localStorage.setItem('movish_db', JSON.stringify(db))
            setCard(db.workshopJobCards[index])
            setActiveViewTab(db.workshopJobCards[index].stage)
          }
        }
        alert('Estimate approved successfully! Workshop team has been notified.')
      } catch (err) {
        alert('Failed to approve estimate. Please try again.')
      } finally {
        setApproving(false)
      }
    }, 800)
  }

  // Submit Feedback Rating in Stage 10
  const submitFeedback = (stars: number) => {
    setRating(stars)
    try {
      const dbRaw = localStorage.getItem('movish_db')
      if (dbRaw) {
        const db = JSON.parse(dbRaw)
        const index = db.workshopJobCards.findIndex((c: any) => c.id === card.id)
        if (index !== -1) {
          db.workshopJobCards[index].delivery = {
            ...db.workshopJobCards[index].delivery,
            feedbackRating: stars
          }
          localStorage.setItem('movish_db', JSON.stringify(db))
          setCard(db.workshopJobCards[index])
        }
      }
      setFeedbackSent(true)
    } catch (err) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#084D8C] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-gray-500">Connecting to Movish Live Workshop DMS...</p>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-[#D8232A] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Tracking Error</h3>
            <p className="text-sm text-gray-500 mt-2">{error || "Vehicle tracking record not found."}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-[#084D8C] hover:bg-[#084D8C]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-[#084D8C]/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentStageInfo = LIFE_STAGES[card.stage - 1]
  const isDelivered = card.stage === 10
  const isEstimatePending = !card.documents.estimateApproved && card.stage <= 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/20 text-gray-800 antialiased pb-12">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Movish Auto Logo" className="h-10 w-auto object-contain" />
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <span className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase hidden sm:block">
            Customer Tracking Portal
          </span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3.5 py-1 text-green-700 text-xs font-black animate-pulse">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          LIVE TRACKING ACTIVE
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Core Overview Card */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-[#084D8C] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest uppercase bg-white/10 text-blue-100 px-3 py-1 rounded-full">
                Ashok Leyland Ahmedabad DMS
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">{card.vehicleNumber}</h1>
              <p className="text-sm font-semibold text-blue-200">{card.vehicleModel} — {card.customerName}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Odometer</span>
                <span className="text-base font-black text-white">{card.odometerReading.toLocaleString()} km</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Warranty</span>
                <span className="text-base font-black text-white">{card.warrantyStatus}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Current Stage</span>
                <span className="text-base font-black text-white">{card.stage}/10</span>
              </div>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#084D8C]/10 text-[#084D8C] rounded-lg">
                <Wrench size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold">CURRENT WORKSHOP STATUS</p>
                <p className="text-sm font-black text-gray-800">{currentStageInfo.name} — {currentStageInfo.desc}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Service Category:</span>
              <span className="text-xs font-black px-2.5 py-1 bg-blue-50 text-[#084D8C] rounded-md border border-[#084D8C]/10">
                {card.serviceCategory || "Scheduled"}
              </span>
            </div>
          </div>
        </section>

        {/* 10-Stage Horizontal Tracker Timeline */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-[#084D8C]" /> Vehicle Service Journey Timeline
          </h2>

          <div className="relative py-4 overflow-x-auto custom-scrollbar">
            {/* Connection Line */}
            <div className="absolute top-[37px] left-8 right-8 h-1 bg-gray-200 -z-10 rounded-full hidden md:block"></div>
            <div 
              className="absolute top-[37px] left-8 h-1 bg-gradient-to-r from-green-500 to-[#084D8C] -z-10 rounded-full transition-all duration-500 hidden md:block"
              style={{ width: `${((card.stage - 1) / 9) * 100}%` }}
            ></div>

            <div className="flex md:justify-between gap-6 md:gap-2 min-w-[900px] px-2">
              {LIFE_STAGES.map((s) => {
                const isCurrent = card.stage === s.stage
                const isPast = card.stage > s.stage
                const isSelected = activeViewTab === s.stage
                const Icon = s.icon

                return (
                  <button
                    key={s.stage}
                    onClick={() => setActiveViewTab(s.stage)}
                    className="flex flex-col items-center text-center space-y-2 group shrink-0 focus:outline-hidden"
                    style={{ width: '9%' }}
                  >
                    {/* Circle Node */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#084D8C] text-white border-[#084D8C] scale-110 shadow-lg shadow-[#084D8C]/20 ring-4 ring-[#084D8C]/15'
                        : isCurrent
                        ? 'bg-blue-50 text-[#084D8C] border-[#084D8C] animate-bounce shadow-md ring-4 ring-blue-500/10'
                        : isPast
                        ? 'bg-green-500 text-white border-green-500 shadow-inner'
                        : 'bg-white text-gray-400 border-gray-200 group-hover:border-gray-400'
                    }`}>
                      {isPast ? <Check size={18} className="stroke-[3px]" /> : <Icon size={16} />}
                    </div>

                    {/* Stage Label */}
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${
                        isCurrent ? 'text-[#084D8C] font-black' : isPast ? 'text-green-600 font-bold' : 'text-gray-400'
                      }`}>
                        Stage {s.stage}
                      </p>
                      <p className={`text-xs font-black truncate max-w-[80px] mx-auto mt-0.5 ${
                        isSelected ? 'text-[#084D8C] font-black underline decoration-2 decoration-[#084D8C]' : 'text-gray-700'
                      }`}>
                        {s.name.split(" ")[0]}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Detail Panel & Interactive Client Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stage details (2 columns) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  {React.createElement(LIFE_STAGES[activeViewTab - 1].icon, { size: 18, className: "text-[#084D8C]" })}
                  Stage {activeViewTab} Details: {LIFE_STAGES[activeViewTab - 1].name}
                </h3>
                {card.stage === activeViewTab ? (
                  <span className="px-3 py-1 bg-blue-50 text-[#084D8C] border border-blue-100 rounded-full text-xs font-black animate-pulse flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> IN BAY EXECUTION
                  </span>
                ) : card.stage > activeViewTab ? (
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-black flex items-center gap-1">
                    <CheckCircle2 size={12} /> COMPLETED
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-xs font-bold">
                    PENDING INBOUND
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Dynamically show fields based on viewed stage */}
                {activeViewTab === 1 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Vehicle Check-In Profile</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Registration Number</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-1">{card.vehicleNumber}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chassis Number</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-1">{card.chassisNumber}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Odometer At Arrival</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-1">{card.odometerReading.toLocaleString()} km</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Warranty Status</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-1">{card.warrantyStatus}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">Driver Complaints Registered</p>
                      <div className="p-4 bg-red-50/50 border border-red-500/10 rounded-2xl text-sm italic text-gray-700">
                        "{card.driverComplaints || "None recorded. Normal preventive maintenance requested."}"
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 2 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Advisor Diagnostic Report</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">General Inspection Status</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <ChecklistStatusItem label="Engine Oil Level & Quality" checked={card.generalInspection?.engineCondition} />
                          <ChecklistStatusItem label="Oil/Coolant Leakage Audit" checked={card.generalInspection?.oilLeakage} />
                          <ChecklistStatusItem label="Coolant & Fluid Reservoirs" checked={card.generalInspection?.coolantLevel} />
                          <ChecklistStatusItem label="Battery Health & Terminals" checked={card.generalInspection?.batteryCondition} />
                          <ChecklistStatusItem label="Tyre Wear & Air Pressure" checked={card.generalInspection?.tyreWear} />
                          <ChecklistStatusItem label="Brake Linings & Air Valve" checked={card.generalInspection?.brakeCondition} />
                          <ChecklistStatusItem label="Leaf Springs & Suspension" checked={card.generalInspection?.suspensionCheck} />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Specific Symptom Diagnosis</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <DiagnosticStatusItem label="Low Pickup Engine Diagnosis" checked={card.driverComplaintsDiagnosis?.lowPickup} />
                          <DiagnosticStatusItem label="Excess Exhaust Smoke Check" checked={card.driverComplaintsDiagnosis?.excessSmoke} />
                          <DiagnosticStatusItem label="Hard Brake Pedal Check" checked={card.driverComplaintsDiagnosis?.brakeHard} />
                          <DiagnosticStatusItem label="Clutch Slip Diagnosis" checked={card.driverComplaintsDiagnosis?.clutchSlipping} />
                          <DiagnosticStatusItem label="Steering Vibration Check" checked={card.driverComplaintsDiagnosis?.steeringVibration} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 3 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Periodic Maintenance Estimate & Approvals</h4>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6 p-4 bg-blue-50/50 border border-blue-500/10 rounded-2xl">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ashok Leyland Maintenance Schedule</p>
                        <p className="text-sm font-black text-gray-800">{card.serviceInterval || "10,000 km Service"}</p>
                        <p className="text-xs text-gray-500">Includes oil changes, hub greasing, suspension tightening, and multi-point checks.</p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl border border-blue-500/10 shadow-xs shrink-0 self-stretch sm:self-auto flex items-center justify-center">
                        <span className="text-[#084D8C] text-sm font-black uppercase">{card.serviceCategory}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h5 className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-wider">DMS Estimated Costs Approval</h5>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ESTIMATED BILL TOTAL</p>
                          <p className="text-2xl font-black text-gray-800">₹{card.billing?.totalAmount?.toLocaleString() || "15,500"}</p>
                          <p className="text-xs text-gray-500">Parts: ₹{card.billing?.partsTotal?.toLocaleString() || "12,000"} | Labor: ₹{card.technicians?.laborCost?.toLocaleString() || "1,500"} | GST 18% included</p>
                        </div>

                        {card.documents?.estimateApproved ? (
                          <div className="bg-green-500 text-white rounded-xl px-5 py-3 flex items-center gap-2 font-bold text-sm shadow-md shadow-green-500/10">
                            <CheckCircle2 size={16} /> ESTIMATE APPROVED BY CLIENT
                          </div>
                        ) : (
                          <button
                            onClick={approveEstimate}
                            disabled={approving}
                            className="px-6 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
                          >
                            {approving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting Approval...
                              </>
                            ) : (
                              <>
                                <ThumbsUp size={16} /> CLICK TO APPROVE ESTIMATE
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 4 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Mechanical Bay Operations</h4>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 font-medium">Technicians inside the bay execute these high-fidelity tasks for Ashok Leyland vehicles:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ChecklistStatusItem label="Engine Oil Drain & Fresh Synthetic Refill" checked={card.serviceOperations?.engineOilReplace} />
                        <ChecklistStatusItem label="Primary & Secondary Fuel Filter Replacements" checked={card.serviceOperations?.fuelFilterReplace} />
                        <ChecklistStatusItem label="Dry Air Filter Cleaning & Element Audit" checked={card.serviceOperations?.airFilterClean} />
                        <ChecklistStatusItem label="Brake Shoe Wear Check & Drum Clean" checked={card.serviceOperations?.brakeClean} />
                        <ChecklistStatusItem label="Axle Play Check & Differential Oil Top-up" checked={card.serviceOperations?.differentialOilCheck} />
                        <ChecklistStatusItem label="Clutch Master Cylinder Play Adjustment" checked={card.serviceOperations?.clutchAdjustment} />
                        <ChecklistStatusItem label="Drive Belt Tension & Radiator Hose Audit" checked={card.serviceOperations?.beltTensionCheck} />
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 5 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Pressure Wash & Greasing Bay</h4>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 font-medium">Every truck is high-pressure washed and lubricated at specific chassis greasing points:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ChecklistStatusItem label="Under-chassis Mud Mud-Blast High Pressure Wash" checked={card.washingAndGreasing?.pressureWash} />
                        <ChecklistStatusItem label="Cabin & Cargo Body Foam Cleaning & Wash" checked={card.washingAndGreasing?.bodyWash} />
                        <ChecklistStatusItem label="Kingpin & Steering Knuckle Nipples Greasing" checked={card.washingAndGreasing?.kingpinGreasing} />
                        <ChecklistStatusItem label="Propeller Shaft & Universal Joints Greasing" checked={card.washingAndGreasing?.propellerGreasing} />
                        <ChecklistStatusItem label="Front & Rear Leaf Spring Eye-Pin Greasing" checked={card.washingAndGreasing?.leafSpringGreasing} />
                        <ChecklistStatusItem label="Cabin Door Hinges & Lock Lubrication" checked={card.washingAndGreasing?.doorLubrication} />
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 6 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Spare Parts Issued (DMS Store Integration)</h4>
                    {card.partsIssued && card.partsIssued.length > 0 ? (
                      <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                              <th className="px-4 py-3">PART DESCRIPTION</th>
                              <th className="px-4 py-3 text-center">QUANTITY</th>
                              <th className="px-4 py-3 text-right">UNIT PRICE</th>
                              <th className="px-4 py-3 text-right">SUBTOTAL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {card.partsIssued.map((p: any) => (
                              <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3.5 font-bold text-gray-800">{p.name}</td>
                                <td className="px-4 py-3.5 text-center font-semibold text-gray-600">{p.quantity}</td>
                                <td className="px-4 py-3.5 text-right text-gray-500">₹{p.price.toLocaleString()}</td>
                                <td className="px-4 py-3.5 text-right font-black text-gray-800">₹{(p.price * p.quantity).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                        <ShoppingCart size={32} className="text-gray-300 mx-auto" />
                        <p className="text-xs font-bold text-gray-500">No parts issued yet.</p>
                        <p className="text-[10px] text-gray-400">Spare parts store slip will generate in Stage 6.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeViewTab === 7 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Bay Resource & Technician Allocation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#084D8C]/10 text-[#084D8C] rounded-xl flex items-center justify-center shrink-0">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workshop Supervisor</p>
                          <p className="text-sm font-extrabold text-gray-800">{card.technicians?.supervisor || "Ramesh Patel (Ahmedabad)"}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#084D8C]/10 text-[#084D8C] rounded-xl flex items-center justify-center shrink-0">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lead Mechanical Tech</p>
                          <p className="text-sm font-extrabold text-gray-800">{card.technicians?.mainMechanic || "Hardik Solanki"}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#084D8C]/10 text-[#084D8C] rounded-xl flex items-center justify-center shrink-0">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Electrical Technician</p>
                          <p className="text-sm font-extrabold text-gray-800">{card.technicians?.electrician || "Amit Parmar"}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#084D8C]/10 text-[#084D8C] rounded-xl flex items-center justify-center shrink-0">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Wash & Greasing Team</p>
                          <p className="text-sm font-extrabold text-gray-800">{card.technicians?.washCrew || "Bay 3 Washing Crew"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 8 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Pre-Delivery Quality Inspection (QC)</h4>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500 font-medium">Prior to delivery, our QC engineer conducts a rigorous physical sign-off:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ChecklistStatusItem label="Wheel Lug Nut Torque Tightening Check" checked={card.qualityCheck?.torqueCheck} />
                        <ChecklistStatusItem label="Post-Service Oil/Coolant Fluid Leak Check" checked={card.qualityCheck?.leakageTest} />
                        <ChecklistStatusItem label="Air Brake System Pressure Build-up Test" checked={card.qualityCheck?.brakeTest} />
                        <ChecklistStatusItem label="Dashboard Diagnostic Scans (Zero Warnings)" checked={card.qualityCheck?.diagnosticScan} />
                        <ChecklistStatusItem label="5 km Road Test Drive Performance Review" checked={card.qualityCheck?.roadTestDrive} />
                        <ChecklistStatusItem label="Chassis Greasing Point visual audit" checked={card.qualityCheck?.greaseVerification} />
                      </div>
                      {card.qualityCheck?.qcSignOff && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-500/10 rounded-2xl flex items-center gap-3">
                          <CheckCircle2 className="text-green-500" size={18} />
                          <div>
                            <p className="text-xs font-bold text-green-800">QC Engineer Digital Sign-off Completed</p>
                            <p className="text-[10px] text-green-600">Vehicle is verified as 100% roadworthy and cleared for billing.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeViewTab === 9 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Tax Invoice & Digital Receipt</h4>
                    <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
                      {/* Invoice top */}
                      <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-start gap-4">
                        <div>
                          <p className="text-xs font-bold text-[#084D8C] uppercase">MOVISH AUTO SERVICE INVOICE</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1">GIDC Naroda, Ahmedabad, Gujarat</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-bold uppercase">INVOICE NO</p>
                          <p className="text-xs font-black text-gray-800 mt-1">#MVS-{card.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>

                      {/* Invoice Body */}
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-600 border-b pb-2">
                          <span>Spare Parts Consumables Total</span>
                          <span className="font-extrabold text-gray-800">₹{card.billing?.partsTotal?.toLocaleString() || "12,000"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 border-b pb-2">
                          <span>Workshop Mechanical Labor Charges</span>
                          <span className="font-extrabold text-gray-800">₹{card.technicians?.laborCost?.toLocaleString() || "1,500"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 border-b pb-2">
                          <span>CGST (9%) + SGST (9%)</span>
                          <span className="font-extrabold text-gray-800">₹{card.billing?.gstAmount?.toLocaleString() || "2,430"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-[#084D8C]/5 p-4 rounded-xl">
                          <span className="text-sm font-extrabold text-[#084D8C]">TOTAL AMOUNT PAYABLE</span>
                          <span className="text-base font-black text-[#084D8C]">₹{card.billing?.totalAmount?.toLocaleString() || "15,930"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === 10 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-extrabold text-gray-900 border-b pb-2">Vehicle Release & Digital Gate Pass</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Gate Pass Card */}
                      <div className="border border-dashed border-gray-300 rounded-3xl p-6 bg-white space-y-4 relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black tracking-widest bg-red-500 text-white px-2 py-0.5 rounded-sm">
                              GATE PASS
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">#GP-{card.id.substring(0,6).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Released Vehicle</p>
                            <p className="text-sm font-black text-gray-800">{card.vehicleNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gate Exit Clearance</p>
                            <p className="text-xs font-bold text-green-600 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 size={12} /> SECURE EXIT CLEARED
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                          <QrCode size={48} className="text-gray-700" />
                          <div className="text-xs">
                            <p className="font-bold text-gray-700">Scan at Security Outpost</p>
                            <p className="text-gray-400 mt-0.5">Scans instantly verify the gate pass signature.</p>
                          </div>
                        </div>
                      </div>

                      {/* Feedback rating card */}
                      <div className="bg-[#084D8C]/5 rounded-3xl p-6 border border-[#084D8C]/10 flex flex-col justify-between">
                        <div>
                          <h5 className="text-sm font-black text-[#084D8C]">Customer Feedback</h5>
                          <p className="text-xs text-gray-500 mt-1">Please rate our workshop's mechanic expertise, turnaround speed, and advisor transparency:</p>
                        </div>
                        
                        <div className="py-4">
                          {feedbackSent || card.delivery?.feedbackRating ? (
                            <div className="text-center py-2 space-y-1">
                              <p className="text-[#084D8C] font-extrabold text-sm">Thank You for Your Feedback!</p>
                              <div className="flex justify-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} className="text-xl">
                                    {star <= (rating || card.delivery?.feedbackRating) ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => submitFeedback(star)}
                                  className="w-10 h-10 text-2xl hover:scale-125 transition-all text-gray-300 hover:text-yellow-400 focus:outline-hidden"
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-center text-[#084D8C]/60 font-semibold uppercase">
                          Movish Auto Ahmedabad
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sticky Side advisor/workshop card (1 column) */}
          <aside className="space-y-6">
            {/* Advisor Contacts */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 space-y-6">
              <h3 className="font-extrabold text-gray-900 text-sm border-b pb-2">Assigned Service Advisor</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#084D8C] text-white flex items-center justify-center font-black text-lg">
                  RP
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">Ramesh Patel</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workshop Manager</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a 
                  href="tel:+919876543210" 
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-extrabold text-[#084D8C] hover:bg-[#084D8C]/5 transition-all"
                >
                  <Phone size={14} /> Call Advisor: +91 98765 43210
                </a>
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-600">
                  <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-gray-800">Movish Ashok Leyland Workshop</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Plot 24/A, GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Service reminder Card */}
            <div className="bg-gradient-to-br from-[#084D8C] to-[#084D8C]/90 text-white rounded-3xl border border-transparent shadow-xl p-6 space-y-4">
              <h3 className="font-extrabold text-white text-sm">Next Preventive Maintenance</h3>
              <p className="text-xs text-blue-100">Maintain high fuel efficiency and warranty validity by observing schedules.</p>
              
              <div className="bg-white/10 border border-white/10 p-3 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-200">Recommended Interval</span>
                  <span className="font-black text-white">{card.serviceInterval || "10,000 km"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-200">Suggested Next Service</span>
                  <span className="font-black text-white">{((card.odometerReading || 12000) + 10000).toLocaleString()} km</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 text-center mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-wider space-y-1">
        <p>© 2026 Movish Group Auto Dealerships. Ahmedabad, Gujarat.</p>
        <p>Powered by Movish Workshop DMS Engine.</p>
      </footer>
    </div>
  )
}

function ChecklistStatusItem({ label, checked }: { label: string, checked?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
      checked 
        ? 'bg-green-500/5 border-green-500/10 text-green-700 font-bold' 
        : 'bg-gray-50/50 border-gray-100 text-gray-400'
    }`}>
      <span>{label}</span>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        checked ? 'bg-green-500 text-white' : 'bg-gray-100 text-transparent'
      }`}>
        <Check size={10} className="stroke-[3px]" />
      </div>
    </div>
  )
}

function DiagnosticStatusItem({ label, checked }: { label: string, checked?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
      checked 
        ? 'bg-red-500/5 border-red-500/10 text-red-700 font-bold' 
        : 'bg-green-500/5 border-green-500/10 text-green-700 font-bold'
    }`}>
      <span>{label}</span>
      {checked ? (
        <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-sm">SYMPTOM DETECTED</span>
      ) : (
        <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-sm">PASSED DIAGNOSIS</span>
      )}
    </div>
  )
}
