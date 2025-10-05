import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { orderService, Order } from '../../services/orderService';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order from API
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrder(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Handle status update
  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!orderId) return;

    try {
      setUpdating(true);
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      // Show success message (you can add toast notification here)
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Get next status and button style
  const getStatusButton = () => {
    if (!order) return null;

    const statusConfig: Record<Order['status'], { next: Order['status']; label: string; variant: any }> = {
      'pending': { next: 'confirmed', label: '✅ Confirm Order', variant: 'primary' },
      'confirmed': { next: 'preparing', label: '👨‍🍳 Start Preparing', variant: 'success' },
      'preparing': { next: 'ready', label: '🍽️ Mark Ready', variant: 'success' },
      'ready': { next: 'served', label: '✔️ Mark Served', variant: 'primary' },
      'served': { next: 'served', label: '✅ Served', variant: 'secondary' },
      'cancelled': { next: 'cancelled', label: '❌ Cancelled', variant: 'danger' }
    };

    const config = statusConfig[order.status];
    if (!config) return null;

    return (
      <Button
        variant={config.variant}
        size="lg"
        onClick={() => handleStatusUpdate(config.next)}
        disabled={updating || order.status === 'served' || order.status === 'cancelled'}
        className="flex-1"
      >
        {updating ? 'Updating...' : config.label}
      </Button>
    );
  };

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
        <Spinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-600 text-lg mb-4">
            {error || 'Order not found'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/orders')}
            >
              Back to Orders
            </Button>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
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
                  {order.order_type.replace(/-/g, ' ')}
                </p>
              </div>

              {order.table?.table_number && (
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-semibold text-gray-800">{order.table.table_number}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge status={order.status} size="lg" />
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

        {/* Status Update Actions */}
        {order.status !== 'served' && order.status !== 'cancelled' && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Actions
              </h2>
              <div className="flex gap-3">
                {getStatusButton()}
                
                {order.status === 'pending' && (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="flex-1"
                  >
                    ❌ Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Items
              </h2>
              
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {item.menu_item?.name || 'Unknown Item'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                      {item.special_instructions && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <div className="pt-3 mt-3 border-t-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
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
                    : order.payment_status === 'partially_paid'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-orange-100 text-orange-600'
                  }
                `}>
                  {order.payment_status === 'paid' ? '✅ Paid' : 
                   order.payment_status === 'partially_paid' ? '💵 Partially Paid' : '⏳ Unpaid'}
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
            {(order.payment_status === 'unpaid' || order.payment_status === 'partially_paid') && (
              <Button
                variant="primary"
                size="lg"
                onClick={handlePayNow}
                className="w-full mt-6"
              >
                💳 Process Payment
              </Button>
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
        <div className="flex gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/orders')}
            className="flex-1"
          >
            ← Back to Orders
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="flex-1"
          >
            🖨️ Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
