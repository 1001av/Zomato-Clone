// src/components/restaurant/RestaurantCard.jsx
import { Link } from 'react-router-dom'
import { Star, Clock, Bike, Heart } from 'lucide-react'
import { useState } from 'react'
import api from '../../api/axios'
import { useSelector } from 'react-redux'

export default function RestaurantCard({ restaurant }) {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [isFav, setIsFav] = useState(restaurant.is_favourite)

  const toggleFav = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    try {
      await api.post(`/restaurants/${restaurant.id}/favourite/`)
      setIsFav(!isFav)
    } 
    catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  const { name, banner, logo, cuisines, avg_rating, delivery_time, delivery_fee, is_open } = restaurant

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* Banner */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {banner ? (
          <img src={banner} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/10 to-orange-50 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Closed overlay */}
        {!is_open && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Closed</span>
          </div>
        )}

        {/* Favourite button */}
        {isAuthenticated && (
          <button
            onClick={toggleFav}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isFav ? 'bg-brand text-white' : 'bg-white/90 text-gray-500 hover:text-brand'}`}
          >
            <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Logo */}
        {logo && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-white shadow overflow-hidden">
            <img src={logo} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate text-base">{name}</h3>
        <p className="text-gray-500 text-sm truncate mt-0.5">
          {cuisines.map((c) => c.name).join(', ')}
        </p>

        <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1 bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full text-xs">
            <Star className="w-3 h-3 fill-green-600 text-green-600" />
            {Number(avg_rating).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {delivery_time} min
          </span>
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5" />
            {Number(delivery_fee) === 0 ? 'Free delivery' : `₹${delivery_fee}`}
          </span>
        </div>
      </div>
    </Link>
  )
}