import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '../services'
import { useAuth } from '../App'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    accepted_terms: false,
    marketing_opt_in: false
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { refetch } = useAuth()
  
  // Get redirect path from query params or location state
  const searchParams = new URLSearchParams(location.search)
  const redirectPath = searchParams.get('redirect')
  const from = location.state?.from?.pathname || (redirectPath ? `/${redirectPath}` : '/')

  // Detect if we should show login or signup based on URL
  useEffect(() => {
    if (location.pathname === '/auth/signup') {
      setIsLogin(false)
    } else if (location.pathname === '/auth/login') {
      setIsLogin(true)
    } else {
      // Default to login for /auth
      setIsLogin(true)
    }
  }, [location.pathname])

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      alert('Login successful!')
      refetch()
      navigate(from, { replace: true })
    },
    onError: (error) => {
      console.error('Login error:', error)
      if (error.response?.data?.details) {
        // Show detailed validation errors
        const errorMessages = error.response.data.details.map(detail => 
          `${detail.field}: ${detail.message}`
        ).join('\n')
        alert('Login failed:\n' + errorMessages)
      } else {
        alert(error.response?.data?.error || 'Login failed')
      }
    }
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      alert('Registration successful!')
      refetch()
      navigate(from, { replace: true })
    },
    onError: (error) => {
      console.error('Registration error:', error)
      if (error.response?.data?.details) {
        // Show detailed validation errors
        const errorMessages = error.response.data.details.map(detail => 
          `${detail.field}: ${detail.message}`
        ).join('\n')
        alert('Registration failed:\n' + errorMessages)
      } else {
        alert(error.response?.data?.error || 'Registration failed')
      }
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password
      })
    } else {
      // Validation checks
      if (!formData.accepted_terms) {
        alert('You must accept the terms and conditions')
        return
      }
      
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long')
        return
      }
      
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        alert('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        return
      }
      
      // Format phone number to E.164 format if provided
      let phone = formData.phone.trim()
      if (phone && !phone.startsWith('+')) {
        phone = '+1' + phone.replace(/\D/g, '') // Assuming US numbers, remove non-digits
      }
      
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: phone || undefined,
        accepted_terms: formData.accepted_terms,
        marketing_opt_in: formData.marketing_opt_in
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                if (isLogin) {
                  navigate('/auth/signup')
                } else {
                  navigate('/auth/login')
                }
              }}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required={!isLogin}
                      value={formData.first_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required={!isLogin}
                      value={formData.last_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+27123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +27123456789 (E.164 format)</p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              {!isLogin && (
                <p className="text-xs text-gray-500 mb-1">
                  Must be 6+ characters with uppercase, lowercase, and number
                </p>
              )}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    id="accepted_terms"
                    name="accepted_terms"
                    type="checkbox"
                    checked={formData.accepted_terms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="accepted_terms" className="ml-2 block text-sm text-gray-900">
                    I accept the{' '}
                    <a href="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="marketing_opt_in"
                    name="marketing_opt_in"
                    type="checkbox"
                    checked={formData.marketing_opt_in}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketing_opt_in" className="ml-2 block text-sm text-gray-900">
                    I would like to receive marketing communications from Find Lift
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary flex justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Auth