import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MenuManagementPage.css';

const API_BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'e22b109c-48a8-4fd7-a7ab-f74295945668';

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  cost?: number;
  image_url?: string;
  allergens?: string[];
  dietary_info?: string[];
  preparation_time?: number;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // From JOIN with menu_categories
  category_name?: string;
  category_slug?: string;
}

interface MenuItemFormData {
  name: string;
  category_id: string;
  description: string;
  price: number;
  image_url: string;
  preparation_time: number;
  is_available: boolean;
  is_featured: boolean;
}

const MenuManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    category_id: '',
    description: '',
    price: 0,
    image_url: '',
    preparation_time: 0,
    is_available: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/categories`, {
        params: { restaurant_id: RESTAURANT_ID }
      });
      const data = response.data.data || response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/menu/items`, {
        params: { 
          restaurant_id: RESTAURANT_ID,
          limit: 100 
        }
      });
      const data = response.data.data || response.data;
      const items = data.items || data;
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category_id: item.category_id || '',
        description: item.description || '',
        price: item.price,
        image_url: item.image_url || '',
        preparation_time: item.preparation_time || 0,
        is_available: item.is_available,
        is_featured: item.is_featured,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        description: '',
        price: 0,
        image_url: '',
        preparation_time: 0,
        is_available: true,
        is_featured: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: '',
      description: '',
      price: 0,
      image_url: '',
      preparation_time: 0,
      is_available: true,
      is_featured: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        restaurant_id: RESTAURANT_ID,
        price: Number(formData.price),
        preparation_time: Number(formData.preparation_time),
      };

      if (editingItem) {
        // Update
        await axios.patch(
          `${API_BASE_URL}/menu/items/${editingItem.id}`,
          payload
        );
      } else {
        // Create
        await axios.post(
          `${API_BASE_URL}/menu/items`,
          payload
        );
      }

      fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/menu/items/${itemId}`, {
        params: { restaurant_id: RESTAURANT_ID }
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/menu/items/${item.id}`,
        { is_available: !item.is_available }
      );
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_id === selectedCategory);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="menu-management-page">
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Menu Management</h1>
          <button onClick={() => handleOpenModal()} className="add-button">
            + Add New Item
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="category-filters">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(category => {
            const count = menuItems.filter(item => item.category_id === category.id).length;
            return (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading menu items...</div>
      ) : (
        <div className="menu-items-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Prep Time</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="item-name">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="item-thumb" />
                      )}
                      <div>
                        <strong>{item.name}</strong>
                        {item.description && (
                          <p className="item-desc">{item.description.substring(0, 60)}...</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{item.category_name || getCategoryName(item.category_id)}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.preparation_time || 0} min</td>
                  <td>
                    <button
                      className={`status-badge ${item.is_available ? 'available' : 'unavailable'}`}
                      onClick={() => handleToggleAvailability(item)}
                    >
                      {item.is_available ? '✓ Available' : '✕ Unavailable'}
                    </button>
                  </td>
                  <td>
                    {item.is_featured && <span className="featured-badge">⭐ Featured</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleOpenModal(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category *</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preparation_time">Prep Time (min)</label>
                  <input
                    type="number"
                    id="preparation_time"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image_url">Image URL</label>
                <input
                  type="url"
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  Available for ordering
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  Featured item
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPage;
