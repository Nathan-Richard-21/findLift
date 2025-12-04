import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, Users, MapPin } from 'lucide-react'
import { format } from 'date-fns'

const SearchCard = ({ onSearch, className = '' }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    seats: 1
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create search params
    const searchParams = new URLSearchParams()
    if (formData.origin) searchParams.append('origin', formData.origin)
    if (formData.destination) searchParams.append('destination', formData.destination)
    if (formData.date) searchParams.append('date', formData.date)
    if (formData.seats) searchParams.append('seats', formData.seats.toString())
    
    // If onSearch callback provided, use it, otherwise navigate
    if (onSearch) {
      onSearch(formData)
    } else {
      navigate(`/search?${searchParams.toString()}`)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className={`card ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Cape Town, WC"
                className="input pl-11"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Johannesburg, GP"
                className="input pl-11"
                required
              />
            </div>
          </div>
        </div>

        {/* Date and Seats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                className="input pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-2">
              Passengers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="seats"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="input pl-11"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} passenger{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full btn btn-primary flex items-center justify-center space-x-2 py-4"
        >
          <Search className="w-5 h-5" />
          <span className="font-semibold">Search rides</span>
        </button>
      </form>
    </div>
  )
}

export default SearchCard