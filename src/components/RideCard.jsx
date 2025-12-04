import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

const RideCard = ({ ride, className = '' }) => {
  const formatDateTime = (date, time) => {
    try {
      const dateStr = format(new Date(date), 'EEE, MMM d')
      return `${dateStr} at ${time}`
    } catch {
      return `${date} at ${time}`
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <Link to={`/ride/${ride._id}`} className={`block ${className}`}>
      <div className="card card-hover border border-gray-200 hover:border-gray-300 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {ride.driver?.first_name?.[0]}{ride.driver?.last_name?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {ride.driver?.first_name} {ride.driver?.last_name}
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.8</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">{ride.vehicle?.make} {ride.vehicle?.model}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(ride.price_per_seat)}
            </div>
            <div className="text-sm text-gray-600">per person</div>
          </div>
        </div>

        {/* Route */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-900 font-medium">{ride.origin}</span>
          </div>
          <div className="flex items-center space-x-3 ml-1">
            <div className="w-1 h-8 bg-gray-300"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-900 font-medium">{ride.destination}</span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDateTime(ride.date, ride.time)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{ride.seats_remaining} seat{ride.seats_remaining !== 1 ? 's' : ''} left</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {ride.luggage_allowed && ride.luggage_allowed !== 'none' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {ride.luggage_allowed} luggage
              </span>
            )}
            
            {ride.seats_remaining <= 2 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                Almost full
              </span>
            )}
          </div>
          
          <div className="text-primary-600 font-medium text-sm">
            View details →
          </div>
        </div>

        {/* Notes Preview */}
        {ride.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">
              {ride.notes}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}

export default RideCard