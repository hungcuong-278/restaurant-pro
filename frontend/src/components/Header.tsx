import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Restaurants', href: '/restaurants' },
    { name: 'Menu', href: '/menu' },
    { name: 'Book Table', href: '/reservations/new' },
    { name: 'Orders', href: '/orders' },
    { name: 'Kitchen', href: '/kitchen' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleLogout = () => {
    // Confirm logout
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Dispatch logout action
      dispatch(logout());
      
      // Close mobile menu if open
      setIsMenuOpen(false);
      
      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/login');
      }, 100);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gr-black shadow-xl relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="text-gr-gold text-2xl font-bold tracking-wide">
                RESTAURANT<span className="text-white">PRO</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-gr-gold border-b-2 border-gr-gold'
                    : 'text-white hover:text-gr-gold hover:border-b-2 hover:border-gr-gold'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                  Welcome, {user.firstName}
                </span>
                <Link
                  to="/reservations/my-reservations"
                  className="text-white hover:text-gr-gold transition-colors duration-300 text-sm"
                >
                  My Reservations
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/dashboard"
                    className="btn-primary-outline text-sm"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="border-2 border-white text-white px-6 py-2 rounded-none font-sans font-medium tracking-wide uppercase text-sm transition-all duration-300 hover:bg-white hover:text-gr-black"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-gr-gold transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gr-gold focus:outline-none focus:text-gr-gold transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-t border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                    isActive(item.href)
                      ? 'text-gr-gold bg-gray-800'
                      : 'text-white hover:text-gr-gold hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              <div className="border-t border-gray-700 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-white text-sm">
                      Welcome, {user.firstName}
                    </div>
                    <Link
                      to="/reservations/my-reservations"
                      className="block px-3 py-2 text-white hover:text-gr-gold hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Reservations
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/dashboard"
                        className="block px-3 py-2 text-gr-gold hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-white hover:text-gr-gold hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-white hover:text-gr-gold hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-gr-gold hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;