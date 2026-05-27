// src/pages/owner/ManageMenuPage.jsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ManageMenuPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      price: '',
      category: '',
      food_type: 'veg',
      calories: '',
      description: '',
      is_available: true,
      is_bestseller: false,
    },
  })

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

  const fetchData = async () => {
    try {
      const r = await api.get('/restaurants/manage/')
      setRestaurantId(r.data.id)
      setCategories(r.data.categories || [])
      const menuRes = await api.get(`/restaurants/${r.data.id}/menu/`)
      setItems(menuRes.data.results || menuRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load menu.')
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openEdit = (item) => {
    setEditing(item)
    reset({
      name: item.name || '',
      price: item.price || '',
      category: item.category || '',
      food_type: item.food_type || 'veg',
      calories: item.calories || '',
      description: item.description || '',
      is_available: item.is_available ?? true,
      is_bestseller: item.is_bestseller ?? false,
    })
    setShowForm(true)
  }

  const openAdd = () => {
    setEditing(null)
    reset({
      name: '',
      price: '',
      category: '',
      food_type: 'veg',
      calories: '',
      description: '',
      is_available: true,
      is_bestseller: false,
    })
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        calories: data.calories ? parseInt(data.calories, 10) : null,
        category: data.category ? parseInt(data.category, 10) : null,
      }

      if (editing) {
        const r = await api.patch(`/restaurants/menu/${editing.id}/`, payload)
        const matchedCat = categories.find((c) => c.id === payload.category)
        const updatedItem = { ...r.data, category_name: matchedCat ? matchedCat.name : '' }
        setItems(items.map((i) => (i.id === editing.id ? updatedItem : i)))
        toast.success('Item updated!')
      } else {
        if (!restaurantId) {
          toast.error('No restaurant found for this account.')
          return
        }
        const r = await api.post(`/restaurants/${restaurantId}/menu/`, payload)
        const matchedCat = categories.find((c) => c.id === payload.category)
        const newItem = { ...r.data, category_name: matchedCat ? matchedCat.name : '' }
        setItems([...items, newItem])
        toast.success('Item added!')
      }

      setShowForm(false)
      setEditing(null)
      reset()
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save item.')
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this item permanently?')) return
    try {
      await api.delete(`/restaurants/menu/${id}/`)
      setItems(items.filter((i) => i.id !== id))
      toast.success('Item deleted.')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete item.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {editing ? 'Edit Item' : 'New Menu Item'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                {...register('name', { required: true })}
                className={inputClass}
                placeholder="e.g. Butter Chicken"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                {...register('price', { required: true })}
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category')} className={inputClass}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <select {...register('food_type')} className={inputClass}>
                <option value="veg">Vegetarian</option>
                <option value="non_veg">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                {...register('calories')}
                type="number"
                min="0"
                className={inputClass}
                placeholder="e.g. 350"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className={inputClass + ' resize-none'}
                placeholder="Describe the dish..."
              />
            </div>

            <div className="sm:col-span-2 flex gap-6 py-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  {...register('is_available')}
                  type="checkbox"
                  className="w-4 h-4 accent-brand rounded"
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  {...register('is_bestseller')}
                  type="checkbox"
                  className="w-4 h-4 accent-brand rounded"
                />
                Bestseller
              </label>
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                {editing ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); reset() }}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm font-medium">No menu items yet. Add your first item!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    {!item.is_available && (
                      <span className="text-[10px] font-semibold bg-red-50 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Unavailable
                      </span>
                    )}
                    {item.is_bestseller && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Bestseller
                      </span>
                    )}
                  </div>
                  <p className="text-brand font-semibold text-sm mt-0.5">
                    ₹{Number(item.price).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 capitalize">
                    {item.category_name || 'Uncategorised'} ·{' '}
                    {item.food_type?.replace('_', ' ')}
                    {item.calories ? ` · ${item.calories} kcal` : ''}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}