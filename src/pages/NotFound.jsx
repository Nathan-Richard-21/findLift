import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="container-custom section-padding text-center">
      <h1 className="text-6xl font-bold text-black mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  )
}

export default NotFound