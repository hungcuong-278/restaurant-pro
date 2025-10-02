import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section bg-cover bg-center relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Exceptional <span className="text-gr-gold">Dining</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Experience culinary excellence at its finest with world-class cuisine 
            and impeccable service in an elegant atmosphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn-primary-large">
              Make a Reservation
            </Link>
            <Link to="/menu" className="btn-secondary-large">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gr-black mb-4">
              Our <span className="text-gr-gold">Restaurants</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our collection of exceptional dining destinations, 
              each offering a unique culinary journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Restaurant Card 1 */}
            <div className="premium-card group">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Restaurant Image</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gr-black mb-3">Fine Dining Experience</h3>
              <p className="text-gray-600 mb-4">
                Indulge in our signature dishes crafted with the finest ingredients 
                and presented with artistic flair.
              </p>
              <Link to="/restaurants" className="btn-primary-outline">
                Explore Menu
              </Link>
            </div>

            {/* Restaurant Card 2 */}
            <div className="premium-card group">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Restaurant Image</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gr-black mb-3">Casual Elegance</h3>
              <p className="text-gray-600 mb-4">
                Enjoy a relaxed atmosphere with sophisticated flavors that 
                celebrate both tradition and innovation.
              </p>
              <Link to="/restaurants" className="btn-primary-outline">
                Explore Menu
              </Link>
            </div>

            {/* Restaurant Card 3 */}
            <div className="premium-card group">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Restaurant Image</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gr-black mb-3">Private Dining</h3>
              <p className="text-gray-600 mb-4">
                Host your special occasions in our exclusive private dining rooms 
                with personalized service.
              </p>
              <Link to="/restaurants" className="btn-primary-outline">
                Explore Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gr-black mb-4">
              Why Choose <span className="text-gr-gold">RestaurantPro</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Expert Chefs</h3>
              <p className="text-gray-600">World-class culinary team with exceptional skills</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Premium Quality</h3>
              <p className="text-gray-600">Only the finest ingredients from trusted sources</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Perfect Timing</h3>
              <p className="text-gray-600">Impeccable service that respects your time</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Elegant Atmosphere</h3>
              <p className="text-gray-600">Sophisticated ambiance for memorable experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gr-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready for an Unforgettable <span className="text-gr-gold">Experience?</span>
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Book your table today and embark on a culinary journey that will exceed your expectations.
          </p>
          <Link to="/booking" className="btn-primary-large">
            Make Your Reservation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;