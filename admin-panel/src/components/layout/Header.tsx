"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Bell, X } from 'lucide-react'

// ─── Notification Data ────────────────────────────────────────────────────────
type NotifTab = 'All' | 'Alerts' | 'Reminders'

const NOTIFICATIONS = [
  {
    type: 'Alerts',
    dot: '#ef4444',
    emoji: '🔴',
    title: 'Workshop QC pending on GJ-01-XX-2920',
    time: '15 min ago',
    read: false,
  },
  {
    type: 'Reminders',
    dot: '#eab308',
    emoji: '🟡',
    title: 'Follow-up due: Patel Earthmovers in 30 min',
    time: '32 min ago',
    read: false,
  },
  {
    type: 'All',
    dot: '#a855f7',
    emoji: '🟣',
    title: 'Estimate approved by Mehta Transports',
    time: '1 hr ago',
    read: true,
  },
  {
    type: 'Alerts',
    dot: '#22c55e',
    emoji: '🟢',
    title: 'New loan application: Gujarat Agro Distributors',
    time: '2 hrs ago',
    read: true,
  },
  {
    type: 'Reminders',
    dot: '#3b82f6',
    emoji: '🔵',
    title: 'Vehicle GJ-27-AT-9876 service overdue by 2,000 km',
    time: '3 hrs ago',
    read: true,
  },
]

const UNREAD_COUNT = NOTIFICATIONS.filter(n => !n.read).length

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<NotifTab>('All')
  const [items, setItems] = useState(NOTIFICATIONS)

  const filtered = activeTab === 'All'
    ? items
    : items.filter(n => n.type === activeTab)

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div
      className="absolute right-0 top-full mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
      style={{ animation: 'notifSlideIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-base font-black text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-[#084D8C] hover:underline"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-5 pb-3">
        {(['All', 'Alerts', 'Reminders'] as NotifTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#084D8C] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-5" />

      {/* Notification Items */}
      <div className="overflow-y-auto max-h-72">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400 font-medium">
            No notifications here
          </div>
        ) : (
          filtered.map((notif, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notif.read ? 'border-l-4 border-[#084D8C]' : 'border-l-4 border-transparent'
              }`}
            >
              {/* Colored Dot / Icon */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-base"
                style={{ backgroundColor: notif.dot + '22' }}
              >
                <span>{notif.emoji}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug ${
                    !notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'
                  }`}
                >
                  {notif.title}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{notif.time}</p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-50">
        <button className="w-full text-xs font-bold text-[#084D8C] hover:underline text-center">
          View all notifications →
        </button>
      </div>

      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Click-outside to close notification panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-20">
      <div className="flex items-center gap-4 flex-1">
        {/* Spacer for hamburger on mobile */}
        <div className="w-10 md:hidden"></div>
        <div className="relative w-full max-w-md hidden md:block">
          <input
            type="text"
            placeholder="Search leads, quotations, customers..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* ── Notification Bell ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} className={notifOpen ? 'text-[#084D8C]' : 'text-gray-500'} />
            {/* Red badge */}
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-[#D8232A] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[9px] font-black text-white leading-none">{UNREAD_COUNT}</span>
            </span>
          </button>

          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-full transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#084D8C] flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0) || '👤'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.fullName || 'User'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-[#D8232A] hover:text-red-700 px-2 md:px-3 py-1 hover:bg-red-50 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
