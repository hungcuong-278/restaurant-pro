import React from 'react';
import { MenuItem } from '../../services/menuService';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface OrderCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateInstructions: (itemId: string, instructions: string) => void;
  className?: string;
}

const OrderCart: React.FC<OrderCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateInstructions,
  className = '',
}) => {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (items.length === 0) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-600 text-lg mb-2">Your cart is empty</p>
        <p className="text-gray-500 text-sm">Add items from the menu to get started</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 order-cart-summary ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-xl font-bold">Order Summary</h3>
        <p className="text-sm text-blue-100">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Items List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.menuItem.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Item Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.menuItem.name}</h4>
                  <p className="text-sm text-gray-600">${item.menuItem.price.toFixed(2)} each</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.menuItem.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.menuItem.id, Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-gray-300 rounded-lg py-1 font-semibold"
                  />
                  <button
                    onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </div>
              </div>

              {/* Special Instructions */}
              <textarea
                placeholder="Special instructions (optional)..."
                value={item.specialInstructions || ''}
                onChange={(e) => onUpdateInstructions(item.menuItem.id, e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
        {/* Subtotal */}
        <div className="flex justify-between mb-2 text-gray-700">
          <span>Subtotal</span>
          <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
        </div>

        {/* Tax */}
        <div className="flex justify-between mb-3 text-gray-700">
          <span>Tax (10%)</span>
          <span className="font-semibold">${calculateTax().toFixed(2)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-300">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-green-600">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>

        {/* Item Count */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {items.reduce((sum, item) => sum + item.quantity, 0)} total items
        </div>
      </div>
    </div>
  );
};

export default OrderCart;
