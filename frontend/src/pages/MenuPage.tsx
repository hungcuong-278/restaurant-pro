import React from 'react';

const MenuPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gr-black mb-4">
            Our <span className="text-gr-gold">Menu</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients.
          </p>
        </div>
        
        <div className="premium-card">
          <h3 className="text-2xl font-bold text-gr-black mb-4">Coming Soon</h3>
          <p className="text-gray-600">Our complete menu will be displayed here with categories, prices, and descriptions.</p>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;