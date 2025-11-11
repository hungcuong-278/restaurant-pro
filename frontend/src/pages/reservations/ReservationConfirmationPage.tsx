import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ReservationConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  // Auto redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Success Icon - SVG instead of heroicons */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Đặt Bàn Thành Công!
          </h1>

          {/* Message */}
          <div className="space-y-3 mb-6">
            <p className="text-lg text-gray-700">
              Cảm ơn bạn đã đặt bàn tại Golden Fork Restaurant.
            </p>
            <p className="text-gray-600">
              Chúng tôi đang xem xét yêu cầu đặt bàn của bạn và sẽ xác nhận trong thời gian sớm nhất.
            </p>
            <p className="text-gray-600">
              Một email xác nhận đã được gửi đến địa chỉ email của bạn.
            </p>
          </div>

          {/* Reservation ID */}
          {reservationId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đặt bàn của bạn:</p>
              <p className="text-xl font-mono font-bold text-gr-gold">
                {reservationId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Trạng thái:</span> Đang chờ xác nhận
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full btn-primary"
            >
              Về Trang Chủ
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="w-full px-6 py-3 border-2 border-gr-gold text-gr-gold rounded-lg hover:bg-gr-gold hover:text-white transition-colors font-semibold"
            >
              Xem Thực Đơn
            </button>
          </div>

          {/* Auto redirect notice */}
          <p className="text-sm text-gray-500 mt-6">
            Tự động chuyển về trang chủ sau 5 giây...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmationPage;
