// src/pages/PaymentPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useDispatch } from 'react-redux'
import { clearCart } from '../features/cart/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

// Load Stripe — must be outside component
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
if (!STRIPE_KEY) console.error('⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not set in frontend/.env')
const stripePromise = loadStripe(STRIPE_KEY)

// ── Inner payment form ───────────────────────────────────────────
function PaymentForm({ orderId, orderNumber, amount }) {
  const stripe   = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message)
        toast.error(stripeError.message)
        setLoading(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm with backend
        await api.post('/payments/confirm/', {
          payment_intent_id: paymentIntent.id,
        })
        dispatch(clearCart())
        toast.success('Payment successful! 🎉')
        navigate(`/order-success/${orderId}`)
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Payment confirmation failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe Payment Element */}
      <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing payment...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Pay ₹{Number(amount).toFixed(2)}
          </>
        )}
      </button>

      {/* Test card hint */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-600 dark:text-blue-400">
        <p className="font-semibold mb-1">🧪 Test Mode — Use these card details:</p>
        <p>Card: <strong>4242 4242 4242 4242</strong></p>
        <p>Expiry: <strong>Any future date</strong> &nbsp; CVC: <strong>Any 3 digits</strong></p>
      </div>
    </form>
  )
}

// ── Main Payment Page ────────────────────────────────────────────
export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentData, setPaymentData]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    api.post('/payments/create-intent/', { order_id: orderId })
      .then(({ data }) => {
        setClientSecret(data.client_secret)
        setPaymentData(data)
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to initialize payment.')
        toast.error('Failed to initialize payment.')
      })
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Setting up payment...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="text-center space-y-4">
        <p className="text-5xl">😕</p>
        <p className="font-bold text-gray-900 dark:text-white text-lg">Payment Setup Failed</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-600"
        >
          View My Orders
        </button>
      </div>
    </div>
  )

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#E8384F',
        colorBackground: '#ffffff',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 text-brand-500" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Complete Payment</h1>
            {paymentData && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Order <strong className="text-gray-900 dark:text-white">#{paymentData.order_number}</strong>
                {' · '}
                <strong className="text-brand-500">₹{Number(paymentData.amount).toFixed(2)}</strong>
              </p>
            )}
          </div>

          {/* Stripe Elements */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <PaymentForm
                orderId={orderId}
                orderNumber={paymentData?.order_number}
                amount={paymentData?.amount}
              />
            </Elements>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          🔒 Your payment is encrypted and secure
        </p>
      </div>
    </div>
  )
}