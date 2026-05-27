// src/pages/RestaurantDetailPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Star, Clock, Bike, MapPin, Heart, Search,
  Plus, Minus, Flame, Leaf, X, Send, ShoppingBag,
} from 'lucide-react'
import api from '../api/axios'
import {
  addItem, removeItem, openCart,
  selectCartItems,
} from '../features/cart/cartSlice'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────
// 1. VEG / NON-VEG DOT INDICATOR
// ─────────────────────────────────────────────────────────────────
function FoodTypeDot({ type }) {
  const isVeg = type === 'veg' || type === 'vegan'
  return (
    <span
      className={`w-4 h-4 border-2 flex items-center justify-center
                  rounded-sm shrink-0
                  ${isVeg ? 'border-green-600' : 'border-red-600'}`}
    >
      <span
        className={`w-2 h-2 rounded-full
                    ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}
      />
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────
// 2. QUANTITY STEPPER  (+  count  -)
// ─────────────────────────────────────────────────────────────────
function QuantityStepper({ count, onAdd, onRemove }) {
  return (
    <div className="flex items-center rounded-xl border-2 border-brand-500 overflow-hidden">
      <button
        onClick={onRemove}
        className="w-8 h-8 flex items-center justify-center
                   text-brand-500 hover:bg-brand-500 hover:text-white
                   transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-bold text-brand-500">
        {count}
      </span>
      <button
        onClick={onAdd}
        className="w-8 h-8 flex items-center justify-center
                   text-brand-500 hover:bg-brand-500 hover:text-white
                   transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 3. PAGE SKELETON LOADER
// ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5 animate-pulse">
      <div className="h-56 bg-gray-200 rounded-2xl" />
      <div className="h-5  bg-gray-200 rounded w-1/3" />
      <div className="h-4  bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────
// 4. SINGLE MENU ITEM CARD
// ─────────────────────────────────────────────────────────────────
function MenuItemCard({ item, restaurantId, restaurantName, isClosed }) {
  const dispatch  = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const { isAuthenticated } = useSelector((s) => s.auth)

  // Find this item in the cart (if any) to show quantity
  const cartItem = cartItems.find((i) => i.id === item.id)
  const qty      = cartItem?.quantity ?? 0

  // Snapshot of data to store in cart
  const itemPayload = {
    id:           item.id,
    name:         item.name,
    price:        Number(item.price),
    image:        item.image || null,
    restaurantId,
  }

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items.')
      return
    }
    if (isClosed) {
      toast.error('This restaurant is currently closed.')
      return
    }
    dispatch(addItem({ item: itemPayload, restaurantId, restaurantName }))
    // Only open cart sidebar on the FIRST add
    if (qty === 0) dispatch(openCart())
    toast.success(`${item.name} added!`, { duration: 1500 })
  }

  const handleRemove = () => dispatch(removeItem(item.id))

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0 group">

      {/* ── Left: text info ── */}
      <div className="flex-1 min-w-0">

        {/* Badges row */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <FoodTypeDot type={item.food_type} />

          {item.is_bestseller && (
            <span className="text-xs font-semibold text-amber-600
                             bg-amber-50 border border-amber-200
                             px-2 py-0.5 rounded-full
                             flex items-center gap-1">
              <Flame className="w-3 h-3" /> Bestseller
            </span>
          )}

          {item.food_type === 'vegan' && (
            <span className="text-xs font-semibold text-green-700
                             bg-green-50 border border-green-200
                             px-2 py-0.5 rounded-full
                             flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Vegan
            </span>
          )}

          {!item.is_available && (
            <span className="text-xs font-medium text-gray-400
                             bg-gray-100 px-2 py-0.5 rounded-full">
              Unavailable
            </span>
          )}
        </div>

        <h4 className="font-semibold text-gray-900 text-sm leading-snug">
          {item.name}
        </h4>
        <p className="text-brand-500 font-bold text-sm mt-1">
          ₹{Number(item.price).toFixed(0)}
        </p>

        {item.description && (
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
        {item.calories && (
          <p className="text-gray-400 text-xs mt-1">{item.calories} kcal</p>
        )}
      </div>

      {/* ── Right: image + add button ── */}
      <div className="flex flex-col items-center gap-2 shrink-0 w-24">

        {/* Item image / emoji fallback */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 relative">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover
                         group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          {/* Fallback shown when no image or image fails */}
          <div
            className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50
                        flex items-center justify-center text-3xl"
            style={{ display: item.image ? 'none' : 'flex' }}
          >
            🍽️
          </div>
        </div>

        {/* ADD button or quantity stepper */}
        {item.is_available ? (
          qty > 0 ? (
            <QuantityStepper
              count={qty}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-white border-2 border-brand-500
                         text-brand-500 text-xs font-bold rounded-xl
                         hover:bg-brand-500 hover:text-white
                         transition-colors active:scale-95"
            >
              ADD
            </button>
          )
        ) : (
          <span className="text-xs text-gray-400 border border-gray-200
                           px-3 py-1.5 rounded-xl">
            Sold out
          </span>
        )}
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────
// 5. STAR RATING INPUT
// ─────────────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className="w-6 h-6"
            fill={(hover || value) >= star ? '#f59e0b' : 'none'}
            stroke={(hover || value) >= star ? '#f59e0b' : '#d1d5db'}
          />
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 6. REVIEWS PANEL  (list + write-a-review form)
// ─────────────────────────────────────────────────────────────────
function ReviewsPanel({ restaurantId, reviews, setReviews }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  const [rating,      setRating]      = useState(0)
  const [comment,     setComment]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  // Check if THIS user already left a review
  const alreadyReviewed = reviews.some(
    (r) => r.customer?.id === user?.id
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0)    { toast.error('Please select a star rating.'); return }
    if (!comment.trim()) { toast.error('Please write a short comment.'); return }

    setSubmitting(true)
    try {
      await api.post(`/reviews/${restaurantId}/create/`, { rating, comment })

      // Optimistically prepend to list
      setReviews((prev) => [
        {
          id:         Date.now(),          // temp id
          customer:   {
            id:         user?.id,
            first_name: user?.first_name,
            full_name:  user?.full_name || user?.first_name || 'You',
          },
          rating,
          comment,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])

      toast.success('Review submitted — thank you! 🎉')
      setRating(0)
      setComment('')
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Failed to submit review.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Ratings & Reviews</h2>
        <span className="text-xs text-gray-400">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Write review form — only for logged-in users who haven't reviewed yet */}
      {isAuthenticated && !alreadyReviewed && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-700">Write a review</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl p-3
                       resize-none focus:outline-none
                       focus:ring-2 focus:ring-brand-500/30
                       focus:border-brand-500 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600
                       disabled:opacity-60 text-white text-sm
                       font-semibold py-2.5 rounded-xl transition-colors
                       flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Already reviewed notice */}
      {isAuthenticated && alreadyReviewed && (
        <div className="text-xs text-green-700 bg-green-50 border border-green-100
                         rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" />
          You have already reviewed this restaurant.
        </div>
      )}

      {/* Not logged in */}
      {!isAuthenticated && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl
                       px-4 py-3 text-center">
          <a href="/login" className="text-brand-500 font-medium hover:underline">
            Log in
          </a>{' '}
          to write a review.
        </p>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No reviews yet. Be the first!
          </p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="flex gap-3 pb-4 border-b border-gray-100
                          last:border-0 last:pb-0"
            >
              {/* Avatar initial */}
              <div className="w-8 h-8 rounded-full bg-brand-500/10
                               flex items-center justify-center
                               text-brand-500 font-bold text-sm shrink-0">
                {r.customer?.first_name?.[0]?.toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {r.customer?.full_name ||
                     r.customer?.first_name ||
                     'Anonymous'}
                  </span>
                  {/* Green rating pill */}
                  <span className="ml-auto flex items-center gap-0.5 text-xs
                                    font-semibold text-white bg-green-600
                                    px-2 py-0.5 rounded-full shrink-0">
                    <Star className="w-3 h-3 fill-white" /> {r.rating}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {r.comment}
                </p>
                <p className="text-gray-400 text-xs mt-1.5">
                  {new Date(r.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────
// 7. MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function RestaurantDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const dispatch     = useDispatch()
  const cartItems    = useSelector(selectCartItems)
  const { isAuthenticated } = useSelector((s) => s.auth)

  const [restaurant,     setRestaurant]     = useState(null)
  const [reviews,        setReviews]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [isFav,          setIsFav]          = useState(false)
  const [menuSearch,     setMenuSearch]     = useState('')
  const [vegOnly,        setVegOnly]        = useState(false)

  // Refs for smooth-scroll to category sections
  const categoryRefs = useRef({})

  // ── Fetch restaurant + reviews ────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [rRes, revRes] = await Promise.all([
          api.get(`/restaurants/${id}/`),
          api.get(`/reviews/${id}/`),
        ])
        setRestaurant(rRes.data)
        setIsFav(rRes.data.is_favourite)
        const revList = revRes.data.results ?? revRes.data
        setReviews(revList)
        // Default active category = first one
        if (rRes.data.categories?.length) {
          setActiveCategory(rRes.data.categories[0].id)
        }
      } catch {
        toast.error('Failed to load restaurant details.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // ── Toggle favourite ──────────────────────────────────────────
  const toggleFav = async () => {
    if (!isAuthenticated) {
      toast.error('Log in to save favourites.')
      return
    }
    try {
      await api.post(`/restaurants/${id}/favourite/`)
      setIsFav((f) => !f)
      toast.success(isFav ? 'Removed from favourites' : 'Saved to favourites ❤️')
    } catch {
      toast.error('Could not update favourites.')
    }
  }

  // ── Smooth scroll to a category section ──────────────────────
  const scrollToCategory = (catId) => {
    setActiveCategory(catId)
    const el = categoryRefs.current[catId]
    if (el) {
      // 120px offset accounts for sticky navbar + tabs
      const top = el.getBoundingClientRect().top + window.scrollY - 120
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  // ── Cart summary (only for THIS restaurant) ───────────────────
  const cartRestId    = useSelector((s) => s.cart.restaurantId)
  const cartForThis   = cartRestId === restaurant?.id ? cartItems : []
  const cartItemCount = cartForThis.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal     = cartForThis.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // ── Build filtered menu sections ──────────────────────────────
  const itemsByCategory = (restaurant?.categories ?? []).map((cat) => ({
    ...cat,
    items: (restaurant?.menu_items ?? [])
      .filter((item) => item.category === cat.id)
      .filter((item) =>
        !vegOnly ||
        item.food_type === 'veg' ||
        item.food_type === 'vegan'
      )
      .filter((item) =>
        !menuSearch ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase())
      ),
  }))

  // ── Guards ────────────────────────────────────────────────────
  if (loading) return <DetailSkeleton />

  if (!restaurant) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400 text-lg">Restaurant not found.</p>
        <button
          onClick={() => navigate('/restaurants')}
          className="mt-4 text-brand-500 hover:underline text-sm"
        >
          ← Back to restaurants
        </button>
      </div>
    )
  }
  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28">

      {/* ── BANNER ─────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-64 rounded-2xl overflow-hidden bg-gray-100 mb-6">
        {restaurant.banner ? (
          <img
            src={restaurant.banner}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-100
                           flex items-center justify-center text-8xl">
            🍽️
          </div>
        )}

        {/* Favourite heart */}
        <button
          onClick={toggleFav}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg
                      backdrop-blur-sm transition-all
                      ${isFav
                        ? 'bg-brand-500 text-white shadow-brand-500/30'
                        : 'bg-white/90 text-gray-500 hover:text-brand-500'}`}
        >
          <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Closed overlay */}
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm
                           flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold
                              px-6 py-2 rounded-full text-sm shadow-lg">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* ── TWO-COLUMN GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ LEFT COLUMN: Info + Menu ══════════════════════════ */}
        <div className="lg:col-span-2 space-y-5">

          {/* Restaurant info card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {restaurant.logo && (
                <img
                  src={restaurant.logo}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover
                              border border-gray-100 shadow-sm shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    {restaurant.name}
                  </h1>
                  {/* Open / Closed pill */}
                  <span
                    className={`shrink-0 text-xs font-semibold
                                 px-2.5 py-1 rounded-full
                                 ${restaurant.is_open
                                   ? 'bg-green-50 text-green-700 border border-green-200'
                                   : 'bg-red-50 text-red-600 border border-red-200'}`}
                  >
                    {restaurant.is_open ? '● Open' : '● Closed'}
                  </span>
                </div>

                {restaurant.cuisines?.length > 0 && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    {restaurant.cuisines.map((c) => c.name).join(' · ')}
                  </p>
                )}
                {restaurant.description && (
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {restaurant.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats pills row */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
              {/* Rating */}
              <div className="flex items-center gap-1.5 bg-green-600 text-white
                               text-xs font-bold px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-white" />
                {Number(restaurant.avg_rating).toFixed(1)}
                <span className="font-normal opacity-80">
                  ({restaurant.total_reviews})
                </span>
              </div>
              {/* Delivery time */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600
                               bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Clock className="w-4 h-4 text-gray-400" />
                {restaurant.delivery_time} min
              </div>
              {/* Delivery fee */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600
                               bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Bike className="w-4 h-4 text-gray-400" />
                {Number(restaurant.delivery_fee) === 0
                  ? 'Free delivery'
                  : `₹${Number(restaurant.delivery_fee).toFixed(0)} delivery`}
              </div>
              {/* City */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600
                               bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400" />
                {restaurant.city}
              </div>
              {/* Min order */}
              {Number(restaurant.min_order) > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600
                                 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  Min order ₹{Number(restaurant.min_order).toFixed(0)}
                </div>
              )}
            </div>
          </div>

          {/* ── SEARCH + VEG FILTER ────────────────────────────── */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                  w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu items…"
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-white
                           border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2
                           focus:ring-brand-500/30 focus:border-brand-500
                           placeholder-gray-400"
              />
              {menuSearch && (
                <button
                  onClick={() => setMenuSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                              text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Veg-only toggle */}
            <button
              onClick={() => setVegOnly((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5
                           rounded-xl border text-sm font-medium
                           transition-colors shrink-0
                           ${vegOnly
                             ? 'bg-green-600 text-white border-green-600'
                             : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-600'}`}
            >
              <Leaf className="w-4 h-4" /> Veg
            </button>
          </div>

          {/* ── CATEGORY TABS ──────────────────────────────────── */}
          {restaurant.categories?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {restaurant.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm
                               font-medium border transition-all
                               ${activeCategory === cat.id
                                 ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                                 : 'border-gray-200 text-gray-600 bg-white hover:border-brand-500 hover:text-brand-500'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* ── MENU SECTIONS ──────────────────────────────────── */}
          <div className="space-y-4">
            {itemsByCategory.every((c) => c.items.length === 0) ? (
              <div className="bg-white rounded-2xl border border-gray-100
                               p-10 text-center">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="text-gray-500 font-medium">No items found.</p>
                {(menuSearch || vegOnly) && (
                  <button
                    onClick={() => { setMenuSearch(''); setVegOnly(false) }}
                    className="mt-2 text-brand-500 text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              itemsByCategory.map((cat) => {
                // Hide categories with 0 items after filtering
                if (cat.items.length === 0) return null
                return (
                  <div
                    key={cat.id}
                    ref={(el) => { categoryRefs.current[cat.id] = el }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  >
                    {/* Category header */}
                    <div className="px-5 pt-5 pb-3 border-b border-gray-50">
                      <h3 className="font-bold text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cat.items.length} item{cat.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Items list */}
                    <div className="px-5">
                      {cat.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                          isClosed={!restaurant.is_open}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT COLUMN: Reviews ═════════════════════════════ */}
        <div>
          <ReviewsPanel
            restaurantId={restaurant.id}
            reviews={reviews}
            setReviews={setReviews}
          />
        </div>
      </div>

      {/* ── FLOATING CART BAR ──────────────────────────────────── */}
      {/* Shows at the bottom when items from THIS restaurant are in cart */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                         w-full max-w-sm px-4">
          <button
            onClick={() => dispatch(openCart())}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white
                        font-bold py-4 px-5 rounded-2xl
                        shadow-xl shadow-brand-500/30
                        flex items-center justify-between
                        transition-all active:scale-95"
          >
            <span className="bg-brand-700 text-white text-xs font-bold
                              px-2.5 py-1 rounded-lg">
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" />
              View Cart
            </span>
            <span className="text-sm font-bold">
              ₹{cartTotal.toFixed(0)}
            </span>
          </button>
        </div>
      )}

    </div>
  )
}