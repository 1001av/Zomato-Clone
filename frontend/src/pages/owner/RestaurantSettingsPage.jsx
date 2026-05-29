// frontend/src/pages/owner/RestaurantSettingsPage.jsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Save, Clock, MapPin, Phone, Mail, Info } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-500" />
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ImageUploadBox({ label, currentUrl, onFileChange, aspectClass = 'aspect-video' }) {
  const [preview, setPreview] = useState(currentUrl)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setPreview(URL.createObjectURL(file))
    onFileChange(file)
  }

  return (
    <div>
      <p className={labelClass}>{label}</p>
      <label className={`relative block ${aspectClass} rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-brand-400 cursor-pointer transition-colors group bg-gray-50`}>
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
            <Camera className="w-8 h-8" />
            <span className="text-xs font-medium">Click to upload</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Change photo
          </div>
        </div>
        <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
      </label>
      <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, max 5 MB</p>
    </div>
  )
}

export default function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile]     = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    api.get('/restaurants/manage/')
      .then(({ data }) => {
        if (!data) return   // new owner, no restaurant yet
        setRestaurant(data)
        reset({
          name:         data.name || '',
          description:  data.description || '',
          phone:        data.phone || '',
          email:        data.email || '',
          address:      data.address || '',
          city:         data.city || '',
          state:        data.state || '',
          pincode:      data.pincode || '',
          opening_time: data.opening_time || '09:00',
          closing_time: data.closing_time || '23:00',
          delivery_fee: data.delivery_fee || 0,
          delivery_time: data.delivery_time || 30,
          min_order:    data.min_order || 100,
        })
      })
      .catch(() => toast.error('Failed to load restaurant.'))
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (formData) => {
    setSaving(true)
    try {
      // Always use FormData so images work on both create and update
      const fd = new FormData()
      fd.append('name',          formData.name)
      fd.append('description',   formData.description || '')
      fd.append('phone',         formData.phone || '')
      fd.append('email',         formData.email || '')
      fd.append('address',       formData.address || '')
      fd.append('city',          formData.city || '')
      fd.append('state',         formData.state || '')
      fd.append('pincode',       formData.pincode || '')
      fd.append('opening_time',  formData.opening_time || '09:00')
      fd.append('closing_time',  formData.closing_time || '23:00')
      fd.append('delivery_fee',  Number(formData.delivery_fee) || 0)
      fd.append('delivery_time', Number(formData.delivery_time) || 30)
      fd.append('min_order',     Number(formData.min_order) || 100)

      // Attach images if selected
      if (logoFile)   fd.append('logo',   logoFile)
      if (bannerFile) fd.append('banner', bannerFile)

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      // POST if new restaurant, PATCH if updating existing
      const { data } = restaurant
        ? await api.patch('/restaurants/manage/', fd, config)
        : await api.post('/restaurants/create/', fd, config)

      setRestaurant(data)
      setLogoFile(null)
      setBannerFile(null)
      toast.success(restaurant
        ? '✅ Settings saved!'
        : '🎉 Restaurant created! It will be visible after admin approval.'
      )
    } catch (err) {
      console.error('Save error:', err.response?.data || err)
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const firstError = Object.entries(errData)[0]
        toast.error(`${firstError[0]}: ${firstError[1]}`)
      } else {
        toast.error(errData?.detail || 'Failed to save.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Photos ── */}
        <SectionCard title="Photos" icon={Camera}>
          <div className="space-y-4">
            <ImageUploadBox
              label="Banner photo (shown at top of your restaurant page)"
              currentUrl={restaurant?.banner}
              onFileChange={setBannerFile}
              aspectClass="aspect-[3/1]"
            />
            <ImageUploadBox
              label="Logo (shown on restaurant cards)"
              currentUrl={restaurant?.logo}
              onFileChange={setLogoFile}
              aspectClass="aspect-square max-w-[160px]"
            />
          </div>
        </SectionCard>

        {/* ── Basic info ── */}
        <SectionCard title="Basic info" icon={Info}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Restaurant name</label>
              <input {...register('name', { required: true })} className={inputClass} placeholder="My Restaurant" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea {...register('description')} rows={3} className={inputClass + ' resize-none'} placeholder="Tell customers what makes you special..." />
            </div>
          </div>
        </SectionCard>

        {/* ── Contact ── */}
        <SectionCard title="Contact" icon={Phone}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input {...register('phone')} className={inputClass} placeholder="080-12345678" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input {...register('email')} type="email" className={inputClass} placeholder="restaurant@example.com" />
            </div>
          </div>
        </SectionCard>

        {/* ── Address ── */}
        <SectionCard title="Address" icon={MapPin}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Street address</label>
              <input {...register('address')} className={inputClass} placeholder="123 Main Road" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input {...register('city')} className={inputClass} placeholder="Bangalore" />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input {...register('state')} className={inputClass} placeholder="Karnataka" />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input {...register('pincode')} className={inputClass} placeholder="560001" />
            </div>
          </div>
        </SectionCard>

        {/* ── Hours & delivery ── */}
        <SectionCard title="Hours & delivery" icon={Clock}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Opening time</label>
              <input {...register('opening_time')} type="time" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Closing time</label>
              <input {...register('closing_time')} type="time" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Delivery time (min)</label>
              <input {...register('delivery_time')} type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Delivery fee (₹)</label>
              <input {...register('delivery_fee')} type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Min. order (₹)</label>
              <input {...register('min_order')} type="number" min="0" className={inputClass} />
            </div>
          </div>
        </SectionCard>

        {/* ── Save button ── */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save settings'}
        </button>

      </form>
    </div>
  )
}