import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Star, Clock, Bike, MapPin, Heart } from 'lucide-react'
import api from '../api/axios'
import { addItem, openCart } from '../features/cart/cartSlice'
import toast from 'react-hot-toast'

function MenuItemCard({ item, restaurantId, restaurantName }) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((s) => s.auth)

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart.')
      return
    }
    dispatch(addItem({
      item: {
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        restaurantId,
      },
      restaurantId,
      restaurantName,
    }))
    dispatch(openCart())
    toast.success(`${item.name} added to cart`)
  }

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Veg/Non-veg indicator */}
          <span className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm shrink-0 ${item.food_type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${item.food_type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
          {item.is_bestseller && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Bestseller</span>
          )}
        </div>
        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
        <p className="text-brand font-semibold text-sm mt-0.5">₹{Number(item.price).toFixed(2)}</p>
        {item.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
        {item.calories && <p className="text-gray-400 text-xs mt-1">{item.calories} cal</p>}
      </div>

      <div className="flex flex-col items-center gap-2 shrink-0">
        {item.image && (
          <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
        )}
        {item.is_available ? (
          <button
            onClick={handleAdd}
            className="px-4 py-1.5 bg-white border-2 border-brand text-brand text-sm font-semibold rounded-xl hover:bg-brand hover:text-white transition-colors"
          >
            ADD
          </button>
        ) : (
          <span className="px-4 py-1.5 border border-gray-200 text-gray-400 text-xs rounded-xl">Unavailable</span>
        )}
      </div>
    </div>
  )
}

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [isFav, setIsFav] = useState(false)
  const { isAuthenticated } = useSelector((s) => s.auth)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, rev] = await Promise.all([
          api.get(`/restaurants/${id}/`),
          api.get(`/reviews/${id}/`),
        ])
        setRestaurant(r.data)
        setIsFav(r.data.is_favourite)
        setReviews(rev.data.results || rev.data)
        if (r.data.categories?.length) setActiveCategory(r.data.categories[0].id)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const toggleFav = async () => {
    if (!isAuthenticated) return
    try {
      await api.post(`/restaurants/${id}/favourite/`)
      setIsFav(!isFav)
      toast.success(isFav ? 'Removed from favourites' : 'Added to favourites')
    } catch (error) {
      console.error('Failed to toggle favourite:', error)
      toast.error('Failed to update favourite status.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-56 bg-gray-200 rounded-2xl animate-skeleton" />
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-skeleton" />
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-skeleton" />
      </div>
    )
  }

  if (!restaurant) return <div className="text-center py-20 text-gray-500">Restaurant not found.</div>

  const itemsByCategory = restaurant.categories?.map((cat) => ({
    ...cat,
    items: restaurant.menu_items?.filter((item) => item.category === cat.id) || [],
  })) || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Banner */}
      <div className="relative h-56 rounded-2xl overflow-hidden bg-gray-100 mb-5">
        {restaurant.banner ? (
          <img src={restaurant.banner} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/10 to-orange-50 flex items-center justify-center text-6xl">🍽️</div>
        )}
        <button
          onClick={toggleFav}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-colors ${isFav ? 'bg-brand text-white' : 'bg-white text-gray-500 hover:text-brand'}`}
        >
          <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Info + Menu */}
        <div className="lg:col-span-2">
          {/* Restaurant info */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
            <div className="flex items-start gap-4">
              {restaurant.logo && (
                <img src={restaurant.logo} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {restaurant.cuisines?.map((c) => c.name).join(', ')}
                </p>
                {restaurant.description && (
                  <p className="text-gray-600 text-sm mt-2">{restaurant.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                {Number(restaurant.avg_rating).toFixed(1)} ({restaurant.total_reviews} reviews)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" /> {restaurant.delivery_time} min
              </span>
              <span className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-gray-400" />
                {Number(restaurant.delivery_fee) === 0 ? 'Free delivery' : `₹${restaurant.delivery_fee} delivery`}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> {restaurant.city}
              </span>
            </div>

            {!restaurant.is_open && (
              <div className="mt-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                ⚠️ This restaurant is currently closed
              </div>
            )}
          </div>

          {/* Category tabs */}
          {restaurant.categories?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {restaurant.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat.id ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand bg-white'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu items */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {itemsByCategory.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No menu items available.</p>
            ) : (
              itemsByCategory
                .filter((cat) => !activeCategory || cat.id === activeCategory)
                .map((cat) => (
                  <div key={cat.id}>
                    <div className="px-5 pt-4 pb-2">
                      <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-400">{cat.items.length} items</p>
                    </div>
                    <div className="px-5">
                      {cat.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                        />
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right — Reviews */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold">
                        {r.customer.first_name?.[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{r.customer.full_name}</span>
                      <span className="ml-auto flex items-center gap-0.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-green-600 text-green-600" /> {r.rating}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{r.comment}</p>
                    <p className="text-gray-400 text-xs mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}