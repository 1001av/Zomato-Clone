// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search} from 'lucide-react'  // removed MapPin since they are not used in this file
import api from '../api/axios'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import SkeletonCard from '../components/common/SkeletonCard'

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, c] = await Promise.all([
          api.get('/restaurants/?ordering=-avg_rating&page_size=6'),
          api.get('/restaurants/cuisines/'),
        ])
        setRestaurants(r.data.results || r.data)
        setCuisines(c.data.results || c.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand/5 via-orange-50/50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Delicious food,<br />
            <span className="text-brand">delivered fast</span>
          </h1>
          <p className="mt-4 text-gray-500 text-lg">Order from the best local restaurants with easy delivery to your door.</p>

          {/* Search Bar */}
          <div className="mt-8 flex gap-3 bg-white rounded-2xl shadow-lg p-2 border border-gray-100 max-w-xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/restaurants?search=${query}`)}
                placeholder="Search restaurants or cuisines..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => navigate(`/restaurants?search=${query}`)}
              className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Cuisines */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What's on your mind?</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {cuisines.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/restaurants?cuisine=${c.name}`)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 overflow-hidden border-2 border-transparent group-hover:border-brand transition-colors">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍴</div>
                )}
              </div>
              <span className="text-xs text-gray-600 font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Top rated near you</h2>
          <button onClick={() => navigate('/restaurants')} className="text-brand text-sm font-medium hover:underline">
            See all
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </section>
    </main>
  )
}