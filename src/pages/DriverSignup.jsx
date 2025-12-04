import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FaCar, FaUser, FaEnvelope, FaLock, FaPhone, FaCheckCircle } from 'react-icons/fa';

const DriverSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accepted_terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.accepted_terms) {
      setError('You must accept the terms and conditions');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Register user with driver role
      const response = await authService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'driver', // Set role as driver
        accepted_terms: formData.accepted_terms,
        marketing_opt_in: false
      });

      if (response.success) {
        // Automatically log in after registration
        const loginResponse = await authService.login({
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.success) {
          // Refetch user data to update auth context
          window.location.href = '/verify'; // Use full page reload to ensure auth context is updated
        }
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      
      // Check if there are validation errors with specific fields
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        // Format detailed validation errors
        const errorList = err.response.data.details.map(detail => {
          const field = detail.field || detail.path || 'Unknown field';
          const message = detail.message || detail.msg || 'Invalid value';
          return `• ${field}: ${message}`;
        }).join('\n');
        setError(`Please fix the following errors:\n${errorList}`);
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Legacy format support
        const errorList = err.response.data.errors.map(e => {
          const field = e.param || e.path || 'Field';
          const message = e.msg || 'Invalid value';
          return `• ${field}: ${message}`;
        }).join('\n');
        setError(`Please fix the following errors:\n${errorList}`);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <FaCar className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Become a Driver
          </h1>
          <p className="text-gray-600 text-lg">
            Join our community and start earning by offering rides
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Driver Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Flexible Schedule</h3>
                <p className="text-sm text-gray-600">Drive when you want</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Extra Income</h3>
                <p className="text-sm text-gray-600">Earn money on your route</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Safe Platform</h3>
                <p className="text-sm text-gray-600">Verified riders only</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Easy Payments</h3>
                <p className="text-sm text-gray-600">Direct to your account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Create Your Driver Account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="font-semibold mb-2">Registration Error</div>
              <div className="text-sm whitespace-pre-line">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: +1234567890 (E.164 format)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                name="accepted_terms"
                checked={formData.accepted_terms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Next Steps:</strong> After creating your account, you'll be redirected to complete your driver verification (ID, driver's license, vehicle details). This process takes about 5-10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Driver Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth?mode=login" className="text-green-600 hover:text-green-700 font-medium">
              Log In
            </Link>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Driver Requirements</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Valid driver's license</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Government-issued ID (passport or national ID)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Vehicle registration and insurance</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Clean driving record</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Must be 21 years or older</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DriverSignup;
