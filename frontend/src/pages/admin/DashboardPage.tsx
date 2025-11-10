import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

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
          {/* NEW: Confirm Reservations Card */}
          <div className="premium-card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gr-black">Xác Nhận Đặt Bàn</h3>
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-gray-600 mb-4">
              Xem và xác nhận các đơn đặt bàn đang chờ xử lý.
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-sm mb-4">
              <span className="animate-pulse mr-2">●</span>
              Có đơn mới
            </span>
            <button 
              onClick={() => navigate('/admin/reservations/confirm')}
              className="btn-primary w-full"
            >
              Xác Nhận Ngay →
            </button>
          </div>

          <div className="premium-card">
            <h3 className="text-xl font-bold text-gr-black mb-4">Reservations</h3>
            <p className="text-gray-600 mb-4">Manage upcoming reservations and table assignments.</p>
            <button className="btn-primary-outline">View Reservations</button>
          </div>
          
          <div className="premium-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gr-black">Menu Management</h3>
              <span className="text-3xl">🍽️</span>
            </div>
            <p className="text-gray-600 mb-4">
              Update menu items, prices, and availability for orders and display.
            </p>
            <button 
              onClick={() => navigate('/admin/menu')}
              className="btn-primary-outline w-full"
            >
              Manage Menu →
            </button>
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