import React from 'react';

interface BadgeProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled' | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'served':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🔔';
      case 'served': return '🍽️';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${getStatusStyles()} ${sizeStyles[size]} ${className}`}>
      <span className="mr-1">{getStatusIcon()}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default Badge;