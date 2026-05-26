// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react'
import { useSelector} from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCartItems, selectCartTotal } from '../features/cart/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { MapPin, Tag, Clock } from 'lucide-react'

export default function CheckoutPage() {
  const navigate = useNavigate()
//   const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartTotal)
  const { restaurantId } = useSelector((s) => s.cart)

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [restaurant, setRestaurant] = useState(null)

  useEffect(() => {
    if (!items.length) { navigate('/'); return }
    api.get('/auth/addresses/').then(r => {
      setAddresses(r.data)
      if (r.data.length) setSelectedAddress(r.data.find(a => a.is_default) || r.data[0])
    })
    if (restaurantId) {
      api.get(`/restaurants/${restaurantId}/`).then(r => setRestaurant(r.data))
    }
  }, [items.length, navigate, restaurantId])  // fixed here to include restaurantId

  const tax = subtotal * 0.05
  const deliveryFee = restaurant ? Number(restaurant.delivery_fee) : 0
  const total = subtotal + tax + deliveryFee

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/orders/', {
        restaurant_id: restaurantId,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        delivery_address_id: selectedAddress.id,
        coupon_code: couponCode,
        special_instructions: instructions,
      })
      navigate(`/payment/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Address + Options */}
        <div className="lg:col-span-2 space-y-4">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-brand" /> Delivery address
            </h2>
            <div className="space-y-2">
              {addresses.map(addr => (
                <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-0.5 accent-brand" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{addr.label}</p>
                    <p className="text-gray-500 text-sm">{addr.street}, {addr.city} — {addr.pincode}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-brand" /> Apply coupon
            </h2>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
              <button className="px-4 py-2 border border-brand text-brand text-sm font-medium rounded-xl hover:bg-brand/5">Apply</button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Special instructions</h2>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Any special request for the restaurant or delivery partner..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>

            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 my-3" />

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            </div>

            <hr className="border-gray-100 my-3" />

            <div className="flex justify-between font-bold text-base text-gray-900">
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>

            {restaurant && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                <Clock className="w-3.5 h-3.5" /> Est. {restaurant.delivery_time} min
              </p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-5 bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Placing order...' : 'Place Order & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}