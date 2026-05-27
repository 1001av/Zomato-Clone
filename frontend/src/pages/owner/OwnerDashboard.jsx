// frontend/src/pages/owner/OwnerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Star, TrendingUp, UtensilsCrossed,
  ChevronRight, ToggleLeft, ToggleRight, Clock,
  CheckCircle2, XCircle, Bike, ChefHat, AlertCircle,
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// ── Helpers ────────────────────────────────────────────────────
const STATUS_META = {
  pending:          { label: 'Pending',          color: 'bg-yellow-50 text-yellow-700',  icon: AlertCircle },
  confirmed:        { label: 'Confirmed',        color: 'bg-blue-50 text-blue-700',      icon: CheckCircle2 },
  preparing:        { label: 'Preparing',        color: 'bg-orange-50 text-orange-700',  icon: ChefHat },
  out_for_delivery: { label: 'Out for delivery', color: 'bg-purple-50 text-purple-700',  icon: Bike },
  delivered:        { label: 'Delivered',        color: 'bg-green-50 text-green-700',    icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-50 text-red-700',        icon: XCircle },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
      {status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
      {meta.label}
    </span>
  )
}

// Simple bar chart built with divs — no extra library needed
function RevenueChart({ orders }) {
  // Group delivered orders by day (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateStr: d.toISOString().slice(0, 10),
      total: 0,
    }
  })
  orders
    .filter(o => o.status === 'delivered')
    .forEach(o => {
      const day = o.created_at?.slice(0, 10)
      const found = days.find(d => d.dateStr === day)
      if (found) found.total += Number(o.total)
    })
  const max = Math.max(...days.map(d => d.total), 1)

  return (
    <div className="flex items-end gap-2 h-24">
      {days.map(d => (
        <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
            <div
              className="w-full rounded-t-lg bg-brand-500/80 hover:bg-brand-500 transition-all"
              style={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 8 : 2)}%` }}
              title={`₹${d.total}`}
            />
          </div>
          <span className="text-[10px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function OwnerDashboard() {
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = () =>
    Promise.all([
      api.get('/restaurants/manage/'),
      api.get('/orders/restaurant-orders/'),
    ]).then(([r, o]) => {
      setRestaurant(r.data)
      setOrders(o.data.results || o.data)
    }).finally(() => setLoading(false))

  useEffect(() => { fetchData() }, [])

  const toggleOpen = async () => {
    try {
      const { data } = await api.patch('/restaurants/manage/', { is_open: !restaurant.is_open })
      setRestaurant(data)
      toast.success(data.is_open ? '🟢 Restaurant is now open' : '🔴 Restaurant is now closed')
    } catch { toast.error('Failed to update status.') }
  }

  // ── Derived stats ──────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  const todayOrders   = orders.filter(o => o.created_at?.startsWith(today))
  const activeOrders  = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const totalRevenue  = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0)
  const todayRevenue  = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0)
  const recentOrders  = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)

  const stats = [
    {
      label: 'Total orders',
      value: orders.length,
      sub: `${todayOrders.length} today`,
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      sub: `₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} today`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Avg rating',
      value: Number(restaurant?.avg_rating || 0).toFixed(1),
      sub: `${restaurant?.total_reviews || 0} reviews`,
      icon: Star,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Active orders',
      value: activeOrders.length,
      sub: activeOrders.length > 0 ? 'Need attention' : 'All clear',
      icon: Clock,
      color: activeOrders.length > 0 ? 'text-orange-600 bg-orange-50' : 'text-gray-500 bg-gray-50',
    },
  ]

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="h-10 bg-gray-200 rounded-2xl w-56 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
    </div>
  )

  // ── No restaurant state ────────────────────────────────────
  if (!restaurant) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No restaurant yet</h2>
      <p className="text-gray-500 mb-6">Create your restaurant profile to get started.</p>
      <Link to="/owner/settings" className="bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
        Create Restaurant
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{restaurant.city} · {restaurant.address}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/owner/settings"
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Settings
          </Link>
          <button
            onClick={toggleOpen}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all border
              ${restaurant.is_open
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
          >
            {restaurant.is_open
              ? <><ToggleRight className="w-5 h-5" /> Open</>
              : <><ToggleLeft className="w-5 h-5" /> Closed</>}
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue chart + quick links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="font-semibold text-gray-900 mb-4">Revenue — last 7 days</p>
          <RevenueChart orders={orders} />
        </div>
        <div className="flex flex-col gap-3">
          {[
            { to: '/owner/orders', label: 'Manage Orders', desc: `${activeOrders.length} active`, icon: ShoppingBag, highlight: activeOrders.length > 0 },
            { to: '/owner/menu',   label: 'Manage Menu',   desc: 'Edit items & categories',        icon: UtensilsCrossed, highlight: false },
            { to: '/owner/settings', label: 'Settings',    desc: 'Hours, photos, info',            icon: ChevronRight, highlight: false },
          ].map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center justify-between bg-white rounded-2xl border p-4 hover:shadow-sm transition-all group
                ${l.highlight ? 'border-orange-200 bg-orange-50/40' : 'border-gray-100'}`}
            >
              <div>
                <p className={`font-semibold text-sm ${l.highlight ? 'text-orange-700' : 'text-gray-900'}`}>{l.label}</p>
                <p className={`text-xs mt-0.5 ${l.highlight ? 'text-orange-500' : 'text-gray-400'}`}>{l.desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${l.highlight ? 'text-orange-400' : 'text-gray-300'}`} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent orders</h2>
          <Link to="/owner/orders" className="text-xs text-brand-500 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-300">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">#{o.order_number}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  ₹{Number(o.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}