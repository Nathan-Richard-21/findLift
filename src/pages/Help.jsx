import React, { useState } from 'react';
import { FaQuestionCircle, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqCategories = [
    {
      title: 'Getting Started',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top right corner, fill in your details, and verify your email address. You can also sign up using your Google or Facebook account for faster registration.'
        },
        {
          question: 'Is Find Lift free to use?',
          answer: 'Yes, creating an account and browsing rides is completely free. We only charge a small service fee when you book a ride, which goes towards maintaining our platform and ensuring safety.'
        },
        {
          question: 'How do I find a ride?',
          answer: 'Use our search feature on the homepage. Enter your departure city, destination, and travel date. You\'ll see all available rides matching your criteria, including driver details, price, and departure times.'
        }
      ]
    },
    {
      title: 'Booking & Payment',
      faqs: [
        {
          question: 'How do I book a ride?',
          answer: 'Once you find a suitable ride, click "Book Now" and select the number of seats. You\'ll need to log in and provide payment information to complete your booking.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. All payments are processed securely through our encrypted payment system.'
        },
        {
          question: 'Can I cancel my booking?',
          answer: 'Yes, you can cancel your booking up to 24 hours before departure for a full refund. Cancellations within 24 hours may incur a small fee depending on the driver\'s cancellation policy.'
        },
        {
          question: 'When will I be charged?',
          answer: 'Your payment method will be charged immediately upon booking confirmation. If you cancel within our refund policy, you\'ll receive a refund within 3-5 business days.'
        }
      ]
    },
    {
      title: 'For Drivers',
      faqs: [
        {
          question: 'How do I offer a ride?',
          answer: 'After creating an account, click "Offer Ride" and fill in your trip details including departure/destination cities, date, time, available seats, and price per seat.'
        },
        {
          question: 'What documents do I need to drive?',
          answer: 'You need a valid driver\'s license, vehicle registration, and current insurance. We also require a profile photo and recommend uploading a recent photo of your vehicle.'
        },
        {
          question: 'How much can I earn?',
          answer: 'Earnings depend on your route, distance, and how often you drive. Our platform takes a small commission (typically 10-15%) from each booking to cover payment processing and platform maintenance.'
        },
        {
          question: 'Can I set my own prices?',
          answer: 'Yes, you have full control over your pricing. We provide suggested prices based on distance and demand, but you can set any price you feel is fair for your route.'
        }
      ]
    },
    {
      title: 'Safety & Security',
      faqs: [
        {
          question: 'How do you ensure passenger safety?',
          answer: 'All drivers must verify their identity and vehicle information. We also have a rating system where passengers can review drivers, and we monitor all rides for safety violations.'
        },
        {
          question: 'What if something goes wrong during my ride?',
          answer: 'We have 24/7 customer support available for emergencies. You can also use our in-app emergency button to contact local authorities if needed.'
        },
        {
          question: 'How is my personal data protected?',
          answer: 'We use industry-standard encryption to protect your personal information. We never share your data with third parties without your consent, and you can delete your account at any time.'
        },
        {
          question: 'Can I see driver/passenger profiles before booking?',
          answer: 'Yes, you can view driver profiles including their photo, rating, vehicle information, and reviews from other passengers before booking a ride.'
        }
      ]
    },
    {
      title: 'Technical Issues',
      faqs: [
        {
          question: 'The app/website isn\'t working properly',
          answer: 'Try refreshing your browser or restarting the app. If problems persist, clear your browser cache or reinstall the app. Contact our support team if issues continue.'
        },
        {
          question: 'I\'m not receiving email notifications',
          answer: 'Check your spam/junk folder first. If emails aren\'t there, verify your email address in your account settings and make sure notifications are enabled.'
        },
        {
          question: 'I forgot my password',
          answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a password reset link within a few minutes.'
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const toggleFaq = (categoryIndex, faqIndex) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaQuestionCircle className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.title}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {category.faqs.map((faq, faqIndex) => {
                  const isOpen = openFaq === `${categoryIndex}-${faqIndex}`;
                  return (
                    <div key={faqIndex}>
                      <button
                        onClick={() => toggleFaq(categoryIndex, faqIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <FaChevronUp className="text-gray-400 flex-shrink-0" />
                          ) : (
                            <FaChevronDown className="text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && searchTerm && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FaQuestionCircle className="text-4xl mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try searching with different keywords or contact our support team for help.
            </p>
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@findlift.com"
              className="btn-primary"
            >
              Email Support
            </a>
            <a
              href="tel:+1-800-FINDLIFT"
              className="btn-secondary"
            >
              Call Us
            </a>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Email: support@findlift.com</p>
            <p>Phone: 1-800-FINDLIFT (1-800-346-3543)</p>
            <p>Available 24/7 for emergencies, Mon-Fri 9AM-6PM for general support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;