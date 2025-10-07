import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StripePaymentForm } from '../../components/payments/StripePaymentForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrderById } from '../../store/slices/orderSlice';

export const OrderPaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order from Redux store
  const order = useAppSelector((state) =>
    state.orders.orders.find((o) => o.id === orderId)
  );

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      // If order not in store, fetch it
      if (!order) {
        try {
          await dispatch(fetchOrderById(orderId)).unwrap();
        } catch (err: any) {
          console.error('Failed to load order:', err);
          setError(err.message || 'Failed to load order');
        }
      }

      setLoading(false);
    };

    loadOrder();
  }, [orderId, order, dispatch]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);

    // TODO: Update order status to 'paid' via API
    // For now, just navigate to success page

    // Show success message
    alert('Payment successful! 🎉');

    // Navigate to order details
    navigate(`/orders/${orderId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment failed:', errorMessage);
    setError(errorMessage);
  };

  const handleCancel = () => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg
              className="h-12 w-12 text-red-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Order
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">
            Order #{order.id} • {order.items?.length || 0} items
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

          {/* Order Items */}
          <div className="space-y-3 mb-4">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-gray-700">
                <span>
                  {item.quantity}x {item.name || item.menu_item?.name}
                </span>
                <span className="font-medium">
                  ${((item.price || item.menu_item?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            {order.subtotal !== undefined && (
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
            )}
            {order.tax_amount !== undefined && (
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${order.tax_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${order.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Order Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Status:</span>
              <span className="font-medium capitalize">{order.status}</span>
            </div>
            {order.customer_name && (
              <div className="flex justify-between mb-1">
                <span>Customer:</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
            )}
            {order.created_at && (
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <StripePaymentForm
          orderId={order.id}
          amount={order.total_amount || 0}
          customerEmail={order.customer_email}
          customerName={order.customer_name}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handleCancel}
        />

        {/* Test Cards Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            🧪 Test Mode - Use Test Cards
          </h3>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>
              <strong>Success:</strong> 4242 4242 4242 4242
            </p>
            <p>
              <strong>Requires authentication:</strong> 4000 0025 0000 3155
            </p>
            <p>
              <strong>Declined:</strong> 4000 0000 0000 9995
            </p>
            <p className="mt-2 text-yellow-700">
              Use any future expiry date, any 3-digit CVC, and any ZIP code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentPage;
