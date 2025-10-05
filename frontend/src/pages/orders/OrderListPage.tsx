import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import OrderListSkeleton from '../../components/common/OrderListSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { orderService } from '../../services/orderService';
import type { Order } from '../../services/orderService';
import { useToast } from '../../contexts/ToastContext';

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 12;
  
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Fetch orders with debounce
  useEffect(() => {
    // Debounce to avoid multiple rapid calls
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (paymentFilter !== 'all') filters.paymentStatus = paymentFilter;
      
      const response = await orderService.getAllOrders(filters);
      console.log('Fetched orders:', response);
      console.log('Orders data:', response.data);
      // Ensure we always set an array
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      // Graceful handling of rate limiting
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment before refreshing.');
        showWarning('Please wait a moment before refreshing.');
      } else {
        const errorMsg = err.message || 'Failed to fetch orders';
        setError(errorMsg);
        showError(errorMsg);
      }
      setOrders([]); // Set empty array on error
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by search query
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order?.id?.toString().includes(query) ||
      order?.table?.table_number?.toLowerCase().includes(query) ||
      order?.table?.location?.toLowerCase().includes(query)
    );
  });

  // Paginate orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setCurrentPage(1);
    setSelectedOrders(new Set());
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedOrders.size === currentOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map(order => order.id)));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) {
      showWarning('Please select orders and a status');
      return;
    }

    const confirmMessage = `Update ${selectedOrders.size} order(s) to status "${bulkStatus}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setBulkLoading(true);
      
      // Update each order
      const promises = Array.from(selectedOrders).map(orderId =>
        orderService.updateOrderStatus(orderId, bulkStatus)
      );
      
      await Promise.all(promises);
      
      // Refresh orders
      await fetchOrders();
      
      // Clear selection
      setSelectedOrders(new Set());
      setBulkStatus('');
      
      showSuccess(`Successfully updated ${selectedOrders.size} order(s)`);
    } catch (err: any) {
      showError(err.message || 'Failed to update orders');
    } finally {
      setBulkLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" text="Loading orders..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={() => navigate('/orders/new')}
          icon="+"
          className="w-full sm:w-auto"
        >
          New Order
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <Card className="mb-4 bg-blue-50 border-2 border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="font-semibold text-blue-900">
                ✓ {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedOrders(new Set())}
              >
                Clear Selection
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <Button
                variant="primary"
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || bulkLoading}
                loading={bulkLoading}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search by order ID or table number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon="🔍"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partially Paid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={fetchOrders}
        />
      )}

      {/* Loading State */}
      {loading && <OrderListSkeleton />}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <EmptyState
          icon="📋"
          title="No orders found"
          description={
            searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'Try adjusting your filters to see more results'
              : 'Create your first order to get started'
          }
          actionText={(!searchQuery && statusFilter === 'all' && paymentFilter === 'all') ? '+ Create First Order' : undefined}
          onAction={(!searchQuery && statusFilter === 'all' && paymentFilter === 'all') ? () => navigate('/orders/new') : undefined}
          variant={searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' ? 'search' : 'default'}
        />
      )}

      {/* Orders Grid */}
      {currentOrders.length > 0 && (
        <>
          {/* Select All / Deselect All */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedOrders.size === currentOrders.length ? '☐ Deselect All' : '☑ Select All'}
            </Button>
            <p className="text-sm text-gray-600">
              Showing {currentOrders.length} of {filteredOrders.length} orders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {currentOrders.map((order) => (
              <Card
                key={order.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedOrders.has(order.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectOrder(order.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  
                  {/* Order Info */}
                  <div className="flex-1 flex items-start justify-between ml-3" onClick={() => navigate(`/orders/${order.id}`)}>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.order_type === 'dine_in' ? '🍽️ Dine In' : 
                         order.order_type === 'takeout' ? '🥡 Takeout' : 
                         order.order_type === 'delivery' ? '🚚 Delivery' : 
                         'Order'}
                        {order.order_type === 'dine_in' && ` - ${order.table?.location || `Table ${order.table?.table_number}` || 'N/A'}`}
                      </p>
                    </div>
                    <Badge status={order?.status || 'pending'} />
                  </div>
                </div>

                {/* Order Details */}
                <div onClick={() => navigate(`/orders/${order.id}`)}>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="mb-3">
                    <Badge status={order?.payment_status || 'unpaid'} size="sm" />
                  </div>

                  {/* Order Time */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>📅 {formatDate(order.created_at)}</span>
                    <span>🕐 {formatTime(order.created_at)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderListPage;

