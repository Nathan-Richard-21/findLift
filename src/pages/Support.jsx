import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
    category: 'verification'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-2xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Support ticket submitted</h1>
            <p className="text-gray-600 mb-8">
              Thank you for contacting us. Our support team will get back to you within 24 hours.
            </p>
            <div className="flex space-x-4 justify-center">
              <button onClick={() => navigate('/')} className="btn-primary">
                Go to Home
              </button>
              <button onClick={() => navigate('/verify')} className="btn-secondary">
                Try Verification Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center">
              <FaQuestionCircle className="text-3xl mr-4" />
              <div>
                <h1 className="text-2xl font-bold">Need Help?</h1>
                <p className="text-blue-100">We're here to support you</p>
              </div>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Quick Contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600">support@findlift.com</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FaPhone className="text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-gray-600">+27 (0) 11 123 4567</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Submit a Support Ticket</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  required
                >
                  <option value="verification">Identity Verification</option>
                  <option value="booking">Booking Issues</option>
                  <option value="payment">Payment Problems</option>
                  <option value="account">Account Issues</option>
                  <option value="technical">Technical Problems</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="input-field w-full"
                  placeholder="Please describe your issue in detail. Include any error messages you've seen."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Common Questions</h2>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Why was my verification rejected?
                </summary>
                <p className="mt-2 text-sm text-gray-600 pl-4">
                  Common reasons include poor image quality, document glare, expired documents, or face mismatch between selfie and ID. Try ensuring good lighting and clear photos.
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  How long does verification take?
                </summary>
                <p className="mt-2 text-sm text-gray-600 pl-4">
                  Most verifications are completed within a few minutes. In some cases, manual review may take up to 24 hours.
                </p>
              </details>
              
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  What documents are accepted?
                </summary>
                <p className="mt-2 text-sm text-gray-600 pl-4">
                  We accept South African ID cards, passports, and driver's licenses. Documents must be current and not expired.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;