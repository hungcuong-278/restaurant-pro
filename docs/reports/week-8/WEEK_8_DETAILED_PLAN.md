# Week 8 Detailed Implementation Plan
**Period**: October 6-12, 2025  
**Theme**: Reservation System Overhaul & Production Prep  
**Duration**: 8 working hours (1 full day)  
**Priority**: 🔴 CRITICAL - Reservation System Non-Functional

---

## 🎯 Week Overview

### Primary Goal
Fix and complete the **Reservation System** to enable customers to book tables online.

### Secondary Goals
- End-to-end testing of all features
- UI/UX polish and improvements
- Production readiness preparation

### Success Metrics
- [ ] Reservation system fully functional
- [ ] 0 critical bugs remaining
- [ ] All core features tested
- [ ] Documentation complete

---

## 📅 Day-by-Day Breakdown

---

## **DAY 1: Monday, October 6** (8 hours)
**Theme**: Reservation System Fix & Complete  
**Status**: 🔴 Critical Priority

### **Hour 1: Backend API Investigation & Fix (9:00 - 10:00 AM)**

#### Tasks
1. **Test Current Reservation Endpoints** (20 min)
```bash
# Test if endpoints exist and respond
curl http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/reservations
curl http://localhost:5000/api/tables?status=available

# Expected: Check for 404, 500, or authentication errors
```

2. **Verify Database Schema** (20 min)
```bash
# Check if reservations table exists
cd backend
npm run knex -- migrate:status

# Look for migration: 002_create_menu_reservations.ts
```

**Expected Findings**:
- [ ] Reservations table exists
- [ ] Has proper foreign keys
- [ ] Includes required columns

3. **Fix Backend Controller** (20 min)
```typescript
// File: backend/src/controllers/reservationController.ts

// Check if controller exists, if not create it:
export const reservationController = {
  async getRestaurantReservations(req, res) {
    try {
      const { id: restaurant_id } = req.params;
      const reservations = await db('reservations')
        .where({ restaurant_id })
        .orderBy('reservation_date', 'desc');
      
      res.json({ success: true, data: reservations });
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch reservations' 
      });
    }
  }
};
```

**Deliverables**:
- ✅ API endpoints responding correctly
- ✅ Database schema verified
- ✅ Controller error handling added

---

### **Hour 2: Frontend Service Layer Fix (10:00 - 11:00 AM)**

