// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate} from 'react-router-dom' // removed Link since it's not used
import { loginUser, registerUser } from '../../features/auth/authSlice'
import { Eye, EyeOff, Mail, Lock, User, Phone, UtensilsCrossed } from 'lucide-react'

const loginSchema = yup.object({
  email:    yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(6, 'Min 6 characters').required('Required'),
})

const registerSchema = yup.object({
  first_name: yup.string().required('Required'),
  last_name:  yup.string().required('Required'),
  email:      yup.string().email('Invalid email').required('Required'),
  phone:      yup.string().min(10, 'Invalid phone'),
  role:       yup.string().oneOf(['customer', 'owner']).required(),
  password:   yup.string().min(6, 'Min 6 characters').required('Required'),
  password2:  yup.string().oneOf([yup.ref('password')], 'Passwords do not match').required('Required'),
})

function InputField({ icon: Icon, type = 'text', placeholder, error, showToggle, onToggle, showPassword, ...rest }) {
  return (
    <div>
      <div className={`flex items-center gap-3 bg-gray-100 dark:bg-zinc-800 rounded-xl px-4 py-3.5 border-2 transition-colors ${error ? 'border-red-400' : 'border-transparent focus-within:border-brand-500'}`}>
        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type={showToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-400"
          {...rest}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  )
}

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const [tab, setTab]         = useState('login')   // 'login' | 'register'
  const [showPw, setShowPw]   = useState(false)
  const [showPw2, setShowPw2] = useState(false)

  const isLogin = tab === 'login'

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: { role: 'customer' },
  })

  const switchTab = (t) => { setTab(t); reset() }

  const onSubmit = async (data) => {
    if (isLogin) {
      const result = await dispatch(loginUser(data))
      if (loginUser.fulfilled.match(result)) {
        const role = result.payload.user.role
        navigate(role === 'owner' ? '/owner' : role === 'admin' ? '/admin-panel' : '/')
      }
    } else {
      const result = await dispatch(registerUser(data))
      if (registerUser.fulfilled.match(result)) {
        navigate(result.payload.user.role === 'owner' ? '/owner' : '/')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-brand-500 rounded-3xl flex items-center justify-center shadow-lg mb-4">
          <UtensilsCrossed className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold dark:text-white">
          <span className="text-brand-500">food</span>rush
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Good food, delivered fast</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8">

        {/* Tab switcher */}
        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-2xl p-1 mb-8">
          {[['login', 'Sign In'], ['register', 'Create Account']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => switchTab(val)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === val
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <InputField icon={User} placeholder="First name" error={errors.first_name?.message} {...register('first_name')} />
                <InputField icon={User} placeholder="Last name"  error={errors.last_name?.message}  {...register('last_name')} />
              </div>
              <InputField icon={Phone} placeholder="Phone number" type="tel" error={errors.phone?.message} {...register('phone')} />
              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'customer', label: '🛍️ Customer' }, { value: 'owner', label: '🍴 Owner' }].map(opt => (
                  <label key={opt.value} className="relative cursor-pointer">
                    <input {...register('role')} type="radio" value={opt.value} className="sr-only peer" />
                    <div className="p-3 border-2 border-gray-200 dark:border-zinc-700 rounded-xl text-center text-sm font-medium text-gray-700 dark:text-gray-300 peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-500/10 peer-checked:text-brand-500 transition-all">
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Common fields */}
          <InputField icon={Mail} type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
          <InputField
            icon={Lock}
            placeholder="Your password"
            showToggle
            showPassword={showPw}
            onToggle={() => setShowPw(!showPw)}
            error={errors.password?.message}
            {...register('password')}
          />

          {!isLogin && (
            <InputField
              icon={Lock}
              placeholder="Confirm password"
              showToggle
              showPassword={showPw2}
              onToggle={() => setShowPw2(!showPw2)}
              error={errors.password2?.message}
              {...register('password2')}
            />
          )}

          {/* Forgot password */}
          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-brand-500 text-sm font-semibold hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-60 text-sm mt-2"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          {/* Divider */}
          {isLogin && (
            <>
              <div className="flex items-center gap-3 my-2">
                <hr className="flex-1 border-gray-200 dark:border-zinc-700" />
                <span className="text-xs text-gray-400">or continue with</span>
                <hr className="flex-1 border-gray-200 dark:border-zinc-700" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[{ emoji: '🌐', label: 'Google' }, { emoji: '📱', label: 'Phone OTP' }].map(btn => (
                  <button
                    key={btn.label}
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-500 transition-all"
                  >
                    <span>{btn.emoji}</span> {btn.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </form>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 max-w-sm">
        By continuing, you agree to our{' '}
        <span className="text-brand-500 font-medium cursor-pointer hover:underline">Terms</span>
        {' '}and{' '}
        <span className="text-brand-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </div>
  )
}