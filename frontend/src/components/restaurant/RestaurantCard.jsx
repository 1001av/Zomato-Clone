// src/components/restaurant/RestaurantCard.jsx
import { Link } from 'react-router-dom'
import { Star, Clock, Bike, Heart } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function RestaurantCard({ restaurant, badge }) {
  //const BADGE_LABELS = ['Bestseller', 'Trending', 'Fan Favourite', 'Premium', 'Vegan Friendly', 'New']
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [isFav, setIsFav] = useState(restaurant.is_favourite)

  const toggleFav = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please login to save favourites.'); return }
    try {
      await api.post(`/restaurants/${restaurant.id}/favourite/`)
      setIsFav(!isFav)
    } catch (error) {
      console.error('Error toggling favourite:', error)
      toast.error('Failed to update favourite. Please try again.')
    }
  }

  const { name, banner, cuisines, avg_rating, delivery_time, delivery_fee, is_open} = restaurant  // removed total_reviews since it's not used
  const rating = Number(avg_rating).toFixed(1)
  const ratingColor = Number(avg_rating) >= 4 ? 'bg-green-600' : Number(avg_rating) >= 3 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-zinc-700"
    >
      {/* Banner */}
      <div className="relative h-48 bg-gray-100 dark:bg-zinc-700 overflow-hidden">
        {banner ? (
          <img
            src={banner}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-100 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-5xl">
            🍽️
          </div>
        )}

        {/* Closed overlay */}
        {!is_open && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/40 px-4 py-1.5 rounded-full border border-white/20">
              Currently Closed
            </span>
          </div>
        )}

        {/* Badge top-right */}
        {badge && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {badge}
          </div>
        )}

        {/* Offer pill bottom-left */}
        {Number(delivery_fee) === 0 && (
          <div className="absolute bottom-3 left-3 bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            🏷️ Free delivery
          </div>
        )}

        {/* Favourite */}
        <button
          onClick={toggleFav}
          className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            badge ? 'hidden' : ''
          } ${isFav ? 'bg-brand-500 text-white' : 'bg-white/90 text-gray-400 hover:text-brand-500'}`}
        >
          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate mt-0.5">
              {cuisines?.map(c => c.name).join(' · ')}
            </p>
          </div>
          {/* Rating badge */}
          <div className={`shrink-0 flex items-center gap-1 ${ratingColor} text-white text-xs font-bold px-2 py-1 rounded-lg`}>
            <Star className="w-3 h-3 fill-white text-white" />
            {rating}
          </div>
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-700 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{delivery_time} min</span>
          <span className="mx-1">·</span>
          <Bike className="w-3.5 h-3.5" />
          <span>{Number(delivery_fee) === 0 ? 'Free delivery' : `₹${delivery_fee} delivery`}</span>
          <span className="ml-auto text-gray-400 dark:text-gray-500">
            {'$'.repeat(Math.min(3, Math.max(1, Math.ceil(Number(avg_rating) - 2))))}
          </span>
        </div>
      </div>
    </Link>
  )
}