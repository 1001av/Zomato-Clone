import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react'
import api from '../api/axios'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}/`).then(r => setOrder(r.data)).catch(() => {})
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order placed!</h1>
        {order && (
          <p className="text-gray-500 text-sm mt-1">Order #{order.order_number}</p>
        )}
        <p className="text-gray-600 mt-3">
          Your order has been confirmed and the restaurant is preparing your food.
        </p>

        {order && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-brand shrink-0" />
              <span className="text-gray-700">
                Estimated delivery: <strong>{order.estimated_delivery_time
                  ? new Date(order.estimated_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '30-45 min'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-brand shrink-0" />
              <span className="text-gray-700">Delivering to your saved address</span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors"
          >
            Track your order <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/" className="block text-sm text-gray-500 hover:text-brand transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}