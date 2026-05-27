// src/components/layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShoppingCart, MapPin, Search, Moon, Sun,
  ChevronDown, Menu, X, UtensilsCrossed,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { logoutUser } from '../../features/auth/authSlice'
import { toggleCart, selectCartCount } from '../../features/cart/cartSlice'

const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai',
  'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Raipur',
]

function CityPicker() {
  const [open, setOpen]       = useState(false)
  const [city, setCity]       = useState('Bangalore')
  const [query, setQuery]     = useState('')
  const ref                   = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))

  const select = (c) => {
    setCity(c)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={ref} className="relative hidden sm:block shrink-0">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
      >
        <MapPin className="w-4 h-4 text-brand-500" />
        {city}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden z-50">
          {/* Search within cities */}
          <div className="p-2 border-b border-gray-100 dark:border-zinc-700">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-700 rounded-xl outline-none placeholder:text-gray-400 dark:text-gray-200"
            />
          </div>

          {/* City list */}
          <ul className="py-1 max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">No cities found</li>
            ) : (
              filtered.map(c => (
                <li key={c}>
                  <button
                    onClick={() => select(c)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
                      ${c === city
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${c === city ? 'text-brand-500' : 'text-gray-300'}`} />
                    {c}
                    {c === city && <span className="ml-auto text-brand-500 text-xs">✓</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const cartCount  = useSelector(selectCartCount)
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobile] = useState(false)
  const [search, setSearch]     = useState('')

  const toggleDark = () => {
     if (dark) {
    document.documentElement.classList.remove('dark')
    setDark(false)
  } else {
    document.documentElement.classList.add('dark')
    setDark(true)
  }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/restaurants?search=${search}`)
      setSearch('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight dark:text-white">
              <span className="text-brand-500">food</span>rush
            </span>
          </Link>

          {/* ── Location picker ── */}
          <CityPicker />

          {/* ── Search bar ── */}
          <div className="flex-1 relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search restaurants or dishes..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-sm text-gray-800 dark:text-gray-200 rounded-full border-none outline-none focus:ring-2 focus:ring-brand-500/30 placeholder:text-gray-400"
            />
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                    {user.first_name?.[0]?.toUpperCase()}
                  </div>
                  {user.first_name}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {user.role === 'customer' && (
                    <>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700">Profile</Link>
                      <Link to="/orders" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700">My Orders</Link>
                    </>
                  )}
                  {user.role === 'owner' && (
                    <Link to="/owner" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700">Dashboard</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin-panel" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700">Admin Panel</Link>
                  )}
                  <hr className="my-1 border-gray-100 dark:border-zinc-700" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-brand-500 hover:bg-red-50 dark:hover:bg-zinc-700">
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/login?tab=register"
                  className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobile(!mobileOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search restaurants or dishes..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-sm rounded-full outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4 space-y-2">
          <Link to="/restaurants" onClick={() => setMobile(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">Browse Restaurants</Link>
          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && <Link to="/orders" onClick={() => setMobile(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">My Orders</Link>}
              {user?.role === 'owner' && <Link to="/owner" onClick={() => setMobile(false)} className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</Link>}
              <button onClick={handleLogout} className="block py-2.5 text-sm font-medium text-brand-500">Sign out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobile(false)} className="block py-2.5 text-sm font-bold text-brand-500">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  )
}