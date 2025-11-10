import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchFullMenu, fetchCategories, setCurrentCategory } from '../store/slices/menuSlice';

const MenuPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fullMenu, categories, isLoading, error } = useSelector((state: RootState) => state.menu);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFullMenu());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    dispatch(setCurrentCategory(categoryId));
  };

  const filteredMenu = selectedCategory 
    ? fullMenu.filter(section => section.category.id === selectedCategory)
    : fullMenu;

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gr-gold mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Error loading menu: {error}</p>
          <button 
            onClick={() => dispatch(fetchFullMenu())}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gr-black mb-4">
            Our <span className="text-gr-gold">Menu</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-6 py-2 rounded-full transition-colors ${
              selectedCategory === null
                ? 'bg-gr-gold text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {safeCategories.map((category) => (
           <button key={category} onClick={() => handleCategoryClick(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-gr-gold text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Sections */}
        {filteredMenu.map((section) => (
          <div key={section.category.id} className="mb-12">
            <div className="premium-card">
              <h2 className="text-3xl font-bold text-gr-black mb-2">
                {section.category.name}
              </h2>
              {section.category.description && (
                <p className="text-gray-600 mb-6">{section.category.description}</p>
              )}
              
              <div className="grid gap-6 md:grid-cols-2">
                {section.items.map((item: any) => (
                  <div key={item.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gr-black">
                            {item.name}
                          </h3>
                          {item.is_featured && (
                            <span className="bg-gr-gold text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </span>
                          )}
                          {!item.is_available && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 mb-2">{item.description}</p>
                        )}
                        
                        {/* Allergens & Dietary Info */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.dietary_info?.map((diet: string) => (
                            <span key={diet} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {diet}
                            </span>
                          ))}
                          {item.allergens?.map((allergen: string) => (
                            <span key={allergen} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Contains {allergen}
                            </span>
                          ))}
                        </div>
                        
                        {item.preparation_time && (
                          <p className="text-sm text-gray-500">
                            ⏱️ {item.preparation_time} minutes
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gr-gold">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {section.items.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No items available in this category.
                </p>
              )}
            </div>
          </div>
        ))}

        {fullMenu.length === 0 && !isLoading && (
          <div className="premium-card text-center">
            <h3 className="text-2xl font-bold text-gr-black mb-4">Menu Coming Soon</h3>
            <p className="text-gray-600">
              We're preparing something special for you. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;

