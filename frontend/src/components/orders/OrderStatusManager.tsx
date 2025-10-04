import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

interface OrderStatusManagerProps {
  currentStatus: string;
  paymentStatus: string;
  onStatusChange: (newStatus: string) => Promise<void>;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({
  currentStatus,
  paymentStatus,
  onStatusChange
}) => {
  const [loading, setLoading] = useState(false);

  // Status flow configuration
  const statusFlow = [
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: '⏱️',
      color: 'warning',
      description: 'Waiting for confirmation'
    },
    { 
      value: 'confirmed', 
      label: 'Confirmed', 
      icon: '✅',
      color: 'info',
      description: 'Order confirmed, ready to prepare'
    },
    { 
      value: 'preparing', 
      label: 'Preparing', 
      icon: '👨‍🍳',
      color: 'info',
      description: 'Kitchen is preparing the order'
    },
    { 
      value: 'ready', 
      label: 'Ready', 
      icon: '🍽️',
      color: 'success',
      description: 'Ready to be served'
    },
    { 
      value: 'served', 
      label: 'Served', 
      icon: '🎉',
      color: 'success',
      description: 'Food has been served to customer'
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: '✔️',
      color: 'success',
      description: 'Order completed and paid'
    }
  ];

  const getCurrentStatusIndex = () => {
    return statusFlow.findIndex(s => s.value === currentStatus);
  };

  const getNextStatus = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getPreviousStatus = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex > 0) {
      return statusFlow[currentIndex - 1];
    }
    return null;
  };

  const canChangeStatus = () => {
    return currentStatus !== 'completed' && currentStatus !== 'cancelled';
  };

  const handleStatusUpdate = async (newStatus: string, direction: 'next' | 'previous' | 'jump') => {
    const statusInfo = statusFlow.find(s => s.value === newStatus);
    
    let confirmMessage = '';
    if (direction === 'next') {
      confirmMessage = `Advance order to "${statusInfo?.label}"?`;
    } else if (direction === 'previous') {
      confirmMessage = `Move order back to "${statusInfo?.label}"?`;
    } else {
      confirmMessage = `Change order status to "${statusInfo?.label}"?`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await onStatusChange(newStatus);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusInfo = statusFlow.find(s => s.value === currentStatus);
  const nextStatus = getNextStatus();
  const previousStatus = getPreviousStatus();

  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <span className="text-2xl">❌</span>
          <div>
            <div className="font-semibold">Order Cancelled</div>
            <div className="text-sm">This order has been cancelled and cannot be modified</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-2xl">✔️</span>
          <div>
            <div className="font-semibold">Order Completed</div>
            <div className="text-sm">This order has been completed successfully</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Management</h3>

      {/* Current Status Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentStatusInfo?.icon}</span>
            <div>
              <div className="font-semibold text-gray-900">
                Current Status: {currentStatusInfo?.label}
              </div>
              <div className="text-sm text-gray-600">
                {currentStatusInfo?.description}
              </div>
            </div>
          </div>
          <Badge status={(currentStatus || 'pending') as any} />
        </div>
      </div>

      {/* Quick Action Buttons */}
      {canChangeStatus() && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
          
          <div className="flex gap-2">
            {/* Previous Status Button */}
            {previousStatus && (
              <Button
                variant="secondary"
                onClick={() => handleStatusUpdate(previousStatus.value, 'previous')}
                disabled={loading}
                className="flex-1"
              >
                ← Back to {previousStatus.label}
              </Button>
            )}

            {/* Next Status Button */}
            {nextStatus && (
              <Button
                variant="primary"
                onClick={() => handleStatusUpdate(nextStatus.value, 'next')}
                disabled={loading}
                className="flex-1"
              >
                {nextStatus.icon} Advance to {nextStatus.label} →
              </Button>
            )}
          </div>

          {/* All Status Options */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
              Jump to specific status...
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {statusFlow.map((status) => {
                const isCurrent = status.value === currentStatus;
                const isPassed = getCurrentStatusIndex() > statusFlow.findIndex(s => s.value === status.value);
                
                return (
                  <button
                    key={status.value}
                    onClick={() => !isCurrent && handleStatusUpdate(status.value, 'jump')}
                    disabled={isCurrent || loading}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${isCurrent 
                        ? 'border-blue-500 bg-blue-50 cursor-not-allowed' 
                        : isPassed
                          ? 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{status.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {status.label}
                          {isCurrent && ' (Current)'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {status.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </details>

          {/* Warning for paid orders */}
          {paymentStatus === 'paid' && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> This order has been paid. Status changes will not affect payment.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatusManager;
