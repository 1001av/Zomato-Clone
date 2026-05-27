// src/pages/RestaurantsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../api/axios'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import SkeletonCard from '../components/common/SkeletonCard'

const CUISINES_LIST = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Pizza', 'Burger', 'Sushi']
const SORT_OPTIONS = [
  { value: '-avg_rating', label: 'Top Rated' },
  { value: 'delivery_time', label: 'Fastest Delivery' },
  { value: 'delivery_fee', label: 'Lowest Delivery Fee' },
  { value: '-created_at', label: 'Newest' },
]

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Initialize state directly from URL search parameters
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '')
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-avg_rating')
  const [isOpenOnly, setIsOpenOnly] = useState(searchParams.get('is_open') === 'true')

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (cuisine) params.set('cuisine', cuisine)
      if (minRating) params.set('min_rating', minRating)
      if (sortBy) params.set('ordering', sortBy)
      if (isOpenOnly) params.set('is_open', 'true')

      // Sync local state parameters back to the URL browser path
      setSearchParams(params, { replace: true })

      // FIX: Actually make the HTTP request to your Django backend endpoint
      const response = await api.get('/restaurants/', { params })
      
      // Handle standard DRF paginated structure, or default directly to an array
      if (response.data && response.data.results) {
        setRestaurants(response.data.results)
        setTotalCount(response.data.count || response.data.results.length)
      } else {
        setRestaurants(Array.isArray(response.data) ? response.data : [])
        setTotalCount(Array.isArray(response.data) ? response.data.length : 0)
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
      setRestaurants([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [search, cuisine, minRating, sortBy, isOpenOnly, setSearchParams])

  useEffect(() => {
    // Debounce processing for search inputs to prevent slamming the backend API on every keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchRestaurants()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [fetchRestaurants])

  const clearFilters = () => {
    setSearch('')
    setCuisine('')
    setMinRating('')
    setSortBy('-avg_rating')
    setIsOpenOnly(false)
  }

  const hasFilters = search || cuisine || minRating || isOpenOnly || sortBy !== '-avg_rating'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">{totalCount} restaurants found</p>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-brand text-white border-brand'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
          {/* Cuisines */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES_LIST.map((c) => (
                <button
                  key={c}
                  onClick={() => setCuisine(cuisine === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    cuisine === c
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {/* Min Rating */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Min rating</p>
              <div className="flex gap-2">
                {['3', '3.5', '4', '4.5'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? '' : r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      minRating === r
                        ? 'bg-brand text-white border-brand'
                        : 'border-gray-200 text-gray-600 hover:border-brand'
                    }`}
                  >
                    {r}★+
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Sort by</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Open now */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpenOnly}
                  onChange={(e) => setIsOpenOnly(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded"
                />
                <span className="text-sm text-gray-700">Open now only</span>
              </label>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-brand hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Cuisine quick-filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CUISINES_LIST.map((c) => (
          <button
            key={c}
            onClick={() => setCuisine(cuisine === c ? '' : c)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              cuisine === c
                ? 'bg-brand text-white border-brand'
                : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand bg-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-gray-500 text-lg font-medium">No restaurants found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-brand font-medium hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id || r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  )
}