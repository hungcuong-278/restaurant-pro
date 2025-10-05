import React from 'react';
import Card from './common/Card';

interface PaymentQRProps {
  orderNumber?: string;
  amount?: number;
  className?: string;
}

const PaymentQR: React.FC<PaymentQRProps> = ({ orderNumber, amount, className = '' }) => {
  const accountNumber = '9724 2220 3982 1491';
  const bankName = 'MB Bank';
  const accountHolder = 'Restaurant Pro';

  const handleCopyAccount = () => {
    const plainNumber = accountNumber.replace(/\s/g, '');
    navigator.clipboard.writeText(plainNumber);
    alert('✅ Đã copy số tài khoản!');
  };

  const handleCopyAmount = () => {
    if (amount) {
      navigator.clipboard.writeText(amount.toString());
      alert('✅ Đã copy số tiền!');
    }
  };

  return (
    <Card className={`${className} bg-gradient-to-br from-blue-50 to-indigo-50`}>
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            💳 Thanh Toán Chuyển Khoản
          </h3>
          <p className="text-sm text-gray-600">
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <img 
              src="/payment-qr.png" 
              alt="Payment QR Code"
              className="w-64 h-64 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">Scan với VietQR, Napas 247</p>
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="space-y-4">
          {/* Bank Name */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">🏦</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ngân hàng</p>
                  <p className="font-semibold text-gray-800">{bankName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Số tài khoản</p>
                <p className="font-mono text-lg font-bold text-gray-800 tracking-wider">
                  {accountNumber}
                </p>
              </div>
              <button
                onClick={handleCopyAccount}
                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Account Holder */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">👤</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Chủ tài khoản</p>
                  <p className="font-semibold text-gray-800">{accountHolder}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount (if provided) */}
          {amount && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/80 mb-1">Số tiền cần chuyển</p>
                  <p className="font-mono text-2xl font-bold text-white">
                    {amount.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <button
                  onClick={handleCopyAmount}
                  className="ml-4 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}

          {/* Order Number (if provided) */}
          {orderNumber && (
            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Nội dung chuyển khoản</p>
                  <p className="font-mono text-base font-bold text-orange-600">
                    {orderNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic">
                    ⚠️ Vui lòng ghi đúng nội dung để xác nhận thanh toán
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-700 text-xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                Hướng dẫn thanh toán:
              </h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Mở app ngân hàng của bạn</li>
                <li>Chọn "Quét QR" hoặc "Chuyển khoản"</li>
                <li>Quét mã QR hoặc nhập số tài khoản</li>
                <li>Nhập số tiền và nội dung chuyển khoản</li>
                <li>Xác nhận giao dịch</li>
              </ol>
              <p className="text-xs text-yellow-600 mt-3 italic">
                💡 Tip: Sử dụng nút "Copy" để copy nhanh thông tin thanh toán
              </p>
            </div>
          </div>
        </div>

        {/* Support Apps */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Hỗ trợ thanh toán qua:</p>
          <div className="flex justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              VietQR
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Napas 247
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Momo
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              ZaloPay
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PaymentQR;

