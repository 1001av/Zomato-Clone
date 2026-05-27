import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../features/auth/authSlice'
import { UtensilsCrossed } from 'lucide-react'

const schema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().min(10, 'Enter valid phone number'),
  role: yup.string().oneOf(['customer', 'owner']).required(),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  password2: yup.string().oneOf([yup.ref('password')], 'Passwords do not match').required('Please confirm password'),
})

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((s) => s.auth)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'customer' },
  })

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data))
    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role
      navigate(role === 'owner' ? '/owner' : '/')
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand/10 rounded-2xl mb-3">
            <UtensilsCrossed className="w-6 h-6 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join FoodRush today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input {...register('first_name')} placeholder="John" className={inputClass} />
              {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input {...register('last_name')} placeholder="Doe" className={inputClass} />
              {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} type="tel" placeholder="9876543210" className={inputClass} />
            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: 'customer', label: '🛍️ Customer', desc: 'Order food' },
                { value: 'owner', label: '🍴 Restaurant Owner', desc: 'Sell food' }].map((opt) => (
                <label key={opt.value} className="relative cursor-pointer">
                  <input {...register('role')} type="radio" value={opt.value} className="sr-only peer" />
                  <div className="p-3 border-2 border-gray-200 rounded-xl text-center peer-checked:border-brand peer-checked:bg-brand/5 transition-colors">
                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input {...register('password2')} type="password" placeholder="••••••••" className={inputClass} />
            {errors.password2 && <p className={errorClass}>{errors.password2.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}