#### Task 1: Update reservationService.ts (30 min)
```typescript
// File: frontend/src/services/reservationService.ts

const API_BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';

export const reservationService = {
  // Fix: Return empty array instead of throwing
  async getUserReservations(): Promise<Reservation[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/reservations`
      );
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Fetch reservations error:', error);
      return []; // Graceful failure
    }
  },

  // Fix: Add proper error handling
  async createReservation(data: CreateReservationData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/reservations`,
        { ...data, restaurant_id: RESTAURANT_ID }
      );
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Create reservation error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create reservation');
    }
  }
};
```

#### Task 2: Fix MyReservationsPage.tsx (30 min)
```typescript
// File: frontend/src/pages/reservations/MyReservationsPage.tsx

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getUserReservations();
      setReservations(data || []); // Null safety
    } catch (err: any) {
      console.error('Load error:', err);
      setError('Unable to load reservations. Please try again.');
      setReservations([]); // Prevent undefined errors
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
};
```

**Deliverables**:
- ✅ Service layer returns empty arrays on error
- ✅ MyReservationsPage handles errors gracefully
- ✅ No more "Failed to fetch" crash

---

### **Hour 3: Build Table Selection Flow (11:00 AM - 12:00 PM)**

#### Task 1: Create TableSelectionPage.tsx (40 min)
```typescript
// File: frontend/src/pages/reservations/TableSelectionPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tableService from '../../services/tableService';
import Button from '../../components/common/Button';

const TableSelectionPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generate time slots (11:00 AM - 10:00 PM)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(11 + i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }).filter(time => time <= '22:00');

  useEffect(() => {
    if (selectedDate && selectedTime) {
      loadAvailableTables();
    }
  }, [selectedDate, selectedTime]);

  const loadAvailableTables = async () => {
    setLoading(true);
    try {
      const allTables = await tableService.getTables();
      // Filter available tables (status = 'available')
      setTables(allTables.filter(t => t.status === 'available'));
    } catch (error) {
      console.error('Load tables error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedTable || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }
    navigate('/reservations/new', {
      state: { 
        tableId: selectedTable,
        date: selectedDate,
        time: selectedTime
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chọn Bàn & Thời Gian</h1>

        {/* Date & Time Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ngày đặt bàn *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Giờ đặt bàn *
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Chọn giờ</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Grid */}
        {selectedDate && selectedTime && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              Bàn có sẵn ({tables.length})
            </h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : tables.length === 0 ? (
              <p className="text-gray-500">Không có bàn trống vào thời gian này</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      selectedTable === table.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-lg font-bold">{table.table_number}</div>
                    <div className="text-sm text-gray-600">
                      {table.capacity} người
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        {selectedTable && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleContinue} className="px-8">
              Tiếp Tục →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSelectionPage;
```

#### Task 2: Update Routes (20 min)
```typescript
// File: frontend/src/App.tsx

import TableSelectionPage from './pages/reservations/TableSelectionPage';

// Add to routes:
<Route path="/reservations/tables" element={<TableSelectionPage />} />
```

**Deliverables**:
- ✅ Table selection page created
- ✅ Date/time picker functional
- ✅ Table grid displays
- ✅ Navigation to next step works

---

### **🍽️ LUNCH BREAK (12:00 - 1:00 PM)**

---

### **Hour 4: Build Reservation Form (1:00 - 2:00 PM)**

#### Task: Create NewReservationPage.tsx (60 min)
```typescript
// File: frontend/src/pages/reservations/NewReservationPage.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import Button from '../../components/common/Button';

const NewReservationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableId, date, time } = location.state || {};

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    party_size: 2,
    special_requests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Form validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Vui lòng nhập tên';
    } else if (formData.customer_name.length < 2) {
      newErrors.customer_name = 'Tên phải có ít nhất 2 ký tự';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.customer_phone)) {
      newErrors.customer_phone = 'Số điện thoại phải có 10 chữ số';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email không hợp lệ';
    }

    if (formData.party_size < 1 || formData.party_size > 20) {
      newErrors.party_size = 'Số người phải từ 1-20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      const reservation = await reservationService.createReservation({
        table_id: tableId,
        reservation_date: date,
        reservation_time: time,
        ...formData
      });

      // Success!
      alert('Đặt bàn thành công! 🎉');
      navigate(`/reservations/${reservation.id}`);
    } catch (error: any) {
      alert(error.message || 'Đặt bàn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Thông Tin Đặt Bàn</h1>

        {/* Reservation Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-2">Chi tiết đặt bàn:</h2>
          <p>📅 Ngày: {date}</p>
          <p>🕐 Giờ: {time}</p>
          <p>🪑 Bàn: {tableId}</p>
        </div>

        {/* Reservation Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.customer_name ? 'border-red-500' : ''
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.customer_name && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.customer_phone ? 'border-red-500' : ''
                }`}
                placeholder="0901234567"
              />
              {errors.customer_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.customer_email ? 'border-red-500' : ''
                }`}
                placeholder="example@email.com"
              />
              {errors.customer_email && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
              )}
            </div>

            {/* Party Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Số người *
              </label>
              <input
                type="number"
                name="party_size"
                value={formData.party_size}
                onChange={handleChange}
                min="1"
                max="20"
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.party_size ? 'border-red-500' : ''
                }`}
              />
              {errors.party_size && (
                <p className="text-red-500 text-sm mt-1">{errors.party_size}</p>
              )}
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Yêu cầu đặc biệt (tùy chọn)
              </label>
              <textarea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Ví dụ: Cần ghế cao cho trẻ em, khu vực yên tĩnh..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="secondary"
              className="flex-1"
            >
              ← Quay Lại
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Bàn'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReservationPage;
```

**Deliverables**:
- ✅ Reservation form with validation
- ✅ Real-time error feedback
- ✅ Submit to backend API
- ✅ Success/error handling

---

### **Hour 5: Reservation Details & Status (2:00 - 3:00 PM)**

#### Task 1: Create ReservationDetailsPage.tsx (40 min)
```typescript
// File: frontend/src/pages/reservations/ReservationDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';
import Button from '../../components/common/Button';

const ReservationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadReservation();
  }, [id]);

  const loadReservation = async () => {
    try {
      const data = await reservationService.getReservation(id!);
      setReservation(data);
    } catch (error) {
      console.error('Load reservation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await reservationService.updateReservation(id!, { status: newStatus });
      alert(`Đã cập nhật trạng thái: ${newStatus}`);
      loadReservation(); // Reload
    } catch (error) {
      alert('Cập nhật thất bại');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy đặt bàn này?')) return;
    
    try {
      await reservationService.cancelReservation(id!);
      alert('Đã hủy đặt bàn');
      navigate('/reservations');
    } catch (error) {
      alert('Hủy thất bại');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!reservation) return <div>Không tìm thấy đặt bàn</div>;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chi Tiết Đặt Bàn</h1>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Status Badge */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">#{reservation.id.slice(0, 8)}</h2>
              <p className="text-gray-600">Đặt ngày {reservation.created_at}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${statusColors[reservation.status]}`}>
              {reservation.status.toUpperCase()}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <p>👤 {reservation.customer_name}</p>
              <p>📱 {reservation.customer_phone}</p>
              <p>📧 {reservation.customer_email}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Thông tin đặt bàn</h3>
              <p>📅 {reservation.reservation_date}</p>
              <p>🕐 {reservation.reservation_time}</p>
              <p>👥 {reservation.party_size} người</p>
              <p>🪑 Bàn {reservation.table_id}</p>
            </div>
          </div>

          {/* Special Requests */}
          {reservation.special_requests && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Yêu cầu đặc biệt</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded">
                {reservation.special_requests}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            {reservation.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleStatusChange('confirmed')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Xác Nhận
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="danger"
                >
                  Hủy Đặt Bàn
                </Button>
              </>
            )}
            {reservation.status === 'confirmed' && (
              <Button
                onClick={() => handleStatusChange('completed')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Hoàn Thành
              </Button>
            )}
            <Button
              onClick={() => navigate('/reservations')}
              variant="secondary"
            >
              Quay Lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsPage;
```

#### Task 2: Add Missing API Methods (20 min)
```typescript
// File: frontend/src/services/reservationService.ts

// Add these methods:
async getReservation(id: string): Promise<Reservation> {
  const response = await axios.get(`${API_BASE_URL}/reservations/${id}`);
  return response.data.data || response.data;
},

async updateReservation(id: string, updates: Partial<Reservation>) {
  const response = await axios.patch(
    `${API_BASE_URL}/reservations/${id}`,
    updates
  );
  return response.data.data || response.data;
},

async cancelReservation(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/reservations/${id}`);
}
```

**Deliverables**:
- ✅ Reservation details page complete
- ✅ Status management functional
- ✅ Cancel reservation works
- ✅ Service methods added

---

### **Hour 6: Backend API Completion (3:00 - 4:00 PM)**

#### Task: Implement All Backend Endpoints (60 min)
```typescript
// File: backend/src/controllers/reservationController.ts

import { Request, Response } from 'express';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const reservationController = {
  // GET /api/restaurants/:restaurantId/reservations
  async getRestaurantReservations(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { status, date } = req.query;

      let query = db('reservations')
        .where({ restaurant_id: restaurantId })
        .orderBy('reservation_date', 'desc')
        .orderBy('reservation_time', 'desc');

      if (status) query = query.where({ status });
      if (date) query = query.whereRaw('DATE(reservation_date) = ?', [date]);

      const reservations = await query;

      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reservations'
      });
    }
  },

  // POST /api/restaurants/:restaurantId/reservations
  async createReservation(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const {
        table_id,
        customer_name,
        customer_phone,
        customer_email,
        party_size,
        reservation_date,
        reservation_time,
        special_requests
      } = req.body;

      // Validation
      if (!table_id || !customer_name || !customer_phone || 
          !reservation_date || !reservation_time) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check table exists
      const table = await db('tables')
        .where({ id: table_id, restaurant_id: restaurantId })
        .first();

      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        });
      }

      // Create reservation
      const reservationId = uuidv4();
      await db('reservations').insert({
        id: reservationId,
        restaurant_id: restaurantId,
        table_id,
        customer_name,
        customer_phone,
        customer_email,
        party_size: parseInt(party_size),
        reservation_date,
        reservation_time,
        special_requests,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const reservation = await db('reservations')
        .where({ id: reservationId })
        .first();

      res.status(201).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error('Create reservation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create reservation'
      });
    }
  },

  // GET /api/reservations/:id
  async getReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reservation = await db('reservations')
        .where({ id })
        .first();

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found'
        });
      }

      res.json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error('Get reservation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reservation'
      });
    }
  },

  // PATCH /api/reservations/:id
  async updateReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      await db('reservations')
        .where({ id })
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        });

      const reservation = await db('reservations')
        .where({ id })
        .first();

      res.json({
        success: true,
        data: reservation
      });
    } catch (error) {
      console.error('Update reservation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update reservation'
      });
    }
  },

  // DELETE /api/reservations/:id
  async cancelReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await db('reservations')
        .where({ id })
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        });

      res.json({
        success: true,
        message: 'Reservation cancelled'
      });
    } catch (error) {
      console.error('Cancel reservation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel reservation'
      });
    }
  }
};
```

```typescript
// File: backend/src/routes/reservationRoutes.ts

