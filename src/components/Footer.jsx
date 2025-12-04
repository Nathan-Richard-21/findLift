import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'How it Works', path: '/about' },
        { name: 'Safety', path: '/help' },
        { name: 'Careers', path: '/about' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help' },
        { name: 'Contact Us', path: '/support' },
        { name: 'Report Issue', path: '/support' },
        { name: 'FAQ', path: '/help' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Cookie Policy', path: '/privacy' },
        { name: 'Data Protection', path: '/privacy' },
      ]
    }
  ]

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-custom">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">Find Lift</span>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Connect with drivers and passengers for safe, affordable rides across South Africa.
            </p>
            <p className="text-gray-500 text-xs">
              POPIA compliant • Secure payments • 24/7 support
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-600 hover:text-black text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">
              © {currentYear} Find Lift. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <span className="text-gray-500 text-sm">
                Made with ❤️ in South Africa
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer