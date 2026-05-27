// src/pages/OrderSuccessPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, MapPin, Package, ArrowRight, Home } from 'lucide-react'
import api from '../api/axios'

const STATUS_STEPS = [
  { key: 'confirmed',        label: 'Order Confirmed',    icon: '✅' },
  { key: 'preparing',        label: 'Preparing Food',     icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: '🛵' },
  { key: 'delivered',        label: 'Delivered',          icon: '🎉' },
]

export default function OrderSuccessPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}/`)
      .then(r => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Success card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 text-center">

          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Order Placed! 🎉
          </h1>
          {order && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Order <strong className="text-gray-900 dark:text-white">#{order.order_number}</strong>
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
            Your order has been confirmed and the restaurant is preparing your food.
          </p>

          {/* Order status tracker */}
          <div className="mt-6 mb-6">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-zinc-700 z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-brand-500 z-0 transition-all duration-500"
                style={{ width: `${(Math.max(currentStepIndex, 0) / (STATUS_STEPS.length - 1)) * 100}%` }}
              />

              {STATUS_STEPS.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                    index <= currentStepIndex
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-medium text-center max-w-16 ${
                    index <= currentStepIndex
                      ? 'text-brand-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order details */}
          {order && (
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 text-left space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Package className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Restaurant</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{order.restaurant_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Estimated delivery</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {order.estimated_delivery_time
                      ? new Date(order.estimated_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '30-45 minutes'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Total paid</p>
                  <p className="font-bold text-brand-500">₹{Number(order.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
            >
              Track Order <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-semibold py-3.5 rounded-2xl transition-colors text-sm"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}