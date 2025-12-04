import { Link, useLocation } from 'react-router-dom'
import { Car, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../App'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  const navLinks = [
    { name: 'Find Rides', path: '/search' },
    { name: 'Offer a Ride', path: '/offer' },
    { name: 'About', path: '/about' },
    { name: 'Help', path: '/help' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">Find Lift</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'driver' && (
                  <Link
                    to="/driver-dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/bookings"
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
                >
                  My Bookings
                </Link>
                <div className="relative group">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-xl cursor-pointer">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {user?.first_name}
                    </span>
                  </div>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
                    >
                      Profile
                    </Link>
                    {user?.role === 'driver' && (
                      <>
                        <Link
                          to="/vehicles"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          My Vehicles
                        </Link>
                        <Link
                          to="/driver-dashboard"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Driver Dashboard
                        </Link>
                      </>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => logout()}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn btn-primary text-sm px-6 py-2"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  {user?.role === 'driver' && (
                    <Link
                      to="/my-rides"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-base font-medium text-gray-600 hover:text-black transition-colors duration-200"
                    >
                      My Rides
                    </Link>
                  )}
                  <Link
                    to="/bookings"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base font-medium text-gray-600 hover:text-black transition-colors duration-200"
                  >
                    My Bookings
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Signed in as {user?.first_name}</span>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-primary text-base self-start mt-4"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar