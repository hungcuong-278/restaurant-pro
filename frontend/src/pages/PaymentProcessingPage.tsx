// Payment Processing Page - Complete payment flow with method selection
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentMethodSelector, { PaymentMethod } from '../components/payment/PaymentMethodSelector';
import PaymentQR from '../components/PaymentQR';
import Card from '../components/common/Card';

interface LocationState {
  orderNumber?: string;
  amount?: number;
  orderId?: string;
}

const PaymentProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get order info from location state or URL params
  const orderNumber = state?.orderNumber || new URLSearchParams(location.search).get('order') || '';
  const amount = state?.amount || parseFloat(new URLSearchParams(location.search).get('amount') || '0');
  const orderId = state?.orderId;

  useEffect(() => {
    // If no order info, redirect back
    if (!orderNumber || !amount) {
      console.warn('Missing order information, redirecting...');
      // Don't redirect immediately, might be a direct page load
    }
  }, [orderNumber, amount]);

  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      alert('⚠️ Vui lòng chọn phương thức thanh toán!');
      return;
    }

    setIsProcessing(true);

    try {
      // For in-store payments (cash/credit card)
      if (selectedMethod === 'cash' || selectedMethod === 'credit_card') {
        // Show confirmation message
        const confirmed = window.confirm(
          `✅ Xác nhận thanh toán ${selectedMethod === 'cash' ? 'tiền mặt' : 'thẻ tín dụng'}\n\n` +
          `Đơn hàng: ${orderNumber}\n` +
          `Số tiền: ${amount.toLocaleString('vi-VN')} ₫\n\n` +
          `Vui lòng đến quầy thanh toán để hoàn tất giao dịch.`
        );

        if (confirmed) {
          // In production, would create pending payment record here
          // await paymentService.createPayment({ orderId, method: selectedMethod, amount });
          
          alert(
            '🏪 Đã xác nhận phương thức thanh toán!\n\n' +
            'Vui lòng đến quầy thanh toán.\n' +
            'Nhân viên sẽ xử lý thanh toán cho bạn.'
          );

          // Redirect to order details or orders list
          if (orderId) {
            navigate(`/orders/${orderId}`);
          } else {
            navigate('/orders');
          }
        }
      }
      // For online payments (bank transfer/e-wallet)
      else if (selectedMethod === 'bank_transfer' || selectedMethod === 'e_wallet') {
        // Show QR code and payment instructions
        // User will see this in the render below
        alert(
          '💳 Vui lòng quét mã QR hoặc chuyển khoản\n\n' +
          'Sau khi chuyển khoản thành công,\n' +
          'vui lòng lưu lại xác nhận giao dịch.'
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentCompleted = () => {
    const confirmed = window.confirm(
      '✅ Xác nhận đã chuyển khoản thành công?\n\n' +
      'Vui lòng giữ lại xác nhận giao dịch từ ngân hàng.'
    );

    if (confirmed) {
      alert(
        '🎉 Cảm ơn quý khách!\n\n' +
        'Đơn hàng của bạn đã được ghi nhận.\n' +
        'Nhà hàng sẽ xác nhận khi nhận được thanh toán.'
      );

      // Redirect to orders
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate('/orders');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💳 Thanh Toán Đơn Hàng
          </h1>
          <p className="text-gray-600">
            Chọn phương thức thanh toán phù hợp với bạn
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Thông Tin Đơn Hàng
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {orderNumber || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-lg font-semibold text-gray-800">Tổng tiền:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {amount.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Method Selector */}
        <Card className="mb-6">
          <div className="p-6">
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelect={setSelectedMethod}
            />
          </div>
        </Card>

        {/* Show QR Code for Online Payments */}
        {selectedMethod && (selectedMethod === 'bank_transfer' || selectedMethod === 'e_wallet') && (
          <div className="mb-6">
            <PaymentQR 
              orderNumber={orderNumber}
              amount={amount}
            />

            {/* Payment Instructions */}
            <Card className="mt-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📝 Hướng Dẫn Thanh Toán
                </h3>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 font-bold">1.</span>
                    <p>
                      <strong>Quét mã QR</strong> bằng app ngân hàng (VietQR, Napas 247) 
                      hoặc ví điện tử (Momo, ZaloPay, VNPay)
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 font-bold">2.</span>
                    <p>
                      Hoặc <strong>chuyển khoản thủ công</strong> theo thông tin tài khoản
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 font-bold">3.</span>
                    <p>
                      <strong>Nội dung chuyển khoản:</strong> Nhập chính xác mã đơn hàng 
                      <span className="font-mono font-semibold text-blue-600"> {orderNumber}</span>
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 font-bold">4.</span>
                    <p>
                      <strong>Số tiền:</strong> Chính xác 
                      <span className="font-semibold text-blue-600"> {amount.toLocaleString('vi-VN')} ₫</span>
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 font-bold">5.</span>
                    <p>
                      Sau khi chuyển khoản thành công, <strong>chụp lại màn hình xác nhận</strong> 
                      và ấn nút "Đã Thanh Toán" bên dưới
                    </p>
                  </div>
                </div>

                {/* Completed Payment Button */}
                <button
                  onClick={handlePaymentCompleted}
                  className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  ✅ Đã Chuyển Khoản Thành Công
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            ← Quay Lại
          </button>

          {selectedMethod && (selectedMethod === 'cash' || selectedMethod === 'credit_card') && (
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className={`
                flex-1 py-3 font-semibold rounded-lg transition-colors
                ${isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                '✅ Xác Nhận Thanh Toán'
              )}
            </button>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <span className="mr-2">🔒</span>
            Giao dịch được bảo mật an toàn
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;
