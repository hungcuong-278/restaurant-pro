import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import OrderStatusManager from '../../components/orders/OrderStatusManager';
import PaymentModal from '../../components/orders/PaymentModal';
import PaymentHistory from '../../components/orders/PaymentHistory';
import { orderService } from '../../services/orderService';
import type { Order } from '../../services/orderService';
import { useToast } from '../../contexts/ToastContext';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(orderId!);
      setOrder(response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load order details';
      setError(errorMsg);
      showError(errorMsg);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status timeline configuration
  const statusFlow = [
    { status: 'pending', label: 'Pending', icon: '⏱️' },
    { status: 'confirmed', label: 'Confirmed', icon: '✅' },
    { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { status: 'ready', label: 'Ready', icon: '🍽️' },
    { status: 'served', label: 'Served', icon: '🎉' },
    { status: 'completed', label: 'Completed', icon: '✔️' }
  ];

  // Get status index
  const getStatusIndex = (status: string) => {
    return statusFlow.findIndex(s => s.status === status);
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      await orderService.updateOrderStatus(order!.id, newStatus);
      await fetchOrderDetails(); // Refresh to get updated data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Handle cancel order button click
  const handleCancelOrderClick = () => {
    if (!order || order.payment_status === 'paid') {
      showWarning('Cannot cancel a paid order');
      return;
    }
    setShowCancelDialog(true);
  };

  // Confirm cancel order
  const handleConfirmCancelOrder = async () => {

    if (!order) return;

    try {
      setActionLoading(true);
      await orderService.updateOrderStatus(order.id, 'cancelled');
      showSuccess('Order cancelled successfully');
      setShowCancelDialog(false);
      fetchOrderDetails(); // Refresh
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle print order
  const handlePrintOrder = () => {
    window.print();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || 'Order not found'}
        </div>
        <Button onClick={() => navigate('/orders')}>
          ← Back to Orders
        </Button>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const canEdit = order.payment_status !== 'paid' && order.status !== 'completed' && order.status !== 'cancelled';
  const canCancel = order.payment_status !== 'paid' && order.status !== 'completed' && order.status !== 'cancelled';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="secondary" onClick={() => navigate('/orders')} className="mb-2">
            ← Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order?.id?.slice(0, 8) || 'N/A'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="secondary"
              onClick={() => showInfo('Edit order feature coming soon')}
              disabled={actionLoading}
            >
              ✏️ Edit
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              onClick={handleCancelOrderClick}
              disabled={actionLoading}
            >
              ❌ Cancel
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handlePrintOrder}
          >
            🖨️ Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Order Information</h2>
                <div className="space-y-1 text-gray-600">
                  <p><span className="font-medium">Table:</span> {order.table?.table_number || 'N/A'}</p>
                  <p><span className="font-medium">Created:</span> {formatDate(order.created_at)}</p>
                  {order.updated_at && (
                    <p><span className="font-medium">Updated:</span> {formatDate(order.updated_at)}</p>
                  )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge status={order?.status || 'pending'} size="lg" />
              <Badge status={order?.payment_status || 'unpaid'} size="lg" />
            </div>
          </div>            {/* Status Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: order.status === 'cancelled' ? '0%' : `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%`
                    }}
                  />
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {statusFlow.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex && order.status !== 'cancelled';
                    const isCurrent = index === currentStatusIndex && order.status !== 'cancelled';

                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-colors ${
                            isCompleted || isCurrent
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {step.icon}
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-xs font-medium ${
                            isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">❌ This order has been cancelled</p>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            {order.special_instructions && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">📝 Order Notes:</p>
                <p className="text-yellow-700">{order.special_instructions}</p>
              </div>
            )}
          </Card>

          {/* Order Status Management Card */}
          <OrderStatusManager
            currentStatus={order.status}
            paymentStatus={order.payment_status}
            onStatusChange={handleStatusChange}
          />

          {/* Order Items Card */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {index + 1}. {item.menu_item?.name || 'Item'}
                        </h4>
                        <span className="text-gray-600 ml-2">× {item.quantity}</span>
                      </div>
                      {item.special_instructions && (
                        <p className="text-sm text-gray-600 italic">
                          💬 {item.special_instructions}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {(item.unit_price || 0).toLocaleString()}đ each
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">
                        {((item.unit_price || 0) * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>{((order.total_amount || 0) / 1.1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%):</span>
                    <span>{((order.total_amount || 0) * 0.1 / 1.1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}đ</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">{(order.total_amount || 0).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No items in this order</p>
            )}
          </Card>
        </div>

        {/* Right Column - Payment Info */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>

            {/* Payment Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <Badge status={order?.payment_status || 'unpaid'} size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  {(order.total_amount || 0).toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Payment Actions */}
            {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full"
                >
                  💳 Process Payment
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Click to proceed with payment
                </p>
              </div>
            )}

            {order.payment_status === 'partial' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ Partial payment received. Remaining balance to be paid.
                </p>
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full mt-3"
                  size="sm"
                >
                  Complete Payment
                </Button>
              </div>
            )}

            {order.payment_status === 'paid' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✅ Payment completed successfully
                </p>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ❌ Order cancelled - No payment required
                </p>
              </div>
            )}

            {/* Payment History */}
            {order.payment_status !== 'unpaid' && (
              <div className="mt-6">
                <PaymentHistory orderId={order.id} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <Button
                variant="secondary"
                onClick={handlePrintOrder}
                className="w-full"
                size="sm"
              >
                🖨️ Print Receipt
              </Button>
              <Button
                variant="secondary"
                onClick={() => showInfo('Share feature coming soon')}
                className="w-full"
                size="sm"
              >
                📤 Share Order
              </Button>
              {/* OrderStatusManager component already handles status updates */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <Button
                  variant="secondary"
                  onClick={() => showInfo('Use the status manager above to update order status')}
                  className="w-full"
                  size="sm"
                >
                  🔄 Status Help
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && order && (
        <PaymentModal
          orderId={order.id}
          totalAmount={order.total_amount || 0}
          paidAmount={0} // TODO: Get from payment history
          paymentStatus={order.payment_status}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            fetchOrderDetails(); // Refresh order data
          }}
        />
      )}

      {/* Cancel Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        variant="danger"
        onConfirm={handleConfirmCancelOrder}
        onCancel={() => setShowCancelDialog(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default OrderDetailsPage;
