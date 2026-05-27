import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Star, DollarSign, UtensilsCrossed, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function OwnerDashboard() {
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/restaurants/manage/'),
      api.get('/orders/restaurant-orders/'),
    ]).then(([r, o]) => {
      setRestaurant(r.data)
      setOrders((o.data.results || o.data).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const toggleOpen = async () => {
    try {
      const { data } = await api.patch('/restaurants/manage/', { is_open: !restaurant.is_open })
      setRestaurant(data)
      toast.success(data.is_open ? 'Restaurant is now open' : 'Restaurant is now closed')
    } catch { toast.error('Failed to update status.') }
  }

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0)

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>

  if (!restaurant) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No restaurant yet</h2>
      <p className="text-gray-500 mb-4">Create your restaurant profile to get started.</p>
      <Link to="/owner/create" className="bg-brand text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
        Create Restaurant
      </Link>
    </div>
  )

  const stats = [
    { label: 'Total orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Avg rating', value: Number(restaurant.avg_rating).toFixed(1) + '★', icon: Star, color: 'text-amber-600 bg-amber-50' },
    { label: 'Reviews', value: restaurant.total_reviews, icon: Star, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-500 text-sm">{restaurant.city} · {restaurant.status}</p>
        </div>
        <button onClick={toggleOpen} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${restaurant.is_open ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
          {restaurant.is_open ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {restaurant.is_open ? 'Open' : 'Closed'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[{ to: '/owner/menu', label: 'Manage Menu', desc: 'Add, edit, delete menu items' },
          { to: '/owner/orders', label: 'Manage Orders', desc: 'View and update order statuses' }].map(l => (
          <Link key={l.to} to={l.to} className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow group">
            <div>
              <p className="font-semibold text-gray-900">{l.label}</p>
              <p className="text-gray-500 text-sm">{l.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{o.order_number}</p>
                  <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{Number(o.total).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === 'delivered' ? 'bg-green-50 text-green-700' : o.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {o.status_display}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}