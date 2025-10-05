import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import TableListSkeleton from '../../components/common/TableListSkeleton';
import MenuItemsSkeleton from '../../components/common/MenuItemsSkeleton';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';
import menuService, { MenuItem, MenuCategory } from '../../services/menuService';
import { Table } from '../../types/table';
import { useToast } from '../../contexts/ToastContext';

// Cart item type
interface CartItem {
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  special_instructions: string;
  subtotal: number;
}

// Constants
const RESTAURANT_ID = '2c88c32a-03ba-4ef3-96e4-f37cf4b165de'; // Golden Fork Restaurant UUID

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  // State management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  // Form state
  const [orderType, setOrderType] = useState<'dine_in' | 'takeout' | 'delivery'>('dine_in');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tables, categories, and menu items in parallel
      const [tablesData, categoriesData, menuData] = await Promise.all([
        tableService.getTables(RESTAURANT_ID, 'available'),
        menuService.getCategories(),
        menuService.getMenuItems({ available: true })
      ]);

      setTables(tablesData);
      setCategories(categoriesData);
      setMenuItems(menuData.items);
      setFilteredItems(menuData.items);
    } catch (err: any) {
      const errorMsg = err.response?.status === 429 
        ? 'Too many requests. Please wait a moment and refresh the page.'
        : err.message || 'Failed to load data';
      setError(errorMsg);
      console.error('Error fetching data:', err);
      
      // Log detailed error for debugging
      if (err.response?.status === 429) {
        console.error('Rate limit exceeded. Please wait before retrying.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items by category and search
  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchQuery, menuItems]);

  // Cart operations
  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menu_item_id === menuItem.id);

    if (existingItem) {
      // Increase quantity if already in cart
      updateQuantity(menuItem.id, existingItem.quantity + 1);
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        menu_item_id: menuItem.id,
        menu_item: menuItem,
        quantity: 1,
        special_instructions: '',
        subtotal: menuItem.price
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(menuItemId);
      return;
    }

    setCart(cart.map(item =>
      item.menu_item_id === menuItemId
        ? { ...item, quantity: newQuantity, subtotal: item.menu_item.price * newQuantity }
        : item
    ));
  };

  const updateInstructions = (menuItemId: string, instructions: string) => {
    setCart(cart.map(item =>
      item.menu_item_id === menuItemId
        ? { ...item, special_instructions: instructions }
        : item
    ));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menu_item_id !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  // Submit order
  const handleSubmitOrder = async () => {
    // Validation
    if (orderType === 'dine_in' && !selectedTable) {
      showWarning('Please select a table for dine-in orders');
      setError('Please select a table for dine-in orders');
      return;
    }

    if (cart.length === 0) {
      showWarning('Please add at least one item to the order');
      setError('Please add at least one item to the order');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare order data
      const orderData = {
        order_type: orderType,
        table_id: orderType === 'dine_in' ? selectedTable : undefined,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined
        })),
        special_instructions: orderNotes || undefined
      };

      // Create order
      const response = await orderService.createOrder(orderData);

      console.log('Order created successfully:', response);

      // Show success toast
      showSuccess('Order created successfully! Redirecting to order details...');

      // Success! Navigate to order details
      // Axios AxiosResponse<OrderResponse> -> response.data = OrderResponse -> response.data.data = Order
      const orderResponse = response as any; // Type assertion to handle axios response
      if (orderResponse.data?.data?.id) {
        navigate(`/orders/${orderResponse.data.data.id}`);
      } else if (orderResponse.data?.id) {
        // Fallback if response structure is different
        navigate(`/orders/${orderResponse.data.id}`);
      } else {
        console.error('Order created but no ID returned:', orderResponse);
        showError('Order created but unable to view details');
        setError('Order created but unable to view details');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create order';
      showError(errorMsg);
      setError(errorMsg);
      console.error('Error creating order:', err);
    } finally {
      setSubmitting(false);
    }
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

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
        <Button variant="secondary" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Type, Table Selection & Menu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selection */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Select Order Type</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === 'dine_in'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🍽️</div>
                  <div className="font-semibold text-gray-900">Dine In</div>
                  <div className="text-xs text-gray-500">Eat at restaurant</div>
                </div>
              </button>

              <button
                onClick={() => setOrderType('takeout')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === 'takeout'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🥡</div>
                  <div className="font-semibold text-gray-900">Takeout</div>
                  <div className="text-xs text-gray-500">Take away</div>
                </div>
              </button>

              <button
                onClick={() => setOrderType('delivery')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  orderType === 'delivery'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🚚</div>
                  <div className="font-semibold text-gray-900">Delivery</div>
                  <div className="text-xs text-gray-500">Deliver to address</div>
                </div>
              </button>
            </div>
          </Card>

          {/* Table Selection - Only for Dine In */}
          {orderType === 'dine_in' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Select Table</h2>
              
              {loading ? (
                <TableListSkeleton />
              ) : tables.length === 0 ? (
                <p className="text-gray-500">No available tables</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTable === table.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🪑</div>
                      <div className="font-semibold text-gray-900">Table {table.number}</div>
                      <div className="text-sm text-gray-500">{table.capacity} seats</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            </Card>
          )}

          {/* Menu Items */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {orderType === 'dine_in' ? '3' : '2'}. Select Menu Items
            </h2>

            {/* Search & Category Filter */}
            <div className="mb-4 space-y-3">
              <Input
                type="text"
                placeholder="🔍 Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            {loading ? (
              <MenuItemsSkeleton />
            ) : filteredItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No items found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const cartItem = cart.find(ci => ci.menu_item_id === item.id);
                  const inCart = !!cartItem;

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-all ${
                        inCart ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:shadow'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        {item.is_featured && (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">⭐ Featured</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-blue-600">
                          {item.price.toLocaleString()}đ
                        </span>
                        
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateQuantity(item.id, cartItem!.quantity - 1)}
                            >
                              −
                            </Button>
                            <span className="font-semibold w-8 text-center">{cartItem!.quantity}</span>
                            <Button
                              size="sm"
                              onClick={() => updateQuantity(item.id, cartItem!.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => addToCart(item)}>
                            ➕ Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Order Cart */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Selected Table Display */}
              {selectedTable && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Table</div>
                  <div className="font-semibold text-gray-900">
                    Table {tables.find(t => t.id === selectedTable)?.number}
                  </div>
                </div>
              )}

              {/* Cart Items */}
              {cart.length === 0 ? (
                <EmptyState
                  icon="🛒"
                  title="Cart is Empty"
                  description="Browse the menu and add items to your cart to get started"
                />
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.menu_item_id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.menu_item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.menu_item.price.toLocaleString()}đ × {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.menu_item_id)}
                          className="text-red-600 hover:text-red-800 text-xl"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <span className="ml-auto font-bold text-gray-900">
                          {item.subtotal.toLocaleString()}đ
                        </span>
                      </div>

                      {/* Special Instructions */}
                      <Input
                        type="text"
                        placeholder="Special instructions (optional)"
                        value={item.special_instructions}
                        onChange={(e) => updateInstructions(item.menu_item_id, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Order Notes */}
              {cart.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special requests for this order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}

              {/* Order Summary */}
              {cart.length > 0 && (
                <>
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>{subtotal.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (10%):</span>
                      <span>{tax.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-blue-600">{total.toLocaleString()}đ</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={!selectedTable || cart.length === 0 || submitting}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="inline mr-2" />
                        Creating Order...
                      </>
                    ) : (
                      <>✅ Place Order ({total.toLocaleString()}đ)</>
                    )}
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPage;
