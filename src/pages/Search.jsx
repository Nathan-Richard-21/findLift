import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaDollarSign, FaClock, FaStar, FaFilter, FaUserPlus, FaCar } from 'react-icons/fa'
import { ridesService } from '../services'
import { useAuth } from '../App'

const Search = () => {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useState({
    departure_city: '',
    destination_city: '',
    departure_date: '',
    passengers: 1
  })
  const [filters, setFilters] = useState({
    max_price: '',
    departure_time: '',
    sort_by: 'departure_time'
  })
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Get search params from URL if coming from home page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('from')) {
      setSearchParams(prev => ({
        ...prev,
        departure_city: urlParams.get('from') || '',
        destination_city: urlParams.get('to') || '',
        departure_date: urlParams.get('date') || '',
        passengers: parseInt(urlParams.get('passengers')) || 1
      }))
    }
  }, [])

  // Search rides using React Query
  const { data: ridesData, isLoading, error, refetch } = useQuery({
    queryKey: ['rides', searchParams],
    queryFn: () => ridesService.searchRides({
      departure_city: searchParams.departure_city,
      destination_city: searchParams.destination_city,
      departure_date: searchParams.departure_date,
      passengers: searchParams.passengers,
      ...filters
    }),
    enabled: !!(searchParams.departure_city && searchParams.destination_city),
    onError: (error) => {
      console.error('Search error:', error)
      alert('Failed to search rides. Please try again.')
    }
  })

  const rides = ridesData?.data?.rides || []

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    })
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    refetch()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Signup Banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-white mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Join Our Community!</h2>
                <p className="text-green-50">Create an account to book rides, save your favorite routes, and get exclusive offers</p>
              </div>
              <Link
                to="/auth/signup"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2 whitespace-nowrap"
              >
                <FaUserPlus />
                <span>Sign Up to Find Rides</span>
              </Link>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Ride</h1>
          
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="departure_city"
                    value={searchParams.departure_city}
                    onChange={handleSearchChange}
                    placeholder="Departure city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="destination_city"
                    value={searchParams.destination_city}
                    onChange={handleSearchChange}
                    placeholder="Destination city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="departure_date"
                    value={searchParams.departure_date}
                    onChange={handleSearchChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passengers
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="passengers"
                    value={searchParams.passengers}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search Rides'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center justify-center"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    name="max_price"
                    value={filters.max_price}
                    onChange={handleFilterChange}
                    placeholder="Maximum price per seat"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time
                  </label>
                  <select
                    name="departure_time"
                    value={filters.departure_time}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any time</option>
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 12AM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    name="sort_by"
                    value={filters.sort_by}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="departure_time">Departure Time</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Driver Rating</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for rides...</p>
            </div>
          ) : rides.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {rides.length} ride{rides.length !== 1 ? 's' : ''} found
                </h2>
                <p className="text-gray-600">
                  {searchParams.departure_city} → {searchParams.destination_city}
                </p>
              </div>

              <div className="space-y-4">
                {rides.map((ride) => (
                  <div key={ride._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Driver Info - Hidden for Privacy */}
                      <div className="flex items-center mb-4 lg:mb-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full mr-4 flex items-center justify-center">
                          <FaCar className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Verified Driver
                          </h3>
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{ride.driver.rating || '5.0'}</span>
                            <span className="text-gray-500 text-sm ml-1">
                              ({ride.driver.reviews_count || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ride Details */}
                      <div className="flex-1 lg:mx-8">
                        {/* Route with Addresses */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{ride.departure_city}</div>
                              <div className="text-sm text-gray-600">{ride.departure_address}</div>
                            </div>
                          </div>
                          <div className="ml-1 w-0.5 h-6 bg-gray-300 mb-2"></div>
                          <div className="flex items-start">
                            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{ride.destination_city}</div>
                              <div className="text-sm text-gray-600">{ride.destination_address}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-2" />
                            <span>{ride.departure_time}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaUsers className="mr-2" />
                            <span>{ride.available_seats} seats</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaDollarSign className="mr-2" />
                            <span>R{ride.price_per_seat}/seat</span>
                          </div>
                          <div className="text-gray-600">
                            <span>{ride.estimated_duration}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Vehicle:</strong> {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model}
                        </div>

                        {ride.stops && ride.stops.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Stops:</strong> {ride.stops.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Book Button */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          R{ride.price_per_seat * searchParams.passengers}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          for {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
                        </p>
                        <Link
                          to={`/ride/${ride._id}`}
                          className="btn-primary w-full lg:w-auto"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : searchParams.departure_city && searchParams.destination_city ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later for new rides.
              </p>
              <Link to="/offer" className="btn-primary">
                Offer a Ride Instead
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
              <p className="text-gray-600">
                Enter your departure and destination cities to find available rides.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search