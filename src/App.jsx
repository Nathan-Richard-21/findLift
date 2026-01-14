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
// Inactivity warning and session management
import InactivityWarning from './components/InactivityWarning'
import SessionExpiredToast from './components/SessionExpiredToast'
import useInactivityTimeout from './hooks/useInactivityTimeout'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

// Auth Context
const AuthContext = createContext()

// Inactivity timeout in minutes
const INACTIVITY_TIMEOUT_MINUTES = 10

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
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [logoutReason, setLogoutReason] = useState(null);
  const isLoggingOut = useRef(false);
  
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log('Fetching user...');
      try {
        // Check if user was logged out due to inactivity - don't auto-login
        const wasLoggedOut = localStorage.getItem('wasLoggedOut');
        if (wasLoggedOut === 'true') {
          console.log('🔐 User was logged out - not auto-logging in');
          setHasTriedAuth(true);
          return null;
        }
        
        // Check if session expired due to inactivity before fetching
        const lastActivity = localStorage.getItem('lastActivity');
        const timeoutMs = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
        
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
          if (timeSinceLastActivity > timeoutMs) {
            console.log('⏰ Session expired during browser close');
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('lastActivity');
            document.cookie = 'token=; path=/; max-age=0';
            localStorage.setItem('wasLoggedOut', 'true');
            setLogoutReason('session_expired');
            setHasTriedAuth(true);
            return null;
          }
        }
        
        // Check if there's a token before trying to fetch
        const token = localStorage.getItem('token') || document.cookie.includes('token=');
        if (!token) {
          console.log('No token found - not logged in');
          setHasTriedAuth(true);
          return null;
        }
        
        const res = await authService.getMe();
        console.log('User fetched successfully');
        setHasTriedAuth(true);
        // Initialize activity tracking
        localStorage.setItem('lastActivity', Date.now().toString());
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

  // Handle inactivity logout
  const handleInactivityLogout = useCallback(async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    
    console.log('🔐 Auto-logout due to inactivity');
    setLogoutReason('inactivity');
    setShowInactivityWarning(false);
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear all local state and set logout flag to prevent auto-login
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    localStorage.setItem('wasLoggedOut', 'true');
    document.cookie = 'token=; path=/; max-age=0';
    // Also clear with domain variations
    document.cookie = 'token=; path=/; max-age=0; domain=' + window.location.hostname;
    
    // Notify other tabs about logout
    localStorage.setItem('logout-event', Date.now().toString());
    
    setHasTriedAuth(true); // Don't refetch, we're logged out
    
    // Reset flag after delay
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 100);
  }, []);

  // Initialize inactivity timeout
  const { resetTimer } = useInactivityTimeout(
    handleInactivityLogout,
    INACTIVITY_TIMEOUT_MINUTES,
    !!user
  );

  // Listen for inactivity warning
  useEffect(() => {
    const handleWarning = (event) => {
      if (user) {
        setShowInactivityWarning(true);
        console.log(`⚠️ Inactivity warning: ${event.detail.minutesRemaining} minutes until logout`);
      }
    };

    window.addEventListener('inactivity-warning', handleWarning);
    return () => window.removeEventListener('inactivity-warning', handleWarning);
  }, [user]);

  // Listen for logout from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'logout-event' && user) {
        console.log('🔐 Logout detected from another tab');
        setHasTriedAuth(false);
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, refetch]);

  // Dismiss warning and reset timer
  const dismissInactivityWarning = useCallback(() => {
    setShowInactivityWarning(false);
    resetTimer();
  }, [resetTimer]);

  // Clear logout reason
  const clearLogoutReason = useCallback(() => {
    setLogoutReason(null);
  }, []);

  const logout = async (reason = 'manual') => {
    try {
      console.log(`🔐 Logging out user. Reason: ${reason}`);
      await authService.logout()
      // Clear all local state immediately and set logout flag
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      localStorage.setItem('wasLoggedOut', 'true');
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'token=; path=/; max-age=0; domain=' + window.location.hostname;
      
      // Notify other tabs
      localStorage.setItem('logout-event', Date.now().toString());
      
      // Redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      localStorage.setItem('wasLoggedOut', 'true');
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'token=; path=/; max-age=0; domain=' + window.location.hostname;
      window.location.href = '/'
    }
  }

  const customRefetch = () => {
    // Clear the logout flag when user explicitly logs in
    localStorage.removeItem('wasLoggedOut');
    setHasTriedAuth(false) // Reset flag to allow refetch
    // Reset activity tracking on successful refetch (login)
    localStorage.setItem('lastActivity', Date.now().toString());
    return refetch()
  }

  const value = {
    user: user || null,
    isLoading: isLoading && !hasTriedAuth, // Don't show loading after first attempt
    isAuthenticated: !!user,
    logout,
    refetch: customRefetch,
    // Inactivity related values
    showInactivityWarning,
    dismissInactivityWarning,
    logoutReason,
    clearLogoutReason,
    resetActivityTimer: resetTimer,
    inactivityTimeoutMinutes: INACTIVITY_TIMEOUT_MINUTES
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <InactivityWarning />
      <SessionExpiredToast />
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