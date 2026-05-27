// Add this at the very top of ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { fetchProfile } from '../features/auth/authSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { User, Lock, MapPin, Plus } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('profile')

  const { register, handleSubmit } = useForm({  // remooved {error} since it's not used
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  })

  const onSaveProfile = async (data) => {
    try {
      await api.patch('/auth/profile/', data)
      dispatch(fetchProfile())
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile.')
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center text-brand text-2xl font-bold">
              {user?.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium capitalize">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input {...register('first_name', { required: true })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input {...register('last_name', { required: true })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className={inputClass} />
            </div>
            <button type="submit" className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
              Save changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && <ChangePasswordForm />}
      {activeTab === 'addresses' && <AddressManager />}
    </div>
  )
}

function ChangePasswordForm() {
  const { register, handleSubmit, reset} = useForm() //
  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/change-password/', data)
      toast.success('Password changed!')
      reset()
    } catch (err) {
      console.error('Failed to change password:', err)
      toast.error(err.response?.data?.old_password?.[0] || 'Failed to change password.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
          <input {...register('old_password', { required: true })} type="password" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input {...register('new_password', { required: true, minLength: 6 })} type="password" className={inputClass} />
        </div>
        <button type="submit" className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
          Update password
        </button>
      </form>
    </div>
  )
}

function AddressManager() {
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

  useEffect(() => {
    api.get('/auth/addresses/').then(r => setAddresses(r.data))
  }, [])

  const onAdd = async (data) => {
    try {
      const r = await api.post('/auth/addresses/', data)
      setAddresses([...addresses, r.data])
      setShowForm(false)
      reset()
      toast.success('Address added!')
    } catch (error) {
      console.error('Failed to add address:', error)
      toast.error('Could not add address.')
    }
  }

  const onDelete = async (id) => {
    try {
      await api.delete(`/auth/addresses/${id}/`)
      setAddresses(addresses.filter(a => a.id !== id))
      toast.success('Address removed.')
    } catch (error) {
      console.error('Failed to delete address:', error)
      toast.error('Could not remove address.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Saved addresses</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-brand font-medium">
          <Plus className="w-4 h-4" /> Add new
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onAdd)} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input {...register('label')} placeholder="Label (Home/Work)" className={inputClass} defaultValue="Home" />
            <input {...register('pincode', { required: true })} placeholder="Pincode" className={inputClass} />
          </div>
          <input {...register('street', { required: true })} placeholder="Street address" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input {...register('city', { required: true })} placeholder="City" className={inputClass} />
            <input {...register('state', { required: true })} placeholder="State" className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <p className="text-gray-400 text-sm">No addresses saved yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-start justify-between p-3 border border-gray-100 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">{addr.label}</p>
                <p className="text-gray-500 text-sm">{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</p>
              </div>
              <button onClick={() => onDelete(addr.id)} className="text-red-400 hover:text-red-600 text-xs ml-3">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}