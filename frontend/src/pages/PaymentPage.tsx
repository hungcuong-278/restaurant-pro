import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentQR from '../components/PaymentQR';
import PaymentMethodSelector, { PaymentMethod } from '../components/payment/PaymentMethodSelector';

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use real order data from navigation state or fallback to example
  const orderNumber = state?.orderNumber || 'ORD-EXAMPLE-001';
  const amount = state?.amount || 285.00;

  // Handle payment confirmation
  const handlePayment = async () => {
    if (!selectedMethod) return;

    try {
      setIsProcessing(true);

      // For in-store payments (cash/credit card)
      if (selectedMethod === 'cash' || selectedMethod === 'credit_card') {
        const confirmMsg = 
          `✅ Xác nhận thanh toán ${selectedMethod === 'cash' ? 'tiền mặt' : 'thẻ tín dụng'}\n\n` +
          `Mã đơn: ${orderNumber}\n` +
          `Số tiền: $${amount.toFixed(2)}\n\n` +
          `Nhân viên sẽ xử lý thanh toán tại quầy.`;
        
        if (window.confirm(confirmMsg)) {
          alert('✅ Đã ghi nhận! Vui lòng thanh toán tại quầy.');
          navigate('/orders');
        }
      }
      // For online payments - show QR or payment instructions
      else {
        // Already showing QR code below, just scroll to it
        document.getElementById('payment-qr')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

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
            Chọn phương thức thanh toán phù hợp với bạn
          </p>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
          />
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
                    <span className="font-medium">{Math.round(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{Math.round(amount).toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment QR Component - Only for online methods */}
        {selectedMethod && (selectedMethod === 'bank_transfer' || selectedMethod === 'e_wallet') && (
          <div id="payment-qr">
            <PaymentQR 
              orderNumber={orderNumber}
              amount={Math.round(amount)}
            />
            
            {/* Copy All Payment Info Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const paymentInfo = `Ngân hàng: Techcombank\nSố TK: 27080688888\nChủ TK: VU HUNG CUONG\nSố tiền: ${Math.round(amount).toLocaleString('vi-VN')}₫\nNội dung: ${orderNumber}`;
                  navigator.clipboard.writeText(paymentInfo);
                  alert('✅ Đã copy toàn bộ thông tin thanh toán!');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                📋 Copy Toàn Bộ Thông Tin Chuyển Khoản
              </button>
            </div>
          </div>
        )}

        {/* In-store Payment Instructions */}
        {selectedMethod && (selectedMethod === 'cash' || selectedMethod === 'credit_card') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedMethod === 'cash' ? '💵 Thanh Toán Tiền Mặt' : '💳 Thanh Toán Thẻ'}
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>✓ Vui lòng đến quầy thanh toán</p>
              <p>✓ Xuất trình mã đơn hàng: <span className="font-bold text-blue-600">{orderNumber}</span></p>
              <p>✓ Số tiền cần thanh toán: <span className="font-bold text-green-600">{Math.round(amount).toLocaleString('vi-VN')}₫</span></p>
              <p className="text-sm text-gray-500 mt-4">💡 Nhân viên sẽ xác nhận và xử lý đơn hàng của bạn</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {isProcessing ? '⏳ Đang xử lý...' : '✅ Xác Nhận Thanh Toán'}
            </button>
          </div>
        )}

        {/* Select Method Prompt */}
        {!selectedMethod && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 font-medium">👆 Vui lòng chọn phương thức thanh toán ở trên</p>
          </div>
        )}

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
