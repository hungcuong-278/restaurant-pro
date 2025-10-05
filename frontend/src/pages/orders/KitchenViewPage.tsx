import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { orderService } from '../../services/orderService';
import type { Order } from '../../services/orderService';

const KitchenViewPage: React.FC = () => {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'confirmed', 'preparing']);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Kitchen-relevant statuses
  const kitchenStatuses = [
    { value: 'pending', label: 'Pending', icon: '⏱️', color: 'bg-orange-100 text-orange-800' },
    { value: 'confirmed', label: 'Confirmed', icon: '✅', color: 'bg-blue-100 text-blue-800' },
    { value: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ready', label: 'Ready', icon: '🍽️', color: 'bg-green-100 text-green-800' },
  ];

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all orders and filter client-side for multiple statuses
      const response = await orderService.getAllOrders({});
      const allOrders = Array.isArray(response.data) ? response.data : [];
      
      // Filter by selected statuses
      const filteredOrders = allOrders.filter(order => 
        selectedStatuses.includes(order.status)
      );
      
      // Sort by created_at (oldest first - most urgent)
      const sortedOrders = filteredOrders.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setOrders(sortedOrders);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatuses]);

  // Fetch orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  // Toggle status filter
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Get time elapsed since order creation
  const getTimeElapsed = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  // Get urgency class based on time
  const getUrgencyClass = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMins = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diffMins > 30) return 'border-red-500 border-2'; // Very urgent
    if (diffMins > 15) return 'border-orange-500 border-2'; // Urgent
    return 'border-gray-200'; // Normal
  };

  // Format date/time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get next status for quick action
  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: { [key: string]: string } = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'served',
    };
    return statusFlow[currentStatus] || null;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              👨‍🍳 Kitchen View
            </h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
              {loading && <span className="ml-2 text-blue-600">Refreshing...</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <Button
              variant={autoRefresh ? 'primary' : 'secondary'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </Button>
            
            {/* Manual refresh */}
            <Button
              variant="secondary"
              onClick={fetchOrders}
              disabled={loading}
              size="sm"
            >
              🔄 Refresh Now
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-3 flex-wrap">
          {kitchenStatuses.map(status => (
            <button
              key={status.value}
              onClick={() => toggleStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStatuses.includes(status.value)
                  ? status.color + ' ring-2 ring-offset-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{status.icon}</span>
              {status.label}
              <span className="ml-2 font-bold">
                ({orders.filter(o => o.status === status.value).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No orders in selected statuses</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => {
            const nextStatus = getNextStatus(order.status);
            
            return (
              <Card
                key={order.id}
                className={`hover:shadow-lg transition-all ${getUrgencyClass(order.created_at)}`}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {order.order_type === 'dine_in' ? `🍽️ Table ${order.table?.table_number || 'N/A'}` : 
                       order.order_type === 'takeout' ? '🥡 Takeout' : 
                       order.order_type === 'delivery' ? '🚚 Delivery' : 
                       'Order'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Order #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge status={order.status as any} size="sm" />
                </div>

                {/* Time Info */}
                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatTime(order.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Elapsed:</span>
                    <span className="font-bold text-orange-600">
                      {getTimeElapsed(order.created_at)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 max-h-40 overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Items:</div>
                  <div className="space-y-2">
                    {order.items && order.items.map((item, index) => (
                      <div key={item.id || index} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-gray-900">
                            {item.quantity}x {item.menu_item?.name || 'Item'}
                          </span>
                        </div>
                        {item.special_instructions && (
                          <p className="text-xs text-orange-600 mt-1 italic">
                            💬 {item.special_instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                {order.special_instructions && (
                  <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">📝 Order Notes:</p>
                    <p className="text-xs text-yellow-900">{order.special_instructions}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {nextStatus && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleStatusUpdate(order.id, nextStatus)}
                      size="sm"
                    >
                      ➡️ Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                    </Button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      size="sm"
                    >
                      ✅ Ready for Serving
                    </Button>
                  )}
                </div>

                {/* Payment Status Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Payment:</span>
                    <Badge status={order.payment_status as any} size="sm" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {kitchenStatuses.map(status => {
          const count = orders.filter(o => o.status === status.value).length;
          return (
            <Card key={status.value} className="text-center">
              <div className="text-3xl mb-1">{status.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{status.label}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenViewPage;
