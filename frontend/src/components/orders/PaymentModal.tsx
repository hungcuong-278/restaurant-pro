import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';

interface PaymentModalProps {
  orderId: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  onClose: () => void;
  onPaymentComplete: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'mobile' | 'bank_transfer';

interface PaymentEntry {
  id: string;
  method: PaymentMethod;
  amount: number;
  timestamp: Date;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  orderId,
  totalAmount,
  paidAmount,
  paymentStatus,
  onClose,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);

  const remainingAmount = totalAmount - paidAmount - payments.reduce((sum, p) => sum + p.amount, 0);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
    { value: 'mobile', label: 'Mobile Payment', icon: '📱' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  ];

  // Add payment to list
  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > remainingAmount) {
      alert(`Amount exceeds remaining balance: $${remainingAmount.toFixed(2)}`);
      return;
    }

    const newPayment: PaymentEntry = {
      id: Date.now().toString(),
      method: selectedMethod,
      amount,
      timestamp: new Date(),
    };

    setPayments([...payments, newPayment]);
    setPaymentAmount('');
  };

  // Remove payment from list
  const handleRemovePayment = (paymentId: string) => {
    setPayments(payments.filter(p => p.id !== paymentId));
  };

  // Quick amount buttons
  const handleQuickAmount = (percentage: number) => {
    const amount = (remainingAmount * percentage / 100).toFixed(2);
    setPaymentAmount(amount);
  };

  // Process payment
  const handleProcessPayment = async () => {
    if (payments.length === 0) {
      alert('Please add at least one payment');
      return;
    }

    const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const confirmMessage = `Process ${payments.length} payment(s) totaling $${totalPaymentAmount.toFixed(2)}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      // Process each payment
      for (const payment of payments) {
        // Map payment method
        let mappedMethod: 'cash' | 'card' | 'digital_wallet' = 'cash';
        if (payment.method === 'mobile') {
          mappedMethod = 'digital_wallet';
        } else if (payment.method === 'card') {
          mappedMethod = 'card';
        } else if (payment.method === 'bank_transfer') {
          mappedMethod = 'digital_wallet';
        }

        const paymentData = {
          amount: payment.amount,
          payment_method: mappedMethod,
          transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        // Call API
        const paymentService = await import('../../services/paymentService');
        await paymentService.default.createPayment(orderId, paymentData);
      }

      alert('Payment processed successfully!');
      onPaymentComplete();
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Generate receipt
  const handleGenerateReceipt = () => {
    // Open receipt in new window
    const receiptUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/restaurants/64913af3-e39a-4dd0-ad21-c3bb4aa6e9a5/orders/${orderId}/receipt`;
    window.open(receiptUrl, '_blank', 'width=500,height=800');
    setReceiptGenerated(true);
  };

  const getMethodLabel = (method: PaymentMethod): string => {
    return paymentMethods.find(m => m.value === method)?.label || method;
  };

  const getMethodIcon = (method: PaymentMethod): string => {
    return paymentMethods.find(m => m.value === method)?.icon || '💰';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Process Payment</h2>
            <p className="text-sm text-gray-600">Order #{orderId.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              
              {paidAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Already Paid:</span>
                  <span className="text-lg font-semibold text-green-600">
                    -${paidAmount.toFixed(2)}
                  </span>
                </div>
              )}
              
              {payments.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Current Payments:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    -${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t-2 border-blue-300 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Remaining:</span>
                <span className={`text-3xl font-bold ${
                  remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  ${remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Method Selection */}
          {remainingAmount > 0 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setSelectedMethod(method.value as PaymentMethod)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedMethod === method.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {method.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={remainingAmount}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddPayment}
                    disabled={!paymentAmount}
                  >
                    Add Payment
                  </Button>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickAmount(25)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => handleQuickAmount(50)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => handleQuickAmount(75)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => handleQuickAmount(100)}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                  >
                    Full
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Payment List */}
          {payments.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Payments to Process ({payments.length})
              </label>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMethodIcon(payment.method)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getMethodLabel(payment.method)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {remainingAmount === 0 && (
              <Button
                variant="secondary"
                onClick={handleGenerateReceipt}
                className="flex-1"
                disabled={receiptGenerated}
              >
                🧾 {receiptGenerated ? 'Receipt Generated' : 'Generate Receipt'}
              </Button>
            )}
            
            <Button
              variant="primary"
              onClick={handleProcessPayment}
              disabled={payments.length === 0 || loading}
              loading={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Process Payment ($${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)})`}
            </Button>
          </div>

          {/* Payment Status Info */}
          {remainingAmount === 0 && payments.length > 0 && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">
                  Full payment received! Order will be marked as PAID.
                </span>
              </div>
            </div>
          )}

          {remainingAmount > 0 && payments.length > 0 && (
            <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold">
                  Partial payment: ${remainingAmount.toFixed(2)} remaining. Order will be marked as PARTIALLY PAID.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
