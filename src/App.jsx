import { Routes, Route } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { authService } from './services'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import RideDetails from './pages/RideDetails'
import OfferRide from './pages/OfferRide'
import Bookings from './pages/Bookings'
import MyRides from './pages/MyRides'
import Auth from './pages/Auth'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DriverSignup from './pages/DriverSignup'
import Profile from './pages/Profile'
import Vehicles from './pages/Vehicles'
import DriverDashboard from './pages/DriverDashboard'
import About from './pages/About'
import Help from './pages/Help'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Support from './pages/Support'
import NotFound from './pages/NotFound'
// Verification pages
import VerificationIntro from './pages/verification/VerificationIntro'
import ChooseDocument from './pages/verification/ChooseDocument'
import CaptureDocuments from './pages/verification/CaptureDocuments'
import CaptureVehicle from './pages/verification/CaptureVehicle'
import ReviewConsent from './pages/verification/ReviewConsent'
import VerificationStatus from './pages/verification/VerificationStatus'
// Admin pages
import AdminKYCList from './pages/admin/AdminKYCList'
import AdminKYCReview from './pages/admin/AdminKYCReview'
import AdminRides from './pages/admin/AdminRides'
import AdminUsers from './pages/admin/AdminUsers'
import AdminFinancial from './pages/admin/AdminFinancial'
// Payment pages
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import MockPayment from './pages/MockPayment'
// Email verification
import VerifyEmail from './pages/VerifyEmail'
import { createContext, useContext, useState } from 'react'

// Auth Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Auth Provider Component
function AuthProvider({ children }) {
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log('Fetching user...');
      try {
        const res = await authService.getMe();
        console.log('User fetched successfully');
        setHasTriedAuth(true);
        return res.data.user;
      } catch (error) {
        console.log('User fetch failed:', error.response?.status);
        setHasTriedAuth(true);
        // If unauthorized, return null instead of throwing
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity, // Never go stale automatically
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    enabled: !hasTriedAuth, // Only fetch once, then disable
  })

  const logout = async () => {
    try {
      await authService.logout()
      // Clear all local state immediately
      setHasTriedAuth(false)
      // Force refetch to clear user state
      await refetch()
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      setHasTriedAuth(false)
      await refetch()
      window.location.href = '/'
    }
  }

  const customRefetch = () => {
    setHasTriedAuth(false) // Reset flag to allow refetch
    return refetch()
  }

  const value = {
    user: user || null,
    isLoading: isLoading && !hasTriedAuth, // Don't show loading after first attempt
    isAuthenticated: !!user,
    logout,
    refetch: customRefetch
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="welcome" element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="ride/:id" element={<RideDetails />} />
            <Route path="offer" element={<OfferRide />} />
            <Route path="offer-ride" element={<OfferRide />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="my-rides" element={<MyRides />} />
            <Route path="profile" element={<Profile />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="driver-dashboard" element={<DriverDashboard />} />
            <Route path="about" element={<About />} />
            <Route path="help" element={<Help />} />
            <Route path="auth" element={<Auth />} />
            <Route path="auth/login" element={<Auth />} />
            <Route path="auth/signup" element={<Auth />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="verify-email/:token" element={<VerifyEmail />} />
            <Route path="driver/signup" element={<DriverSignup />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="support" element={<Support />} />
            {/* Verification routes */}
            <Route path="verify" element={<VerificationIntro />} />
            <Route path="verify/choose" element={<ChooseDocument />} />
            <Route path="verify/capture" element={<CaptureDocuments />} />
            <Route path="verify/vehicle" element={<CaptureVehicle />} />
            <Route path="verify/review" element={<ReviewConsent />} />
            <Route path="verify/status" element={<VerificationStatus />} />
            {/* Admin routes (protected on backend) */}
            <Route path="admin/kyc" element={<AdminKYCList />} />
            <Route path="admin/kyc/:sessionId" element={<AdminKYCReview />} />
            <Route path="admin/rides" element={<AdminRides />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/financial" element={<AdminFinancial />} />
            {/* Payment routes */}
            <Route path="payment/mock" element={<MockPayment />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/cancel" element={<PaymentCancel />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App