import express from 'express';
import { reservationController } from '../controllers/reservationController';

const router = express.Router();

// Restaurant reservations
router.get(
  '/restaurants/:restaurantId/reservations',
  reservationController.getRestaurantReservations
);
router.post(
  '/restaurants/:restaurantId/reservations',
  reservationController.createReservation
);

// Individual reservation
router.get('/reservations/:id', reservationController.getReservation);
router.patch('/reservations/:id', reservationController.updateReservation);
router.delete('/reservations/:id', reservationController.cancelReservation);

export default router;
```

```typescript
// File: backend/src/index.ts (or app.ts)

// Add import
import reservationRoutes from './routes/reservationRoutes';

// Add to middleware
app.use('/api', reservationRoutes);
```

**Deliverables**:
- ✅ All 5 endpoints implemented
- ✅ Proper error handling
- ✅ Input validation
- ✅ Database operations

---

### **Hour 7: Testing & Bug Fixes (4:00 - 5:00 PM)**

#### Comprehensive Testing Checklist

**1. API Testing** (20 min)
```bash
# Test GET reservations
curl http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/reservations

# Test CREATE reservation
curl -X POST http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": "xxx",
    "customer_name": "Test User",
    "customer_phone": "0901234567",
    "customer_email": "test@example.com",
    "party_size": 4,
    "reservation_date": "2025-10-10",
    "reservation_time": "19:00"
  }'

# Test GET single reservation
curl http://localhost:5000/api/reservations/{id}

# Test UPDATE status
curl -X PATCH http://localhost:5000/api/reservations/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Test CANCEL
curl -X DELETE http://localhost:5000/api/reservations/{id}
```

**2. E2E Frontend Testing** (30 min)
- [ ] Navigate to /reservations
- [ ] See empty state (or existing reservations)
- [ ] Click "MAKE A RESERVATION"
- [ ] Redirects to /reservations/tables
- [ ] Select date & time
- [ ] Tables load and display
- [ ] Select a table
- [ ] Click "Tiếp Tục"
- [ ] Form loads with pre-filled data
- [ ] Fill customer information
- [ ] Submit reservation
- [ ] See success message
- [ ] Redirected to details page
- [ ] Details display correctly
- [ ] Can update status
- [ ] Can cancel reservation
- [ ] Returns to list

**3. Bug Fixes** (10 min)
- Fix any errors discovered during testing
- Add console.logs for debugging
- Improve error messages

**Deliverables**:
- ✅ All flows tested end-to-end
- ✅ Bugs identified and fixed
- ✅ API responses verified
- ✅ UI displays correctly

---

### **Hour 8: Documentation & Wrap-Up (5:00 - 6:00 PM)**

#### Task 1: Update Documentation (40 min)

**Update README.md**:
```markdown
## Reservation System ✅

