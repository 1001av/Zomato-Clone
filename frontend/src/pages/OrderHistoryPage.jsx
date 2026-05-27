import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ChevronRight, Package } from 'lucide-react'
import api from '../api/axios'

const STATUS_COLORS = {
  pending:          'bg-yellow-50 text-yellow-700',
  confirmed:        'bg-blue-50 text-blue-700',
  preparing:        'bg-orange-50 text-orange-700',
  out_for_delivery: 'bg-purple-50 text-purple-700',
  delivered:        'bg-green-50 text-green-700',
  cancelled:        'bg-red-50 text-red-700',
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my-orders/').then(r => {
      setOrders(r.data.results || r.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-skeleton" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link to="/" className="mt-3 inline-block text-sm text-brand hover:underline">Browse restaurants</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/restaurants/${order.restaurant}`}
              className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{order.restaurant_name}</p>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status_display}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">#{order.order_number}</p>
                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-900 text-sm">₹{Number(order.total).toFixed(2)}</p>
                  <p className="text-gray-400 text-xs mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}