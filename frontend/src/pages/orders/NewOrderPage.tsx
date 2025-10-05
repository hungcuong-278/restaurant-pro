import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TableSelector from '../../components/orders/TableSelector';
import MenuItemGrid from '../../components/orders/MenuItemGrid';
import OrderCart, { CartItem } from '../../components/orders/OrderCart';
import Button from '../../components/common/Button';
import orderService from '../../services/orderService';
import { MenuItem } from '../../services/menuService';

type OrderType = 'dine-in' | 'takeout' | 'delivery';

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderInstructions, setOrderInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle table selection
  const handleSelectTable = (tableId: string, tableNumber: string) => {
    setSelectedTableId(tableId);
    setSelectedTableNumber(tableNumber);
  };

  // Handle adding item to cart
  const handleAddItem = (item: MenuItem) => {
    const existingItem = cartItems.find(ci => ci.menuItem.id === item.id);
    
    if (existingItem) {
      // Increase quantity if item already in cart
      setCartItems(cartItems.map(ci =>
        ci.menuItem.id === item.id
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      ));
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { menuItem: item, quantity: 1 }]);
    }
  };

  // Handle updating quantity
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.menuItem.id === itemId
        ? { ...item, quantity }
        : item
    ));
  };

  // Handle removing item
  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.menuItem.id !== itemId));
  };

  // Handle updating instructions
  const handleUpdateInstructions = (itemId: string, instructions: string) => {
    setCartItems(cartItems.map(item =>
      item.menuItem.id === itemId
        ? { ...item, specialInstructions: instructions }
        : item
    ));
  };

  // Validate current step
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return orderType === 'dine-in' ? selectedTableId : true;
    }
    if (currentStep === 2) {
      return cartItems.length > 0;
    }
    return true;
  };

  // Handle submit order
  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare order data
      const orderData = {
        table_id: orderType === 'dine-in' ? selectedTableId : undefined,
        order_type: orderType,
        items: cartItems.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })),
        special_instructions: orderInstructions,
      };

      // Create order
      const createdOrder = await orderService.createOrder(orderData);

      // Show success notification
      alert(`✅ Order ${createdOrder.order_number} created successfully!`);

      // Redirect to order details
      navigate(`/orders/${createdOrder.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
      console.error('Error creating order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (cartItems.length > 0) {
      if (window.confirm('Are you sure you want to cancel? Your cart will be cleared.')) {
        navigate('/orders');
      }
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Order</h1>
        <p className="text-gray-600">Follow the steps to create an order</p>
      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`
                  flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                  ${currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`
                    w-24 h-1 mx-2
                    ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-4">
          <span className="text-sm font-medium text-gray-700">Order Type & Table</span>
          <span className="text-sm font-medium text-gray-700">Select Items</span>
          <span className="text-sm font-medium text-gray-700">Review & Submit</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      )}

      {/* Step 1: Order Type & Table Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Order Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Select Order Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['dine-in', 'takeout', 'delivery'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setOrderType(type);
                    if (type !== 'dine-in') {
                      setSelectedTableId('');
                      setSelectedTableNumber('');
                    }
                  }}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200
                    ${orderType === type
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">
                    {type === 'dine-in' ? '🍽️' : type === 'takeout' ? '📦' : '🚚'}
                  </div>
                  <div className="font-semibold text-gray-800 capitalize">
                    {type.replace('-', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Table Selection (only for dine-in) */}
          {orderType === 'dine-in' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <TableSelector
                selectedTableId={selectedTableId}
                onSelectTable={handleSelectTable}
              />
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-between">
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => setCurrentStep(2)}
              variant="primary"
              disabled={!canProceedToNextStep()}
            >
              Next: Select Items →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Menu Item Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <MenuItemGrid onAddItem={handleAddItem} />
              </div>
            </div>

            {/* Cart (1/3 width - sticky) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
                <OrderCart
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onUpdateInstructions={handleUpdateInstructions}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button onClick={() => setCurrentStep(1)} variant="secondary">
              ← Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              variant="primary"
              disabled={!canProceedToNextStep()}
            >
              Review Order →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Order Type:</span>
                  <span className="font-semibold capitalize">
                    {orderType === 'dine-in' ? '🍽️' : orderType === 'takeout' ? '📦' : '🚚'}
                    {' '}{orderType.replace('-', ' ')}
                  </span>
                </div>

                {orderType === 'dine-in' && selectedTableNumber && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-semibold">Table {selectedTableNumber}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  placeholder="Any special requests or notes for this order..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Cart Summary */}
            <div>
              <OrderCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateInstructions={handleUpdateInstructions}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button onClick={() => setCurrentStep(2)} variant="secondary">
              ← Back to Menu
            </Button>
            <Button
              onClick={handleSubmitOrder}
              variant="success"
              size="large"
              loading={isSubmitting}
              disabled={isSubmitting || cartItems.length === 0}
            >
              {isSubmitting ? 'Creating Order...' : '✅ Create Order'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewOrderPage;