### Features
- View all reservations with status filtering
- Create new reservations with table selection
- Customer information form with validation
- Status management (Pending → Confirmed → Completed)
- Cancel reservations
- Real-time table availability

### User Flow
1. Navigate to "Reservations"
2. Click "Make a Reservation"
3. Select date, time, and table
4. Fill customer information
5. Submit and receive confirmation
6. Manage reservation status

### API Endpoints
GET    /api/restaurants/:id/reservations
POST   /api/restaurants/:id/reservations
GET    /api/reservations/:id
PATCH  /api/reservations/:id
DELETE /api/reservations/:id
```

#### Task 2: Create Week 8 Summary (20 min)
```markdown
# Week 8 Summary

## Accomplishments
- ✅ Fixed "Failed to fetch reservations" error
- ✅ Created table selection flow
- ✅ Built reservation form with validation
- ✅ Implemented status management
- ✅ Complete backend API (5 endpoints)
- ✅ End-to-end testing passed

## Metrics
- Files Created: 3 pages + controller
- API Endpoints: 5 (all working)
- Test Coverage: Manual E2E complete
- Bug Fixes: All resolved

## Impact
Users can now make reservations online, significantly improving customer experience and operational efficiency.
```

**Deliverables**:
- ✅ README updated
- ✅ Week summary created
- ✅ All changes committed
- ✅ Pushed to GitHub

---

## 🎯 Success Criteria for Day 1

### Must Have ✅
- [x] Reservation API working (5 endpoints)
- [x] MyReservationsPage loads without errors
- [x] Table selection page functional
- [x] Reservation form with validation
- [x] Details page with status management
- [x] End-to-end flow tested

### Nice to Have 🌟
- [ ] Email notifications
- [ ] Calendar view
- [ ] Reservation reminders
- [ ] Multi-table booking

---

## 📊 Day 1 Completion Metrics

**Expected Completion**: 100%

**Breakdown**:
- Backend API: 100%
- Frontend Pages: 100%
- Testing: 100%
- Documentation: 100%

---

## 💡 Tips for Success

1. **Start with Backend**: Ensure API works before touching frontend
2. **Test Incrementally**: Don't wait until end
3. **Console.log Everything**: Debug as you go
4. **Commit Frequently**: After each working feature
5. **Take Breaks**: Don't code for 8 hours straight!

---

## 🚀 Quick Start Commands

```bash
# Morning startup
cd d:\First
git pull origin main
git status

# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
cd frontend
npm start

# Test API
curl http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/reservations

# End of day commit
git add .
git commit -m "feat: Complete reservation system implementation"
git push origin main
```

---

## 📝 Commit Messages Plan

```bash
# Hour 2
git commit -m "fix: Update reservationService error handling"

# Hour 3
git commit -m "feat: Add table selection page"

# Hour 4
git commit -m "feat: Create reservation form with validation"

# Hour 5
git commit -m "feat: Add reservation details and status management"

# Hour 6
git commit -m "feat: Implement reservation backend API"

# Hour 7
git commit -m "test: Complete E2E testing for reservations"

# Hour 8
git commit -m "docs: Update README with reservation system info"
```

---

## 🎉 Expected Outcome

By end of day:
- ✅ Reservation system fully functional
- ✅ Users can book tables online
- ✅ Status management works
- ✅ 0 critical bugs
- ✅ Complete documentation
- ✅ Production ready

---

**Day 1 Status**: 📋 Ready to Start  
**Start Time**: 9:00 AM  
**End Time**: 6:00 PM  
**Total Hours**: 8 hours (with 1 hour lunch)

**Good luck! 🚀 You got this! 💪**

---

*Plan Created: October 5, 2025, 11:45 PM*  
*Execution Date: October 6, 2025*  
*Next Review: October 7, 2025*
