import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  table_number?: string;
  customer_name?: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  items?: any[];
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock order data for testing
    // In production, fetch from API: await orderService.getOrder(orderId)
    setTimeout(() => {
      setOrder({
        id: orderId || '15ec68bf',
        order_number: 'ORD-20251005-001',
        order_type: 'dine_in',
        table_number: 'T001',
        customer_name: 'Customer Name',
        total_amount: 14.09,
        payment_status: 'pending',
        status: 'confirmed',
        created_at: new Date().toISOString(),
        items: [
          { name: 'Pizza', quantity: 1, price: 12.00 },
          { name: 'Drink', quantity: 1, price: 2.09 }
        ]
      });
      setLoading(false);
    }, 500);
  }, [orderId]);

  const handlePayNow = () => {
    if (!order) return;

    // Navigate to payment processing page
    navigate('/payment/process', {
      state: {
        orderNumber: order.order_number,
        amount: order.total_amount,
        orderId: order.id
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 text-lg">Order not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Orders
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-500 hover:text-blue-600 flex items-center mb-4"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order.order_number}
          </h1>
        </div>

        {/* Order Information */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Information
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Type</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {order.order_type.replace('_', ' ')}
                </p>
              </div>

              {order.table_number && (
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-semibold text-gray-800">{order.table_number}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-800 capitalize">{order.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold text-gray-800">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Items
              </h2>
              
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Payment Information */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-semibold
                  ${order.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-orange-100 text-orange-600'
                  }
                `}>
                  {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            {order.payment_status === 'pending' && (
              <button
                onClick={handlePayNow}
                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold 
                         rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                💳 Process Payment
              </button>
            )}

            {order.payment_status === 'paid' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-600 font-semibold">
                  ✅ Payment completed successfully!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 
                     font-semibold rounded-lg transition-colors"
          >
            Back to Orders
          </button>

          <button
            className="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-600 
                     font-semibold rounded-lg transition-colors"
          >
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
