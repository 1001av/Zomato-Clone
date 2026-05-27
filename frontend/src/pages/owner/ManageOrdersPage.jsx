// frontend/src/pages/owner/ManageOrdersPage.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  ChevronDown, ChevronUp, RefreshCw,
  CheckCircle2, XCircle, Bike, ChefHat, AlertCircle, Clock,
} from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// ── Constants ──────────────────────────────────────────────────
const STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['preparing', 'cancelled'],
  preparing:        ['out_for_delivery'],
  out_for_delivery: ['delivered'],
}

const STATUS_META = {
  pending:          { label: 'Pending',          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400',  icon: AlertCircle },
  confirmed:        { label: 'Confirmed',        color: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-400',    icon: CheckCircle2 },
  preparing:        { label: 'Preparing',        color: 'bg-orange-50 text-orange-700 border-orange-200',  dot: 'bg-orange-400',  icon: ChefHat },
  out_for_delivery: { label: 'Out for delivery', color: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-400',  icon: Bike },
  delivered:        { label: 'Delivered',        color: 'bg-green-50 text-green-700 border-green-200',     dot: 'bg-green-400',   icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-400',     icon: XCircle },
}

const NEXT_LABEL = {
  confirmed:        'Accept order',
  preparing:        'Start preparing',
  out_for_delivery: 'Send for delivery',
  delivered:        'Mark delivered',
  cancelled:        'Cancel order',
}

const TABS = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

// ── Sub-components ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {meta.label}
    </span>
  )
}

function OrderCard({ order, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const nextStatuses = STATUS_TRANSITIONS[order.status] || []

  const handleUpdate = async (newStatus) => {
    setUpdating(true)
    await onStatusUpdate(order.id, newStatus)
    setUpdating(false)
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
      ${order.status === 'pending' ? 'border-yellow-200 ring-1 ring-yellow-100' : 'border-gray-100'}`}
    >
      {/* ── Card header ── */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">#{order.order_number}</span>
            <StatusBadge status={order.status} />
            {order.status === 'pending' && (
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                Action needed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            {order.delivery_address && (
              <span className="truncate max-w-[200px]">📍 {order.delivery_address.city || order.delivery_address}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-gray-900">₹{Number(order.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-400"> × {item.quantity}</span>
                </span>
                <span className="font-semibold text-gray-900">₹{Number(item.total_price).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-1 border-t border-gray-200 mt-1">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-bold text-gray-900">₹{Number(order.total).toFixed(0)}</span>
            </div>
          </div>

          {/* Customer & delivery info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {order.customer_name && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="font-semibold text-blue-700 mb-1">Customer</p>
                <p className="text-blue-800">{order.customer_name}</p>
                {order.customer_phone && <p className="text-blue-600 mt-0.5">📞 {order.customer_phone}</p>}
              </div>
            )}
            {order.delivery_address && (
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="font-semibold text-purple-700 mb-1">Delivery address</p>
                <p className="text-purple-800 leading-relaxed">
                  {typeof order.delivery_address === 'object'
                    ? `${order.delivery_address.street}, ${order.delivery_address.city} - ${order.delivery_address.pincode}`
                    : order.delivery_address}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {nextStatuses.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-1">
              {nextStatuses.map(nextStatus => (
                <button
                  key={nextStatus}
                  onClick={() => handleUpdate(nextStatus)}
                  disabled={updating}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${nextStatus === 'cancelled'
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow'}`}
                >
                  {updating ? '...' : (NEXT_LABEL[nextStatus] || `Mark ${nextStatus.replace('_', ' ')}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('pending')

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await api.get('/orders/restaurant-orders/')
      setOrders(data.results || data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(() => loadOrders(true), 30_000)
    return () => clearInterval(id)
  }, [loadOrders])

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/update-status/`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? data : o))
      toast.success(
        newStatus === 'cancelled' ? '❌ Order cancelled' :
        newStatus === 'delivered' ? '✅ Order delivered!' :
        `Order moved to "${newStatus.replace('_', ' ')}"`
      )
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order.')
    }
  }

  const countFor = (tab) => tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-600 font-medium mt-0.5">
              ⚠️ {pendingCount} order{pendingCount > 1 ? 's' : ''} waiting for action
            </p>
          )}
        </div>
        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {TABS.map(tab => {
          const count = countFor(tab)
          const isPendingTab = tab === 'pending' && count > 0
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                ${filter === tab
                  ? isPendingTab ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-brand-500 text-white border-brand-500'
                  : isPendingTab ? 'border-yellow-300 text-yellow-600 bg-yellow-50 hover:border-yellow-400' : 'border-gray-200 text-gray-600 bg-white hover:border-brand-300'}`}
            >
              {tab.replace('_', ' ')}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${filter === tab ? 'bg-white/30 text-white' : isPendingTab ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Clock className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onStatusUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}