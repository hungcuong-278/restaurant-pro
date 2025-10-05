// Payment Methods Component - Select Cash/Card (at store) or Bank Transfer/E-wallet (online)
import React from 'react';
import Card from '../common/Card';

export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer' | 'e_wallet';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  className?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  className = ''
}) => {
  const paymentMethods = [
    {
      id: 'cash' as PaymentMethod,
      name: 'Tiền Mặt',
      icon: '💵',
      description: 'Thanh toán tại cửa hàng',
      location: 'in-store',
      badge: 'Tại quầy'
    },
    {
      id: 'credit_card' as PaymentMethod,
      name: 'Thẻ Tín Dụng',
      icon: '💳',
      description: 'Thanh toán tại cửa hàng',
      location: 'in-store',
      badge: 'Tại quầy'
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Chuyển Khoản',
      icon: '🏦',
      description: 'Chuyển khoản ngân hàng',
      location: 'online',
      badge: 'Online'
    },
    {
      id: 'e_wallet' as PaymentMethod,
      name: 'Ví Điện Tử',
      icon: '📱',
      description: 'Momo, ZaloPay, VNPay',
      location: 'online',
      badge: 'Online'
    }
  ];

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        💳 Chọn Phương Thức Thanh Toán
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all text-left
              ${selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }
            `}
          >
            {/* Badge */}
            <div className="absolute top-2 right-2">
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium
                ${method.location === 'in-store'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-100 text-green-600'
                }
              `}>
                {method.badge}
              </span>
            </div>

            {/* Icon */}
            <div className="text-4xl mb-2">{method.icon}</div>

            {/* Name */}
            <h4 className="font-semibold text-gray-800 mb-1">
              {method.name}
            </h4>

            {/* Description */}
            <p className="text-sm text-gray-600">
              {method.description}
            </p>

            {/* Selected Indicator */}
            {selectedMethod === method.id && (
              <div className="absolute bottom-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Message */}
      {selectedMethod && (
        <div className={`
          mt-4 p-4 rounded-lg
          ${paymentMethods.find(m => m.id === selectedMethod)?.location === 'in-store'
            ? 'bg-orange-50 border border-orange-200'
            : 'bg-green-50 border border-green-200'
          }
        `}>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">
              {paymentMethods.find(m => m.id === selectedMethod)?.location === 'in-store' ? '🏪' : '📱'}
            </span>
            <div>
              {paymentMethods.find(m => m.id === selectedMethod)?.location === 'in-store' ? (
                <>
                  <p className="font-semibold text-orange-800 mb-1">
                    ⚠️ Thanh toán tại cửa hàng
                  </p>
                  <p className="text-sm text-orange-700">
                    Vui lòng đến quầy thanh toán để hoàn tất giao dịch. 
                    Nhân viên sẽ xác nhận và xử lý thanh toán cho bạn.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-green-800 mb-1">
                    ✅ Thanh toán online
                  </p>
                  <p className="text-sm text-green-700">
                    Quý khách có thể thanh toán ngay qua chuyển khoản ngân hàng 
                    hoặc ví điện tử. Vui lòng thực hiện thanh toán và giữ lại xác nhận.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
