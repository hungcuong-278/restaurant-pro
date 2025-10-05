import React from 'react';
import PaymentQR from '../components/PaymentQR';

const PaymentPage: React.FC = () => {
  // Example order data
  const exampleOrder = {
    orderNumber: 'ORD-20251005-001',
    amount: 285000
  };

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

        {/* Payment QR Component */}
        <PaymentQR 
          orderNumber={exampleOrder.orderNumber}
          amount={exampleOrder.amount}
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
