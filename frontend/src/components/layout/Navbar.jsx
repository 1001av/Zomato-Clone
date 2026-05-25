// src/components/layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, User, LogOut, ChevronDown, UtensilsCrossed } from 'lucide-react'
import { logoutUser } from '../../features/auth/authSlice'
import { toggleCart } from '../../features/cart/cartSlice'
import { selectCartCount } from '../../features/cart/cartSlice'
import { useState } from 'react'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const cartCount = useSelector(selectCartCount)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand">
            <UtensilsCrossed className="w-6 h-6" />
            <span>FoodRush</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              onFocus={() => navigate('/restaurants')}
              readOnly
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.first_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.first_name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {user.role === 'customer' && (
                      <>
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                          Orders
                        </Link>
                      </>
                    )}
                    {user.role === 'owner' && (
                      <Link to="/owner" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin-panel" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-brand px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-brand-600 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}