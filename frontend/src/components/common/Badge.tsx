import React from 'react';

interface BadgeProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'unpaid' | 'partial' | 'paid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const statusConfig = {
    // Order statuses
    pending: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      label: 'Pending',
      icon: '⏳',
    },
    confirmed: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Confirmed',
      icon: '✓',
    },
    preparing: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Preparing',
      icon: '👨‍🍳',
    },
    ready: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Ready',
      icon: '🔔',
    },
    served: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Served',
      icon: '🍽️',
    },
    completed: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Completed',
      icon: '✅',
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Cancelled',
      icon: '❌',
    },
    // Payment statuses
    unpaid: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Unpaid',
      icon: '💰',
    },
    partial: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Partial',
      icon: '💳',
    },
    paid: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Paid',
      icon: '✓',
    },
  };

  const config = statusConfig[status];

  // Handle undefined or invalid status
  if (!config) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-800 ${sizeStyles[size]} ${className}`}
      >
        <span className="mr-1">❓</span>
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeStyles[size]} ${className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default Badge;
