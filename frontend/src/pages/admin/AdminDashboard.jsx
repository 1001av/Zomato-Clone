import { useState, useEffect } from 'react'
import { Users, UtensilsCrossed, ShoppingBag, DollarSign } from 'lucide-react'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, restaurants: 0, orders: 0, revenue: 0 })
  const [restaurants, setRestaurants] = useState([])
  const [, setLoading] = useState(true)  // removed loading state since it's not used in the UI

  useEffect(() => {
    Promise.all([
      api.get('/restaurants/?page_size=50'),
    ]).then(([r]) => {
      const rests = r.data.results || r.data
      setRestaurants(rests)
      setStats(s => ({ ...s, restaurants: rests.length }))
    }).finally(() => setLoading(false))
  }, [])

  const approveRestaurant = async (id) => {
    try {
      await api.patch(`/restaurants/${id}/`, { status: 'approved' })
      setRestaurants(restaurants.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch (error) {
      console.error('Failed to approve restaurant:', error)
    }
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Restaurants', value: stats.restaurants, icon: UtensilsCrossed, color: 'text-green-600 bg-green-50' },
    { label: 'Orders', value: stats.orders, icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
    { label: 'Revenue', value: `₹${stats.revenue}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Restaurant approvals */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Restaurants</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                <th className="text-left py-2 text-gray-500 font-medium">City</th>
                <th className="text-left py-2 text-gray-500 font-medium">Rating</th>
                <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                <th className="text-left py-2 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restaurants.map(r => (
                <tr key={r.id}>
                  <td className="py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="py-3 text-gray-500">{r.city}</td>
                  <td className="py-3 text-gray-500">{Number(r.avg_rating).toFixed(1)}★</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-green-50 text-green-700' : r.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {r.status === 'pending' && (
                      <button onClick={() => approveRestaurant(r.id)} className="text-xs text-brand hover:underline font-medium">
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}