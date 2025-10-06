import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import APITestComponent from '../components/APITestComponent';
import UserStatusComponent from '../components/UserStatusComponent';
import AuthActivityLog from '../components/AuthActivityLog';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleReservationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      // If logged in, go directly to booking
      navigate('/reservations/new');
    } else {
      // If not logged in, save booking URL and redirect to login
      sessionStorage.setItem('redirectAfterLogin', '/reservations/new');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gr-black via-gray-900 to-gr-black">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        {/* Hero content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gr-gold">RESTAURANT</span>
            <br />
            <span className="text-white">PRO</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Experience culinary excellence with our premium dining and reservation management system
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleReservationClick}
              className="btn-primary text-lg px-8 py-4"
            >
              Book a Table
            </button>
            <Link
              to="/menu"
              className="btn-secondary text-lg px-8 py-4"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gr-black mb-4">
              Why Choose <span className="text-gr-gold">Restaurant Pro</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide an exceptional dining experience with state-of-the-art reservation management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Easy Reservations</h3>
              <p className="text-gray-600">Book your table in seconds with our intuitive reservation system</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Quality Service</h3>
              <p className="text-gray-600">Professional staff dedicated to making your experience memorable</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Elegant Atmosphere</h3>
              <p className="text-gray-600">Sophisticated ambiance for memorable experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* API Connection Test Section - Admin Only */}
      {isAdmin && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gr-black mb-4">
                🔧 Development <span className="text-gr-gold">API Test</span>
              </h2>
              <p className="text-lg text-gray-600">
                Testing Frontend-Backend Connection & User Authentication (Admin Only)
              </p>
            </div>
            <UserStatusComponent />
            <AuthActivityLog />
            <APITestComponent />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gr-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Dine with <span className="text-gr-gold">Excellence</span>?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Restaurant Pro for their dining experience
          </p>
          <button
            onClick={handleReservationClick}
            className="btn-primary text-lg px-8 py-4"
          >
            Make a Reservation
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;