// src/pages/PaymentPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { clearCart } from '../features/cart/cartSlice'

// Load Stripe outside render to avoid recreating
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm({ orderId, orderNumber, amount }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      toast.error(error.message || 'Payment failed.')
      setLoading(false)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        await api.post('/payments/confirm/', { payment_intent_id: paymentIntent.id })
        dispatch(clearCart())
        toast.success('Payment successful!')
        navigate(`/order-success/${orderId}`)
      } catch {
        toast.error('Payment confirmed but order update failed. Contact support.')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-60"
      >
        {loading ? 'Processing...' : `Pay ₹${Number(amount).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function PaymentPage() {
  const { orderId } = useParams()
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    api.post('/payments/create-intent/', { order_id: orderId })
      .then(({ data }) => {
        setClientSecret(data.client_secret)
        setPaymentData(data)
      })
      .catch(() => toast.error('Failed to initialize payment.'))
  }, [orderId])

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Complete payment</h1>
        {paymentData && (
          <p className="text-sm text-gray-500 mb-6">
            Order #{paymentData.order_number} · ₹{Number(paymentData.amount).toFixed(2)}
          </p>
        )}
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm orderId={orderId} orderNumber={paymentData?.order_number} amount={paymentData?.amount} />
        </Elements>
        <p className="text-xs text-gray-400 text-center mt-4">🔒 Secured by Stripe. Test card: 4242 4242 4242 4242</p>
      </div>
    </div>
  )
}