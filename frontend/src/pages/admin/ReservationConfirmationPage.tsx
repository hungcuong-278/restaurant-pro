/**
 * ReservationConfirmationPage Component
 * 
 * Staff dashboard for confirming pending reservations
 * Features:
 * - List all pending reservations
 * - Real-time updates
 * - Quick confirm/reject actions
 * - Reservation details view
 * - Filter and search
 * - Staff-only access
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import reservationService, { Reservation } from '../../services/reservationService';

const ReservationConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [pendingReservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Check if user is staff
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Only admin and manager can access
    if (user?.role !== 'admin' && user?.role !== 'manager' && user?.role !== 'staff') {
      alert('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch pending reservations
  const fetchPendingReservations = async () => {
    try {
      setLoading(true);
      const allReservations = await reservationService.getReservations();
      
      // Filter only pending reservations
      const pending = allReservations.filter(r => r.status === 'pending');
      
      // Sort by creation date (newest first)
      pending.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setReservations(pending);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReservations();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle confirm reservation
  const handleConfirm = async (reservationId: string) => {
    if (!window.confirm('Xác nhận đơn đặt bàn này?')) return;

    try {
      setConfirmingId(reservationId);
      await reservationService.updateReservationStatus(reservationId, 'confirmed');
      
      // Remove from pending list
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      
      alert('✅ Đã xác nhận đơn đặt bàn!');
    } catch (err: any) {
      alert('❌ Lỗi: ' + (err.message || 'Không thể xác nhận'));
    } finally {
      setConfirmingId(null);
    }
  };

  // Handle reject reservation
  const handleReject = async (reservationId: string) => {
    const reason = window.prompt('Lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled

    try {
      setRejectingId(reservationId);
      await reservationService.updateReservationStatus(reservationId, 'cancelled');
      
      // Remove from pending list
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      
      alert('🚫 Đã từ chối đơn đặt bàn');
    } catch (err: any) {
      alert('❌ Lỗi: ' + (err.message || 'Không thể từ chối'));
    } finally {
      setRejectingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  // Calculate time since creation
  const getTimeSince = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gr-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="mr-3">📋</span>
                Xác Nhận Đặt Bàn
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý và xác nhận các đơn đặt bàn đang chờ
              </p>
            </div>
            
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-semibold">
                <span className="animate-pulse mr-2">●</span>
                {pendingReservations.length} đơn chờ xác nhận
              </div>
              <button
                onClick={fetchPendingReservations}
                className="mt-2 text-sm text-gr-gold hover:underline flex items-center justify-end"
              >
                🔄 Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {pendingReservations.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Không có đơn đặt bàn chờ xác nhận
            </h2>
            <p className="text-gray-600">
              Tất cả đơn đặt bàn đã được xử lý
            </p>
          </div>
        )}

        {/* Reservations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm opacity-90">Mã đơn</p>
                    <p className="font-bold text-lg">
                      #{reservation.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">{getTimeSince(reservation.created_at)}</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white bg-opacity-20 text-sm font-semibold">
                      ⏳ Chờ xác nhận
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    <span className="mr-2">👤</span>
                    {reservation.customer_name}
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    <p className="flex items-center">
                      <span className="mr-2">📧</span>
                      {reservation.customer_email}
                    </p>
                    <p className="flex items-center">
                      <span className="mr-2">📱</span>
                      {reservation.customer_phone}
                    </p>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">📅 Ngày</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(reservation.reservation_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">⏰ Giờ</p>
                      <p className="font-semibold text-gray-800 text-2xl">
                        {formatTime(reservation.reservation_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">👥 Số người</p>
                      <p className="font-semibold text-gray-800">
                        {reservation.party_size} người
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">🪑 Bàn</p>
                      <p className="font-semibold text-gray-800">
                        {reservation.table?.location || reservation.table?.number || 'Chưa chọn'}
                      </p>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {reservation.special_requests && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">💬 Yêu cầu đặc biệt</p>
                      <p className="text-gray-700 italic">
                        "{reservation.special_requests}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(reservation.id)}
                    disabled={confirmingId === reservation.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {confirmingId === reservation.id ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✅</span>
                        Xác Nhận
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(reservation.id)}
                    disabled={rejectingId === reservation.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {rejectingId === reservation.id ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚫</span>
                        Từ Chối
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border-2 border-gray-300 transition-colors duration-200"
          >
            <span className="mr-2">⬅️</span>
            Về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmationPage;
