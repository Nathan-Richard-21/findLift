import { Link } from 'react-router-dom'
import { Car, Users, Shield, Clock } from 'lucide-react'
import SearchCard from '../components/SearchCard'

const Home = () => {
  const features = [
    {
      icon: Car,
      title: 'Find Your Ride',
      description: 'Search thousands of available rides across South Africa. Filter by route, time, and price.',
    },
    {
      icon: Users,
      title: 'Offer Rides',
      description: 'Share your journey and earn money. Set your own prices and help reduce traffic.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All drivers are verified. POPIA compliant with secure payment processing.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Get help anytime. Our support team is available around the clock.',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container-custom">
          <div className="py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"> 
              {/* Left Column - Content */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
                  Go anywhere with{' '}
                  <span className="text-primary-500">Find Lift</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  Request a ride, hop in, and go. Or become a driver and earn money on your schedule.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/search"
                    className="btn btn-primary text-lg px-8 py-4 justify-center"
                  >
                    Find a ride
                  </Link>
                  <Link
                    to="/offer"
                    className="btn btn-outline text-lg px-8 py-4 justify-center"
                  >
                    Offer a ride
                  </Link>
                </div>
              </div>

              {/* Right Column - Search Card */}
              <div className="order-first lg:order-last">
                <div className="bg-gray-50 p-8 rounded-3xl">
                  <h2 className="text-2xl font-bold text-black mb-6">
                    Find your next ride
                  </h2>
                  <SearchCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Why choose Find Lift?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're building the future of transportation in South Africa. Safe, affordable, and convenient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg text-gray-300">Happy Riders</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5K+</div>
              <div className="text-lg text-gray-300">Trusted Drivers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg text-gray-300">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white section-padding">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of South Africans who are already using Find Lift for their daily commute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="btn btn-primary text-lg px-8 py-4"
              >
                Start riding today
              </Link>
              <Link
                to="/offer"
                className="btn btn-outline text-lg px-8 py-4"
              >
                Become a driver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home