// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Shield, Star, Zap, ChevronRight} from 'lucide-react' // removed ArrowRight since it's not used
import api from '../api/axios'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import SkeletonCard from '../components/common/SkeletonCard'

const CATEGORIES = [
  { name: 'Biryani',   emoji: '🍛' },
  { name: 'Pizza',     emoji: '🍕' },
  { name: 'Burger',    emoji: '🍔' },
  { name: 'Sushi',     emoji: '🍱' },
  { name: 'Pasta',     emoji: '🍝' },
  { name: 'Desserts',  emoji: '🧁' },
  { name: 'Chinese',   emoji: '🥡' },
  { name: 'Healthy',   emoji: '🥗' },
  { name: 'Tacos',     emoji: '🌮' },
  { name: 'Coffee',    emoji: '☕' },
]

const COLLECTIONS = [
  { label: 'Newly Opened',   sub: '15 new restaurants', color: 'from-purple-900/80',  img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80' },
  { label: 'Top Rated',      sub: '4.5+ stars only',    color: 'from-amber-900/80',   img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { label: 'Budget Friendly', sub: 'Under ₹200',        color: 'from-green-900/80',   img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80' },
  { label: 'Late Night',     sub: 'Open past midnight', color: 'from-blue-900/80',    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery]           = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get('/restaurants/?ordering=-avg_rating')
      .then(r => setRestaurants((r.data.results || r.data).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#E8384F' }} className="relative overflow-hidden">
        {/* + pattern overlay */}
        <div
        className="absolute inset-0 opacity-10"
        style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Crect x='18' y='8' width='4' height='24'/%3E%3Crect x='8' y='18' width='24' height='4'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            {/* Delivery badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Delivering in 20 mins · Bangalore
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Order food to your<br />
              <span className="text-yellow-400">door in minutes</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-md">
              From your favourite local restaurants to top-rated chains — fresh, fast, and delivered hot.
            </p>

            {/* Search */}
            <div className="mt-8 flex gap-3 max-w-md">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-full px-5 shadow-lg">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/restaurants?search=${query}`)}
                  placeholder="Search restaurants or dishes..."
                  className="flex-1 py-3.5 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => navigate(`/restaurants?search=${query}`)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3.5 rounded-full text-sm transition-colors shrink-0 shadow-lg"
              >
                Find Food
              </button>
            </div>

            {/* Quick pills */}
            <div className="flex gap-2 mt-5 flex-wrap">
              {['Biryani', 'Pizza', 'Burger', 'Sushi'].map(c => (
                <button
                  key={c}
                  onClick={() => navigate(`/restaurants?cuisine=${c}`)}
                  className="px-4 py-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-full border border-white/25 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Right — food image with floating cards */}
          <div className="relative hidden lg:block">
            <div className="relative w-full max-w-md ml-auto">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85"
                alt="Delicious food"
                className="w-full h-80 object-cover rounded-3xl shadow-2xl"
              />
              {/* Rating float card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="font-extrabold text-gray-900 text-lg leading-none">4.8</p>
                  <p className="text-gray-400 text-xs">Avg rating</p>
                </div>
              </div>
              {/* Delivery float card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Fast Delivery</p>
                  <p className="text-gray-400 text-xs">Avg. 25 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500 dark:text-gray-400">
            {[
              { icon: Clock,   text: '25 min avg delivery' },
              { icon: Shield,  text: 'Secure & safe payments' },
              { icon: Star,    text: '4.8★ avg restaurant rating' },
              { icon: Zap,     text: 'Live order tracking' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-brand-500" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT ARE YOU CRAVING ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">What are you craving?</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => navigate(`/restaurants?cuisine=${cat.name}`)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-2xl shadow-sm group-hover:border-brand-500 group-hover:shadow-md transition-all">
                {cat.emoji}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-500 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── POPULAR NEAR YOU ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Popular Near You</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Bangalore, Karnataka</p>
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-brand-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-gray-500 dark:text-gray-400">No restaurants yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLECTIONS ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5">Collections</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLLECTIONS.map(col => (
            <button
              key={col.label}
              onClick={() => navigate('/restaurants')}
              className="relative rounded-2xl overflow-hidden aspect-video group"
            >
              <img src={col.img} alt={col.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className={`absolute inset-0 bg-gradient-to-t ${col.color} to-transparent`} />
              <div className="absolute bottom-0 left-0 p-4 text-left">
                <p className="text-white font-bold text-sm">{col.label}</p>
                <p className="text-white/70 text-xs mt-0.5">{col.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── APP DOWNLOAD BANNER ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-red-50 dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 border border-red-100 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Get the FoodRush App
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
              Order faster, track in real-time, and unlock exclusive app-only deals.
            </p>
            <div className="flex gap-3 mt-6">
              <button className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity">
                🍎 App Store
              </button>
              <button className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity">
                🤖 Google Play
              </button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80"
            alt="App preview"
            className="w-40 h-40 object-cover rounded-2xl shadow-lg shrink-0 hidden sm:block"
          />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🍴</span>
                </div>
                <span className="text-xl font-extrabold dark:text-white">
                  <span className="text-brand-500">food</span>rush
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Delivering happiness to your doorstep.<br />
                Fresh food, fast delivery, every time.
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Blog', 'Newsroom'].map(l => (
                  <li key={l}><button className="text-gray-500 dark:text-gray-400 text-sm hover:text-brand-500 transition-colors">{l}</button></li>
                ))}
              </ul>
            </div>

            {/* For Restaurants */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">For Restaurants</h4>
              <ul className="space-y-3">
                {['Partner with us', 'Restaurant Login', 'Help Center', 'Advertise'].map(l => (
                  <li key={l}>
                    <button
                      onClick={() => l === 'Restaurant Login' ? navigate('/login') : null}
                      className="text-gray-500 dark:text-gray-400 text-sm hover:text-brand-500 transition-colors"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map(l => (
                  <li key={l}><button className="text-gray-500 dark:text-gray-400 text-sm hover:text-brand-500 transition-colors">{l}</button></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-sm">© 2025 FoodRush Technologies Pvt. Ltd.</p>
            <p className="text-gray-400 text-sm">Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}