// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from './features/auth/authSlice'

// Layout
import Navbar from './components/layout/Navbar'
import CartSidebar from './components/cart/CartSidebar'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProfilePage from './pages/ProfilePage'
import OrderHistoryPage from './pages/OrderHistoryPage'

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard'
import ManageMenuPage from './pages/owner/ManageMenuPage'
import ManageOrdersPage from './pages/owner/ManageOrdersPage'
import RestaurantSettingsPage from './pages/owner/RestaurantSettingsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Guards
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchProfile())
  }, [isAuthenticated, dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CartSidebar />
      <Routes>
        {/* Public */}
        <Route path="/"                       element={<HomePage />} />
        <Route path="/login"                  element={<LoginPage />} />
        <Route path="/register"               element={<RegisterPage />} />
        <Route path="/restaurants"            element={<RestaurantsPage />} />
        <Route path="/restaurants/:id"        element={<RestaurantDetailPage />} />

        {/* Customer */}
        <Route element={<ProtectedRoute role="customer" />}>
          <Route path="/checkout"             element={<CheckoutPage />} />
          <Route path="/payment/:orderId"     element={<PaymentPage />} />
          <Route path="/order-success/:id"    element={<OrderSuccessPage />} />
          <Route path="/orders"               element={<OrderHistoryPage />} />
          <Route path="/profile"              element={<ProfilePage />} />
        </Route>

        {/* Owner */}
        <Route element={<ProtectedRoute role="owner" />}>
          <Route path="/owner"                element={<OwnerDashboard />} />
          <Route path="/owner/menu"           element={<ManageMenuPage />} />
          <Route path="/owner/orders"         element={<ManageOrdersPage />} />
          <Route path="/owner/settings"       element={<RestaurantSettingsPage />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin-panel"          element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}