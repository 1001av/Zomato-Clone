import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['preparing', 'cancelled'],
  preparing:        ['out_for_delivery'],
  out_for_delivery: ['delivered'],
}

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  preparing: 'bg-orange-50 text-orange-700',
  out_for_delivery: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/orders/restaurant-orders/').then(r => {
      setOrders(r.data.results || r.data)
    }).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/update-status/`, { status: newStatus })
      setOrders(orders.map(o => o.id === orderId ? data : o))
      toast.success(`Order updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order.')
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const tabs = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${filter === t ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 bg-white hover:border-brand'}`}
          >
            {t.replace('_', ' ')}
            {t !== 'all' && (
              <span className="ml-1.5 text-xs">({orders.filter(o => o.status === t).length})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-gray-200 rounded-2xl animate-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No orders in this category.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">#{order.order_number}</p>
                  <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status_display}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                {order.items?.map(item => (
                  <p key={item.id} className="text-sm text-gray-700">
                    {item.name} × {item.quantity} — ₹{Number(item.total_price).toFixed(2)}
                  </p>
                ))}
              </div>

              {/* Action buttons */}
              {STATUS_TRANSITIONS[order.status] && (
                <div className="flex gap-2 flex-wrap">
                  {STATUS_TRANSITIONS[order.status].map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => updateStatus(order.id, nextStatus)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${nextStatus === 'cancelled' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-brand text-white hover:bg-brand-600'}`}
                    >
                      Mark as {nextStatus.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}