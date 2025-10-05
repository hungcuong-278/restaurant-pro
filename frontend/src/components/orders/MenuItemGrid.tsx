import React, { useState, useEffect } from 'react';
import menuService, { MenuItem } from '../../services/menuService';
import MenuItemCard from './MenuItemCard';
import Spinner from '../common/Spinner';
import Input from '../common/Input';

interface MenuItemGridProps {
  onAddItem: (item: MenuItem) => void;
  className?: string;
}

const MenuItemGrid: React.FC<MenuItemGridProps> = ({ onAddItem, className = '' }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const [items, cats] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories(),
      ]);
      setMenuItems(items);
      setFilteredItems(items);
      setCategories(cats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = React.useCallback(() => {
    let filtered = [...menuItems];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchTerm]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">❌ {error}</p>
        <button
          onClick={fetchMenuItems}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Select Menu Items
        </h3>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="search"
            placeholder="🔍 Search menu items..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200
              ${selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(category => {
            const count = menuItems.filter(item => item.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-2">
            {searchTerm || selectedCategory !== 'all'
              ? '🔍 No items match your search'
              : '📋 No menu items available'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={onAddItem}
              />
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredItems.length} of {menuItems.length} items
          </div>
        </>
      )}
    </div>
  );
};

export default MenuItemGrid;
