import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaUsers, FaShieldAlt, FaHandsHelping, FaArrowRight } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: FaCar,
      title: 'Safe & Reliable',
      description: 'All drivers are verified with background checks and vehicle inspections'
    },
    {
      icon: FaUsers,
      title: 'Community Driven',
      description: 'Connect with fellow travelers and build lasting relationships'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure Platform',
      description: 'Your data and payments are protected with enterprise-grade security'
    },
    {
      icon: FaHandsHelping,
      title: '24/7 Support',
      description: 'Our dedicated support team is always here to help you'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Users' },
    { number: '100K+', label: 'Rides Completed' },
    { number: '500+', label: 'Cities Covered' },
    { number: '4.8/5', label: 'Average Rating' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150',
      description: 'Former Uber executive with 10+ years in transportation'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      description: 'Tech veteran focused on building scalable platforms'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Safety',
      image: '/api/placeholder/150/150',
      description: 'Safety expert ensuring secure rides for everyone'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Find Lift
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing transportation by connecting drivers and passengers 
              for safe, affordable, and sustainable ride sharing experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                Find Lift was born from the simple idea that tranysportation should be 
                accessible, affordable, and environmentally friendly. We believe that 
                by connecting people who are traveling in the same direction, we can 
                reduce traffic congestion, lower carbon emissions, and build stronger communities.
              </p>
              <p className="text-gray-600 mb-8">
                Whether you're commuting to work, planning a weekend getaway, or 
                traveling across the country, Find Lift makes it easy to find or 
                offer rides with trusted community members.
              </p>
              <Link
                to="/search"
                className="btn-primary inline-flex items-center"
              >
                Start Your Journey
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Find Lift?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built our platform with safety, community, and sustainability at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
              <p className="text-gray-600 mb-4">
                Founded in 2023, Find Lift started when our founders experienced 
                the frustration of expensive and unreliable transportation options. 
                They realized that many people were making the same journeys every day, 
                but had no easy way to coordinate and share rides.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve thousands of users across hundreds of cities, 
                helping them save money, reduce their environmental impact, and make 
                new connections along the way.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Safety First</h4>
                    <p className="text-gray-600">Every user's safety and security is our top priority</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community</h4>
                    <p className="text-gray-600">Building connections and trust between travelers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sustainability</h4>
                    <p className="text-gray-600">Reducing carbon footprint through shared transportation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Innovation</h4>
                    <p className="text-gray-600">Continuously improving the ride sharing experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of travelers who trust Find Lift for their transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="btn-primary"
            >
              Find a Ride
            </Link>
            <Link
              to="/offer-ride"
              className="btn-secondary bg-white text-gray-900 hover:bg-gray-100"
            >
              Offer a Ride
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;