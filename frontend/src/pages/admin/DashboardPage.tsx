import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gr-black mb-4">
            Admin <span className="text-gr-gold">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600">
            Manage your restaurant operations from this central hub.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="premium-card">
            <h3 className="text-xl font-bold text-gr-black mb-4">Reservations</h3>
            <p className="text-gray-600 mb-4">Manage upcoming reservations and table assignments.</p>
            <button className="btn-primary-outline">View Reservations</button>
          </div>
          
          <div className="premium-card">
            <h3 className="text-xl font-bold text-gr-black mb-4">Menu Management</h3>
            <p className="text-gray-600 mb-4">Update menu items, prices, and availability.</p>
            <button className="btn-primary-outline">Manage Menu</button>
          </div>
          
          <div className="premium-card">
            <h3 className="text-xl font-bold text-gr-black mb-4">Analytics</h3>
            <p className="text-gray-600 mb-4">View restaurant performance and booking statistics.</p>
            <button className="btn-primary-outline">View Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;