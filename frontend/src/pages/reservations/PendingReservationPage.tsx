/**
 * PendingReservationPage Component
 * 
 * Displays "Your reservation is being processed" message after submission
 * Features:
 * - Pending animation
 * - Reservation details display
 * - Auto-redirect to home after 60 seconds
 * - Manual back to home button
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchReservation } from '../../store/slices/reservationSlice';
import { formatDateForDisplay, formatTimeForDisplay } from '../../services/reservationService';

const PendingReservationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentReservation, isLoading } = useSelector(
    (state: RootState) => state.reservation
  );

  const [countdown, setCountdown] = useState(60); // 60 seconds countdown

  // Fetch reservation details
  useEffect(() => {
    if (reservationId) {
      dispatch(fetchReservation(reservationId));
    }
  }, [reservationId, dispatch]);

  // Countdown timer and auto-redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleReturnHome = () => {
    navigate('/');
  };

  if (isLoading || !currentReservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gr-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Pending Icon Animation */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            {/* Animated circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-amber-200 animate-ping opacity-75"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-amber-300 animate-pulse"></div>
            </div>
            
            {/* Clock Icon */}
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <svg 
                className="w-16 h-16 text-amber-600 animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Message Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            🎉 Đơn Đặt Bàn Đã Được Gửi!
          </h1>
          <p className="text-lg text-gray-600 text-center mb-6">
            Đang chờ nhân viên xác nhận...
          </p>

          {/* Reservation Details */}
          <div className="bg-amber-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Thông Tin Đặt Bàn
            </h2>

            <div className="space-y-3">
              {/* Reservation ID */}
              <div className="flex items-center justify-between py-2 border-b border-amber-200">
                <span className="text-gray-600 font-medium">Mã đặt bàn:</span>
                <span className="text-gray-800 font-bold">#{currentReservation.id.substring(0, 8).toUpperCase()}</span>
              </div>

              {/* Customer Name */}
              <div className="flex items-center justify-between py-2 border-b border-amber-200">
                <span className="text-gray-600 font-medium">Tên khách:</span>
                <span className="text-gray-800">{currentReservation.customer_name}</span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center justify-between py-2 border-b border-amber-200">
                <span className="text-gray-600 font-medium">Ngày & Giờ:</span>
                <span className="text-gray-800">
                  {formatDateForDisplay(currentReservation.reservation_date)} - {formatTimeForDisplay(currentReservation.reservation_time)}
                </span>
              </div>

              {/* Party Size */}
              <div className="flex items-center justify-between py-2 border-b border-amber-200">
                <span className="text-gray-600 font-medium">Số người:</span>
                <span className="text-gray-800">{currentReservation.party_size} người</span>
              </div>

              {/* Table */}
              {currentReservation.table && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Bàn:</span>
                  <span className="text-gray-800">{currentReservation.table.location || currentReservation.table.number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center mb-6">
            <span className="inline-flex items-center px-6 py-3 rounded-full bg-amber-100 text-amber-800 font-semibold text-lg">
              <span className="animate-pulse mr-2">⏳</span>
              Đang Chờ Xác Nhận
            </span>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">
                  📧 Email xác nhận sẽ được gửi đến: <strong>{currentReservation.customer_email}</strong>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  📱 Nhân viên sẽ liên hệ qua số: <strong>{currentReservation.customer_phone}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-2">
              Tự động chuyển về trang chủ sau:
            </p>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full text-white font-bold text-2xl shadow-lg">
              {countdown}s
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReturnHome}
              className="flex-1 bg-gr-gold hover:bg-gr-gold-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              🏠 Về Trang Chủ Ngay
            </button>
            
            <button
              onClick={() => navigate('/reservations/my')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl border-2 border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              📋 Xem Đơn Đặt Bàn
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ℹ️ Lưu Ý Quan Trọng
          </h3>
          <ul className="text-left text-gray-600 space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Vui lòng đến trước giờ hẹn <strong>10 phút</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Bàn được giữ trong <strong>15 phút</strong> sau giờ đặt</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Để thay đổi hoặc hủy, vui lòng liên hệ trước <strong>2 giờ</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Hotline: <strong className="text-gr-gold">0824979460</strong></span>
            </li>
          </ul>
        </div>

        {/* Thank You Message */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          Cảm ơn bạn đã chọn <span className="font-semibold text-gr-gold">Golden Fork Restaurant</span>! 🍽️
        </p>
      </div>
    </div>
  );
};

export default PendingReservationPage;
