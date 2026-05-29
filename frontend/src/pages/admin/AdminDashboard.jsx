// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Users, UtensilsCrossed, ShoppingBag, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUS_META = {
  pending:  { color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  label: 'Pending' },
  approved: { color: 'bg-green-50 text-green-700 border-green-200',     label: 'Approved' },
  rejected: { color: 'bg-red-50 text-red-700 border-red-200',           label: 'Rejected' },
}

const TABS = ['all', 'pending', 'approved', 'rejected']

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([])
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [updating, setUpdating]       = useState(null) // id currently being updated
  const [tab, setTab]                 = useState('pending')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/restaurants/admin/all/'),   // new endpoint — all statuses
      api.get('/auth/list/'),               // user list
    ]).then(([r, u]) => {
      setRestaurants(r.data.results || r.data)
      setUsers(u.data.results || u.data)
    }).catch(() => {
      // fallback: try fetching approved only if admin endpoint not yet added
      api.get('/restaurants/?page_size=100').then(r => {
        setRestaurants(r.data.results || r.data)
      })
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, newStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/restaurants/${id}/approve/`, { status: newStatus })
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      toast.success(newStatus === 'approved' ? '✅ Restaurant approved!' : '❌ Restaurant rejected.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update.')
    } finally {
      setUpdating(null)
    }
  }

  const filtered   = tab === 'all' ? restaurants : restaurants.filter(r => r.status === tab)
  const pendingCount = restaurants.filter(r => r.status === 'pending').length
  const owners     = users.filter(u => u.role === 'owner').length
  const customers  = users.filter(u => u.role === 'customer').length

  const stats = [
    { label: 'Total restaurants', value: restaurants.length,          icon: UtensilsCrossed, color: 'text-green-600 bg-green-50' },
    { label: 'Pending approval',  value: pendingCount,                icon: Clock,           color: pendingCount > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 bg-gray-50' },
    { label: 'Owners',            value: owners,                      icon: ShoppingBag,     color: 'text-blue-600 bg-blue-50' },
    { label: 'Customers',         value: customers,                   icon: Users,           color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-600 font-medium mt-0.5">
              ⚠️ {pendingCount} restaurant{pendingCount > 1 ? 's' : ''} waiting for approval
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Restaurant management */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Restaurants</h2>
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map(t => {
              const count = t === 'all' ? restaurants.length : restaurants.filter(r => r.status === t).length
              const isPending = t === 'pending' && count > 0
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                    ${tab === t
                      ? isPending ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-brand-500 text-white border-brand-500'
                      : isPending ? 'border-yellow-300 text-yellow-600 bg-yellow-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                >
                  {t}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${tab === t ? 'bg-white/30 text-white' : isPending ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-300">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No restaurants in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(r => {
              const meta = STATUS_META[r.status] || STATUS_META.pending
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {r.logo
                      ? <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300"><UtensilsCrossed className="w-5 h-5" /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.city}{r.owner_name ? ` · Owner: ${r.owner_name}` : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(r.id, 'approved')}
                          disabled={updating === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {updating === r.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected')}
                          disabled={updating === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {r.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(r.id, 'rejected')}
                        disabled={updating === r.id}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                    {r.status === 'rejected' && (
                      <button
                        onClick={() => updateStatus(r.id, 'approved')}
                        disabled={updating === r.id}
                        className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}