import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../App'
import { ridesService } from '../services/ridesService'
import { vehiclesService } from '../services/vehiclesService'
import { kycService } from '../services/kycService'
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaDollarSign, FaCar, FaPlus, FaMinus, FaHourglassHalf, FaCheckCircle } from 'react-icons/fa'

const OfferRide = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    departure_city: '',
    departure_address: '',
    destination_city: '',
    destination_address: '',
    departure_date: '',
    departure_time: '',
    available_seats: 4,
    price_per_seat: '',
    description: '',
    vehicle_id: '',
    stops: [],
    smoking_allowed: false,
    pets_allowed: false,
    music_preferences: 'no_preference',
    luggage_size: 'medium'
  })
  const [newStop, setNewStop] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch user's vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesService.getUserVehicles,
    enabled: isAuthenticated
  })

  // Fetch verification status for drivers
  const { data: verificationStatus, isLoading: verificationLoading } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: () => kycService.getVerificationStatus(),
    enabled: isAuthenticated && user?.role === 'driver',
    retry: false
  })

  // ==================== CRITICAL DEBUG LOGGING ====================
  console.log('🔍 === OFFER RIDE DEBUG START ===');
  console.log('🔍 User Object:', user);
  console.log('🔍 User Role:', user?.role);
  console.log('🔍 User Driver Profile:', user?.driverProfile);
  console.log('🔍 Driver Profile is_verified:', user?.driverProfile?.is_verified);
  console.log('🔍 Is Authenticated:', isAuthenticated);
  console.log('🔍 Verification Loading:', verificationLoading);
  console.log('🔍 Verification Status Response:', verificationStatus);
  console.log('🔍 Verification Status Data:', verificationStatus?.data);
  console.log('🔍 Verification Object:', verificationStatus?.data?.verification);
  console.log('🔍 Verification Status Status:', verificationStatus?.data?.verification?.status);
  console.log('🔍 Condition Check: user exists?', !!user);
  console.log('🔍 Condition Check: user.role === driver?', user?.role === 'driver');
  console.log('🔍 Condition Check: driverProfile exists?', !!user?.driverProfile);
  console.log('🔍 Condition Check: is_verified === false?', user?.driverProfile?.is_verified === false);
  console.log('🔍 Should show form?', !(user && user.role === 'driver' && user.driverProfile && !user.driverProfile.is_verified));
  console.log('🔍 === OFFER RIDE DEBUG END ===');
  // =================================================================

  // Validation functions
  const validateForm = () => {
    const errors = {}

    // Origin validation (departure_city + departure_address)
    if (!formData.departure_city || formData.departure_city.trim().length < 2) {
      errors.origin = 'Departure city is required and must be at least 2 characters'
    }
    
    if (!formData.departure_address || formData.departure_address.trim().length < 3) {
      errors.origin = errors.origin ? errors.origin + '; Departure address is required' : 'Departure address is required and must be at least 3 characters'
    }
    
    const origin = `${formData.departure_city}, ${formData.departure_address}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '')
    if (origin.length > 200) {
      errors.origin = 'Departure location must not exceed 200 characters'
    }

    // Destination validation (destination_city + destination_address)
    if (!formData.destination_city || formData.destination_city.trim().length < 2) {
      errors.destination = 'Destination city is required and must be at least 2 characters'
    }
    
    if (!formData.destination_address || formData.destination_address.trim().length < 3) {
      errors.destination = errors.destination ? errors.destination + '; Destination address is required' : 'Destination address is required and must be at least 3 characters'
    }
    
    const destination = `${formData.destination_city}, ${formData.destination_address}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '')
    if (destination.length > 200) {
      errors.destination = 'Destination must not exceed 200 characters'
    }

    // Date validation
    if (!formData.departure_date) {
      errors.departure_date = 'Departure date is required'
    } else {
      const rideDate = new Date(formData.departure_date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (rideDate < today) {
        errors.departure_date = 'Departure date cannot be in the past'
      }
    }

    // Time validation
    if (!formData.departure_time) {
      errors.departure_time = 'Departure time is required'
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.departure_time)) {
      errors.departure_time = 'Time must be in HH:MM format'
    }

    // Price validation
    if (!formData.price_per_seat) {
      errors.price_per_seat = 'Price per seat is required'
    } else {
      const price = parseFloat(formData.price_per_seat)
      if (isNaN(price) || price < 1 || price > 5000) {
        errors.price_per_seat = 'Price per seat must be between R1 and R5000'
      }
    }

    // Seats validation
    const seats = parseInt(formData.available_seats)
    if (isNaN(seats) || seats < 1 || seats > 6) {
      errors.available_seats = 'Available seats must be between 1 and 6'
    }

    // Vehicle validation
    if (!formData.vehicle_id) {
      errors.vehicle_id = 'Please select a vehicle'
    }

    // Description/notes validation (optional but has max length)
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters'
    }

    return errors
  }

  // Helper component for error display
  const ErrorMessage = ({ error, className = "" }) => {
    if (!error) return null
    return (
      <div className={`text-red-500 text-sm mt-1 ${className}`}>
        {error}
      </div>
    )
  }

  // Create ride mutation
  const createRideMutation = useMutation({
    mutationFn: ridesService.createRide,
    onSuccess: () => {
      setIsSubmitting(false)
      queryClient.invalidateQueries(['rides'])
      navigate('/driver-dashboard')
    },
    onError: (error) => {
      setIsSubmitting(false)
      console.error('Failed to create ride offer:', error)
      
      // Show specific validation errors if available
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.message).join('\n')
        alert(`Validation errors:\n${errorMessages}`)
      } else {
        alert('Failed to create ride offer. Please try again.')
      }
    }
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Clear origin/destination errors when relevant fields change
    if (name === 'departure_city' || name === 'departure_address') {
      setValidationErrors(prev => ({ ...prev, origin: '' }))
    }
    if (name === 'destination_city' || name === 'destination_address') {
      setValidationErrors(prev => ({ ...prev, destination: '' }))
    }
  }

  const handleSeatChange = (increment) => {
    const maxSeats = vehicles.find(v => v._id === formData.vehicle_id)?.seats || 8
    const newSeats = formData.available_seats + increment
    if (newSeats >= 1 && newSeats <= maxSeats - 1) { // -1 for driver seat
      setFormData({
        ...formData,
        available_seats: newSeats
      })
    }
  }

  const addStop = () => {
    if (newStop.trim() && !formData.stops.includes(newStop.trim())) {
      setFormData({
        ...formData,
        stops: [...formData.stops, newStop.trim()]
      })
      setNewStop('')
    }
  }

  const removeStop = (index) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== index)
    })
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      // Store form data and redirect to auth
      localStorage.setItem('pendingRideOffer', JSON.stringify(formData))
      navigate('/auth?redirect=offer-ride')
      return
    }

    // Validate form before submitting
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                          document.querySelector(`.error-${firstErrorField}`)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)
    
    // Transform form data to match API expectations
    const rideData = {
      ...formData,
      preferences: {
        smoking_allowed: formData.smoking_allowed,
        pets_allowed: formData.pets_allowed,
        music_preferences: formData.music_preferences,
        luggage_size: formData.luggage_size
      }
    }

    // Remove individual preference fields from the main object (keep date/time)
    delete rideData.smoking_allowed
    delete rideData.pets_allowed
    delete rideData.music_preferences
    delete rideData.luggage_size

    createRideMutation.mutate(rideData)
  }

  const steps = [
    { number: 1, title: 'Route Details', description: 'Where are you going?' },
    { number: 2, title: 'Trip Preferences', description: 'Set your preferences' },
    { number: 3, title: 'Review & Publish', description: 'Review and publish your ride' }
  ]

  // Loading state for verification check
  if (isAuthenticated && user?.role === 'driver' && verificationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHourglassHalf className="text-5xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking verification status...</p>
        </div>
      </div>
    )
  }

  // Check if user is not authenticated OR is a rider (not a driver)
  if (!isAuthenticated || (user && user.role === 'rider')) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <FaCar className="text-4xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Become a Driver
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Start earning by offering rides on your route. Join thousands of drivers already sharing their journeys!
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/driver/signup')}
                className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Sign Up as Driver
              </button>
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/auth?mode=login')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is a driver - regardless of driverProfile existence
  // We check verification status directly from the verificationStatus API response
  if (user && user.role === 'driver') {
    // Debug logging
    console.log('🔴 DRIVER USER DETECTED - Checking Verification Status');
    console.log('🔴 Verification Status Data:', verificationStatus);
    console.log('🔴 Verification Status:', verificationStatus?.data?.verification?.status);
    console.log('🔴 Driver Profile is_verified:', user.driverProfile?.is_verified);
    
    const verStatus = verificationStatus?.data?.verification?.status;
    const isVerified = user.driverProfile?.is_verified === true;
    const verData = verificationStatus?.data;
    
    // Check if verification is complete (has all required documents submitted)
    // Be more flexible with checking - just check if the objects exist
    const hasCompletedVerification = verData && 
      (verData.documents?.selfie?.image || verData.documents?.selfie) && 
      (verData.documents?.idDocument?.frontImage || verData.documents?.idDocument) &&
      (verData.documents?.driverLicense?.frontImage || verData.documents?.driverLicense) &&
      (verData.documents?.vehicle?.frontImage || verData.documents?.vehicle);
    
    console.log('🔴 Has completed verification?', hasCompletedVerification);
    console.log('🔴 Documents:', {
      selfie: !!(verData?.documents?.selfie?.image || verData?.documents?.selfie),
      idFront: !!(verData?.documents?.idDocument?.frontImage || verData?.documents?.idDocument),
      licenseFront: !!(verData?.documents?.driverLicense?.frontImage || verData?.documents?.driverLicense),
      vehicleFront: !!(verData?.documents?.vehicle?.frontImage || verData?.documents?.vehicle)
    });
    console.log('🔴 Full documents object:', verData?.documents);
    
    // If they have an approved verification, allow them to offer rides
    if (verStatus === 'approved' || isVerified) {
      console.log('✅ DRIVER IS VERIFIED - Showing offer form');
      // Continue to form below
    }
    // Check if verification exists, is complete, AND is pending admin review
    else if (hasCompletedVerification && (verStatus === 'under_review' || verStatus === 'pending')) {
      console.log('⏳ VERIFICATION PENDING - Showing waiting page');
      return (
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <FaHourglassHalf className="text-5xl animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  Verification Under Review
                </h1>
                <p className="text-blue-100 text-lg">
                  Your documents are being verified by our admin team
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Status Message */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <FaCheckCircle className="text-blue-600 text-2xl mt-1" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Thank you for completing the verification process!
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Our admin team is currently reviewing your submitted documents. This process typically takes <strong>24-48 hours</strong>. You'll receive an email notification once your verification is approved.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      Verification Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="text-green-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">Documents Submitted</p>
                          <p className="text-sm text-gray-600">Your verification documents have been received</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                          <FaHourglassHalf className="text-blue-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">Admin Review</p>
                          <p className="text-sm text-gray-600">Currently being reviewed by our admin team</p>
                        </div>
                      </div>
                      <div className="flex items-start opacity-50">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaCar className="text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">Start Offering Rides</p>
                          <p className="text-sm text-gray-600">Available once verification is approved</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What's Next */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-3">While You Wait...</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Set up your profile and add your vehicle information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Familiarize yourself with our platform and policies</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Check your email regularly for updates</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/driver-dashboard')}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/vehicles')}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Manage Vehicles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    // Check if verification is rejected
    else if (verStatus === 'rejected') {
      console.log('❌ VERIFICATION REJECTED - Showing rejection page');
      return (
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <FaCar className="text-4xl text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Verification Not Approved
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Unfortunately, your verification documents could not be approved.
                </p>
                {verificationStatus?.data?.verification?.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-red-900 mb-1">Reason:</p>
                    <p className="text-sm text-red-800">{verificationStatus.data.verification.rejectionReason}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/verify')}
                className="w-full bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start New Verification
              </button>
            </div>
          </div>
        </div>
      )
    }
    // If not verified and no verification exists or status is unknown, show start verification page
    else {
      console.log('🚫 NO VERIFICATION OR UNKNOWN STATUS - Showing start verification page');
      return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <FaCar className="text-4xl text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Your Driver Verification
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Before you can offer rides, you need to complete the driver verification process. This includes verifying your identity, driver's license, and vehicle information.
            </p>
            <button
              onClick={() => navigate('/verify')}
              className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Start Verification Process
            </button>
          </div>
        </div>
      </div>
    )
    }
  }

  // If we reach here, the driver is verified - show the offer ride form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Route Details */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Route Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure City *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="departure_city"
                        value={formData.departure_city}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., New York"
                      />
                    </div>
                    <ErrorMessage error={validationErrors.origin} className="error-origin" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination City *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="destination_city"
                        value={formData.destination_city}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Boston"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Address *
                    </label>
                    <input
                      type="text"
                      name="departure_address"
                      value={formData.departure_address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Specific pickup location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Address *
                    </label>
                    <input
                      type="text"
                      name="destination_address"
                      value={formData.destination_address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Specific drop-off location"
                    />
                    <ErrorMessage error={validationErrors.destination} className="error-destination" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date *
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="departure_date"
                        value={formData.departure_date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <ErrorMessage error={validationErrors.departure_date} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <div className="relative">
                      <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        name="departure_time"
                        value={formData.departure_time}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <ErrorMessage error={validationErrors.departure_time} />
                  </div>
                </div>

                {/* Stops */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stops (Optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newStop}
                      onChange={(e) => setNewStop(e.target.value)}
                      placeholder="Add a stop along the way"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addStop}
                      className="btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.stops.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.stops.map((stop, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                          <span className="text-sm">{stop}</span>
                          <button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Trip Preferences */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle *
                    </label>
                    <select
                      name="vehicle_id"
                      value={formData.vehicle_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select your vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.year} {vehicle.color} {vehicle.make} {vehicle.model} ({vehicle.seats} seats)
                        </option>
                      ))}
                    </select>
                    {vehiclesLoading && (
                      <p className="text-sm text-gray-500 mt-1">Loading vehicles...</p>
                    )}
                    {!vehiclesLoading && vehicles.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        <a href="/vehicles" className="text-green-600 hover:underline">
                          Add a vehicle first
                        </a>
                      </p>
                    )}
                    <ErrorMessage error={validationErrors.vehicle_id} />
                  </div>

                  {/* Available Seats */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Seats *
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleSeatChange(-1)}
                        className="p-2 border border-gray-300 rounded-l-xl hover:bg-gray-50"
                      >
                        <FaMinus />
                      </button>
                      <div className="flex-1 px-4 py-3 border-t border-b border-gray-300 text-center font-medium">
                        {formData.available_seats} seat{formData.available_seats !== 1 ? 's' : ''}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSeatChange(1)}
                        className="p-2 border border-gray-300 rounded-r-xl hover:bg-gray-50"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <ErrorMessage error={validationErrors.available_seats} />
                  </div>

                  {/* Price per Seat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Seat *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R</span>
                      <input
                        type="number"
                        name="price_per_seat"
                        value={formData.price_per_seat}
                        onChange={handleInputChange}
                        required
                        min="1"
                        step="1"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 45"
                      />
                    </div>
                    <ErrorMessage error={validationErrors.price_per_seat} />
                  </div>

                  {/* Luggage Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Luggage Size Allowed
                    </label>
                    <select
                      name="luggage_size"
                      value={formData.luggage_size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="small">Small (backpack, small bag)</option>
                      <option value="medium">Medium (carry-on suitcase)</option>
                      <option value="large">Large (large suitcase)</option>
                    </select>
                  </div>
                </div>

                {/* Preferences */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Trip Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Music Preferences
                      </label>
                      <select
                        name="music_preferences"
                        value={formData.music_preferences}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="no_preference">No preference</option>
                        <option value="music_lover">Love music</option>
                        <option value="quiet_ride">Prefer quiet</option>
                        <option value="talk_friendly">Enjoy conversation</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="smoking_allowed"
                          checked={formData.smoking_allowed}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Smoking allowed</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="pets_allowed"
                          checked={formData.pets_allowed}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Pets allowed</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any additional details about your trip, pickup/drop-off instructions, or other preferences..."
                  />
                  <ErrorMessage error={validationErrors.description} />
                </div>
              </div>
            )}

            {/* Step 3: Review & Publish */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Ride</h2>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Route</h3>
                      <p className="text-gray-600">
                        {formData.departure_city} → {formData.destination_city}
                      </p>
                      {formData.stops.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Stops: {formData.stops.join(', ')}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Date & Time</h3>
                      <p className="text-gray-600">
                        {new Date(formData.departure_date).toLocaleDateString()} at {formData.departure_time}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Seats & Price</h3>
                      <p className="text-gray-600">
                        {formData.available_seats} seat{formData.available_seats !== 1 ? 's' : ''} at R{formData.price_per_seat} each
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Vehicle</h3>
                      <p className="text-gray-600">
                        {vehicles.find(v => v._id === formData.vehicle_id)?.make} {vehicles.find(v => v._id === formData.vehicle_id)?.model}
                      </p>
                    </div>
                  </div>

                  {formData.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Additional Information</h3>
                      <p className="text-gray-600">{formData.description}</p>
                    </div>
                  )}
                </div>

                {!isAuthenticated && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <p className="text-yellow-800">
                      You'll need to sign in or create an account to publish your ride.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createRideMutation.isPending || isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(createRideMutation.isPending || isSubmitting) ? 'Publishing...' : (isAuthenticated ? 'Publish Ride' : 'Sign In & Publish')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OfferRide