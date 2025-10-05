import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentQR from '../components/PaymentQR';

interface PaymentLocationState {
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  tableNumber?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentLocationState;

  // Use real order data from navigation state or fallback to example
  const orderNumber = state?.orderNumber || 'ORD-EXAMPLE-001';
  const amount = state?.amount || 285000;

  // If no order data, show error
  if (!state?.orderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Lỗi</h1>
          <p className="text-gray-600 mb-6">Không tìm thấy thông tin đơn hàng</p>
          <button
            onClick={() => navigate('/orders/new')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Tạo đơn hàng mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💳 Thanh Toán
          </h1>
          <p className="text-gray-600">
            Chuyển khoản qua QR Code hoặc thông tin tài khoản
          </p>
        </div>

        {/* Order Info */}
        {state.items && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">📋 Chi tiết đơn hàng</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Mã đơn:</span> {orderNumber}
              </p>
              {state.tableNumber && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bàn:</span> {state.tableNumber}
                </p>
              )}
              <div className="mt-4 space-y-1">
                {state.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{amount.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment QR Component */}
        <PaymentQR 
          orderNumber={orderNumber}
          amount={amount}
        />

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Giao dịch được bảo mật an toàn
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Sau khi chuyển khoản, đơn hàng sẽ được xác nhận trong vòng 1-2 phút
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
