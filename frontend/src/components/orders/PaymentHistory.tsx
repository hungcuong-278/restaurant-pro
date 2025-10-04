import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import paymentService, { Payment } from '../../services/paymentService';

interface PaymentHistoryProps {
  orderId: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ orderId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getOrderPayments(orderId);
      // Axios response: response.data contains PaymentListResponse
      // PaymentListResponse.data contains Payment[]
      const paymentsData = (response as any).data?.data || (response as any).data || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment history');
      console.error('Error fetching payments:', err);
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string): string => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'digital_wallet':
        return '📱';
      default:
        return '💰';
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Credit/Debit Card';
      case 'digital_wallet':
        return 'Digital Wallet';
      default:
        return method;
    }
  };

  const getPaymentStatusBadge = (status: Payment['payment_status']) => {
    const statusMap: Record<Payment['payment_status'], any> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
    };
    
    const config = statusMap[status] || statusMap.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPaid = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-32">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-red-600 text-center py-4">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
        {payments.length > 0 && (
          <span className="text-sm text-gray-600">
            {payments.length} payment{payments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💳</div>
          <p>No payments recorded yet</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Paid:</span>
              <span className="text-xl font-bold text-green-600">
                {totalPaid.toLocaleString()}đ
              </span>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getPaymentMethodIcon(payment.payment_method)}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(payment.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {payment.amount.toLocaleString()}đ
                    </div>
                    {getPaymentStatusBadge(payment.payment_status)}
                  </div>
                </div>

                {payment.transaction_id && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-medium">Transaction ID:</span>
                      <code className="bg-white px-2 py-1 rounded border border-gray-200">
                        {payment.transaction_id}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default PaymentHistory;
