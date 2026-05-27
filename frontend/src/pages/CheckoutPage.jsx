// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MapPin, Tag, Clock, ChevronRight, Plus, AlertCircle } from 'lucide-react'
import { selectCartItems, selectCartTotal } from '../features/cart/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate  = useNavigate()
  const items     = useSelector(selectCartItems)
  const subtotal  = useSelector(selectCartTotal)
  const { restaurantId } = useSelector(s => s.cart)
  const { user }  = useSelector(s => s.auth)

  const [addresses, setAddresses]         = useState([])
  const [selectedAddress, setSelected]    = useState(null)
  const [restaurant, setRestaurant]       = useState(null)
  const [couponCode, setCouponCode]       = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discount, setDiscount]           = useState(0)
  const [instructions, setInstructions]   = useState('')
  const [loading, setLoading]             = useState(false)
  const [showAddForm, setShowAddForm]     = useState(false)
  const [newAddress, setNewAddress]       = useState({
    label: 'Home', street: '', city: '', state: '', pincode: ''
  })

  useEffect(() => {
    if (!items.length) { navigate('/restaurants'); return }

    // Fetch addresses and restaurant in parallel
    Promise.all([
      api.get('/auth/addresses/'),
      restaurantId ? api.get(`/restaurants/${restaurantId}/`) : Promise.resolve(null),
    ]).then(([addrRes, restRes]) => {
      const addrs = addrRes.data.results || addrRes.data
      setAddresses(addrs)
      if (addrs.length) setSelected(addrs.find(a => a.is_default) || addrs[0])
      if (restRes) setRestaurant(restRes.data)
    }).catch(() => toast.error('Failed to load checkout data.'))
  }, [])

  const tax         = subtotal * 0.05
  const deliveryFee = restaurant ? Number(restaurant.delivery_fee) : 0
  const total       = subtotal + tax + deliveryFee - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      // Coupon validation happens on order creation
      // Just show visual feedback here
      setCouponApplied(true)
      toast.success('Coupon will be applied at checkout!')
    } catch {
      toast.error('Invalid coupon code.')
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill all address fields.')
      return
    }
    try {
      const { data } = await api.post('/auth/addresses/', newAddress)
      setAddresses([...addresses, data])
      setSelected(data)
      setShowAddForm(false)
      setNewAddress({ label: 'Home', street: '', city: '', state: '', pincode: '' })
      toast.success('Address added!')
    } catch {
      toast.error('Failed to add address.')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address.')
      return
    }
    if (!items.length) {
      toast.error('Your cart is empty.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/orders/', {
        restaurant_id:       restaurantId,
        items:               items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        delivery_address_id: selectedAddress.id,
        coupon_code:         couponApplied ? couponCode : '',
        special_instructions: instructions,
      })
      toast.success('Order placed! Proceeding to payment...')
      navigate(`/payment/${data.id}`)
    } catch (err) {
      const msg = err.response?.data?.detail ||
        Object.values(err.response?.data || {})[0] ||
        'Failed to place order.'
      toast.error(typeof msg === 'string' ? msg : 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 rounded-xl text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand-500/30 placeholder:text-gray-400'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Delivery Address */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-brand-500" /> Delivery Address
              </h2>

              <div className="space-y-2 mb-3">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress?.id === addr.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelected(addr)}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{addr.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Add new address */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 text-brand-500 text-sm font-semibold hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add new address
                </button>
              ) : (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newAddress.label}
                      onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                      className={inputClass}
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                    <input
                      value={newAddress.pincode}
                      onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                      placeholder="Pincode"
                      className={inputClass}
                    />
                  </div>
                  <input
                    value={newAddress.street}
                    onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                    placeholder="Street address"
                    className={inputClass}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                      placeholder="City"
                      className={inputClass}
                    />
                    <input
                      value={newAddress.state}
                      onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                      placeholder="State"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAddress}
                      className="bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-600"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-600 dark:text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {addresses.length === 0 && !showAddForm && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-sm mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  No saved addresses. Please add one to continue.
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-brand-500" /> Apply Coupon
              </h2>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={couponApplied}
                  className={inputClass + ' flex-1'}
                />
                {couponApplied ? (
                  <button
                    onClick={() => { setCouponApplied(false); setCouponCode(''); setDiscount(0) }}
                    className="px-4 py-2 border-2 border-red-400 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 border-2 border-brand-500 text-brand-500 text-sm font-semibold rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponApplied && (
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  ✅ Coupon <strong>{couponCode}</strong> applied!
                </p>
              )}
            </div>

            {/* Special Instructions */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Special Instructions</h2>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Any special requests? E.g. less spicy, extra sauce..."
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </div>
          </div>

          {/* ── Right Column — Order Summary ─────────────── */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 sticky top-20">

              {/* Restaurant info */}
              {restaurant && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center text-xl">
                    🍽️
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{restaurant.name}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. {restaurant.delivery_time} min
                    </p>
                  </div>
                </div>
              )}

              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              {/* Items list */}
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                      {item.name}
                      <span className="text-gray-400"> × {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 dark:border-zinc-800 my-3" />

              {/* Price breakdown */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <hr className="border-gray-100 dark:border-zinc-800 my-3" />

              <div className="flex justify-between font-extrabold text-gray-900 dark:text-white text-base">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress || !items.length}
                className="w-full mt-5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing order...
                  </>
                ) : (
                  <>
                    Place Order & Pay
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Secured by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}