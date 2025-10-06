import React from 'react';
import { MenuItem } from '../../services/menuService';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  disabled?: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd, disabled = false }) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200
      ${!item.is_available || disabled ? 'opacity-60' : ''}
    `}>
      {/* Image */}
      <div className="h-40 bg-gray-200 relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
        
        {/* Availability Badge */}
        {!item.is_available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Unavailable
          </div>
        )}

        {/* Category Badge */}
        {item.category && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
            {typeof item.category === 'string' ? item.category : item.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1 truncate" title={item.name}>
          {item.name}
        </h3>
        
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={item.description}>
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {/* Price */}
          <span className="text-2xl font-bold text-green-600">
            {Math.round(item.price).toLocaleString('vi-VN')}₫
          </span>

          {/* Add Button */}
          <button
            onClick={() => onAdd(item)}
            disabled={!item.is_available || disabled}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${item.is_available && !disabled
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {item.is_available ? '➕ Add' : 'Out of Stock'}
          </button>
        </div>

        {/* Preparation Time */}
        {item.preparation_time && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            ⏱️ ~{item.preparation_time} min
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;
