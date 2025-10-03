# 🎯 Week 6 - Phase 4: Reservation Frontend

**Date:** October 3, 2025  
**Status:** 🚀 STARTING  
**Priority:** HIGH - Core Feature

---

## 📋 Phase 4 Overview

### **Objective:**
Build complete reservation system frontend with table selection, date/time picker, and booking confirmation.

### **Dependencies:**
- ✅ Backend reservation endpoints (already exists)
- ✅ Table management system (Phase 3 - complete)
- ✅ Authentication system (complete)

---

## 🏗️ Architecture Plan

### **1. Type Definitions**
**File:** `frontend/src/types/reservation.ts`

```typescript
export interface Reservation {
  id: string;
  restaurantId: string;
  tableId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:MM
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  restaurantId: string;
  tableId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  duration?: number;
  specialRequests?: string;
}

export interface TableAvailability {
  tableId: string;
  tableNumber: string;
  capacity: number;
  status: string;
  available: boolean;
}
```

---

## 🎨 Component Structure

### **Component Hierarchy:**

```
ReservationPage/
├── DateTimePicker
│   ├── DateCalendar
│   └── TimeSlotSelector
├── TableSelector
│   ├── AvailableTablesList
│   └── TableCard
├── ReservationForm
│   ├── CustomerInfoForm
│   └── SpecialRequestsInput
└── ReservationSummary
    └── BookingConfirmation
```

---

## 📦 Implementation Tasks

### **Task 1: Type Definitions** ✅
**Files:**
- `frontend/src/types/reservation.ts` (NEW)

**Content:**
- Reservation interface
- CreateReservationDto
- TableAvailability interface
- Status enums

**Estimated Time:** 15 minutes

---

### **Task 2: Redux Slice - reservationSlice** 🔄
**File:** `frontend/src/store/slices/reservationSlice.ts` (NEW)

**State:**
```typescript
interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  availableTables: TableAvailability[];
  selectedDate: string | null;
  selectedTime: string | null;
  selectedTable: string | null;
  isLoading: boolean;
  error: string | null;
}
```

**Async Thunks:**
1. `fetchAvailableTables(date, time, partySize)`
2. `createReservation(reservationData)`
3. `fetchUserReservations(userId)`
4. `cancelReservation(reservationId)`
5. `updateReservation(reservationId, updates)`

**Reducers:**
- `setSelectedDate`
- `setSelectedTime`
- `setSelectedTable`
- `clearSelection`

**Estimated Time:** 45 minutes

---

### **Task 3: API Service Layer** 🔄
**File:** `frontend/src/services/reservationService.ts` (NEW)

**Functions:**
```typescript
- getAvailableTables(restaurantId, date, time, partySize)
- createReservation(reservationData)
- getUserReservations(userId)
- getReservationById(reservationId)
- updateReservation(reservationId, updates)
- cancelReservation(reservationId)
- checkAvailability(restaurantId, date, time)
```

**Estimated Time:** 30 minutes

---

### **Task 4: DateTimePicker Component** 🔄
**File:** `frontend/src/components/reservations/DateTimePicker.tsx` (NEW)

**Features:**
- Calendar view for date selection
- Disable past dates
- Highlight available dates
- Time slot grid (e.g., 11:00 AM, 11:30 AM, ...)
- Show available/unavailable slots
- Business hours validation

**Props:**
```typescript
interface DateTimePickerProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  restaurantId: string;
  partySize: number;
}
```

**Estimated Time:** 1.5 hours

---

### **Task 5: TableSelector Component** 🔄
**File:** `frontend/src/components/reservations/TableSelector.tsx` (NEW)

**Features:**
- Display available tables based on date/time/party size
- Table cards with:
  - Table number
  - Capacity
  - Location (optional)
  - "Select" button
- Selected state highlighting
- Filter by capacity
- Empty state when no tables available

**Props:**
```typescript
interface TableSelectorProps {
  availableTables: TableAvailability[];
  selectedTable: string | null;
  onTableSelect: (tableId: string) => void;
  partySize: number;
}
```

**Estimated Time:** 1 hour

---

### **Task 6: ReservationForm Component** 🔄
**File:** `frontend/src/components/reservations/ReservationForm.tsx` (NEW)

**Features:**
- Customer information fields:
  - Full name (auto-fill from user profile if logged in)
  - Email (auto-fill from user profile)
  - Phone number
  - Party size (number input)
- Special requests (textarea)
- Form validation
- Submit button with loading state
- Clear/Reset button

**Props:**
```typescript
interface ReservationFormProps {
  onSubmit: (data: CreateReservationDto) => void;
  isLoading: boolean;
  error: string | null;
}
```

**Estimated Time:** 1 hour

---

### **Task 7: ReservationSummary Component** 🔄
**File:** `frontend/src/components/reservations/ReservationSummary.tsx` (NEW)

**Features:**
- Display booking details:
  - Restaurant name
  - Date & Time
  - Table number
  - Party size
  - Customer info
  - Special requests
- Edit buttons for each section
- Confirm booking button
- Terms & conditions checkbox

**Props:**
```typescript
interface ReservationSummaryProps {
  reservation: Partial<CreateReservationDto>;
  tableName: string;
  onEdit: (section: string) => void;
  onConfirm: () => void;
}
```

**Estimated Time:** 45 minutes

---

### **Task 8: Main ReservationPage** 🔄
**File:** `frontend/src/pages/ReservationPage.tsx` (NEW)

**Features:**
- Multi-step booking flow:
  1. **Step 1:** Select Date & Time
  2. **Step 2:** Select Table
  3. **Step 3:** Enter Details
  4. **Step 4:** Review & Confirm
- Progress indicator (stepper)
- Back/Next navigation
- Responsive layout
- Loading states
- Error handling
- Success confirmation with redirect

**State Management:**
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<Partial<CreateReservationDto>>({});
```

**Estimated Time:** 2 hours

---

### **Task 9: Booking Confirmation Page** 🔄
**File:** `frontend/src/pages/BookingConfirmationPage.tsx` (NEW)

**Features:**
- Success message
- Booking details display
- Confirmation number
- Add to calendar button
- Print receipt button
- Manage reservation link
- Return to home button

**Estimated Time:** 45 minutes

---

### **Task 10: My Reservations Page** 🔄
**File:** `frontend/src/pages/MyReservationsPage.tsx` (NEW)

**Features:**
- List of user's reservations
- Filter by status (upcoming, past, cancelled)
- Each reservation card shows:
  - Date & Time
  - Restaurant name
  - Table number
  - Party size
  - Status badge
- Actions:
  - View details
  - Cancel reservation
  - Modify reservation (if allowed)

**Estimated Time:** 1.5 hours

---

## 🎨 Design System

### **Color Scheme:**
- **Primary:** Gold (`#D4AF37`) - CTA buttons
- **Success:** Green (`#10B981`) - Confirmed bookings
- **Warning:** Yellow (`#F59E0B`) - Pending bookings
- **Error:** Red (`#EF4444`) - Cancelled/errors
- **Neutral:** Gray shades for text/backgrounds

### **Typography:**
- **Headings:** Font-bold, tracking-wide
- **Body:** Font-medium
- **Labels:** Font-semibold, uppercase, text-sm

### **Spacing:**
- Consistent padding: 4, 6, 8, 12, 16, 24
- Card spacing: p-6
- Section gaps: space-y-6

---

## 🧪 Testing Strategy

### **Unit Tests:**
- Redux slice reducers
- Async thunk actions
- Form validation logic
- Date/time utilities

### **Integration Tests:**
- Complete booking flow
- API service calls
- State management integration

### **Manual Testing:**
1. **Happy Path:**
   - Select date → Select time → Select table → Fill form → Confirm
   
2. **Edge Cases:**
   - No tables available
   - Past date selection (should be disabled)
   - Invalid phone/email format
   - Network errors
   - Concurrent bookings

3. **Responsive:**
   - Mobile view (< 768px)
   - Tablet view (768px - 1024px)
   - Desktop view (> 1024px)

---

## 📱 Responsive Design

### **Mobile (< 768px):**
- Single column layout
- Stack date/time/table selectors vertically
- Sticky progress indicator at top
- Bottom action buttons
- Collapsible sections

### **Tablet (768px - 1024px):**
- Two column layout for date/time picker
- Full width table grid
- Side-by-side form fields

### **Desktop (> 1024px):**
- Three column layout
- Sidebar for progress/summary
- Main content area for form/selectors
- Inline validation messages

---

## 🔗 API Integration

### **Backend Endpoints to Use:**

```
GET    /api/restaurants/:restaurantId/tables/availability
       ?date=YYYY-MM-DD&time=HH:MM

POST   /api/restaurants/:restaurantId/reservations
       Body: { tableId, customerName, customerEmail, ... }

GET    /api/reservations/user/:userId

GET    /api/reservations/:reservationId

PATCH  /api/reservations/:reservationId
       Body: { status, ... }

DELETE /api/reservations/:reservationId
```

---

## 🚀 Implementation Order

### **Day 1: Foundation (4-5 hours)**
1. ✅ Type definitions (15 min)
2. ✅ reservationSlice (45 min)
3. ✅ reservationService (30 min)
4. ✅ Basic ReservationPage structure (1 hour)
5. ✅ DateTimePicker component (1.5 hours)

### **Day 2: Core Components (4-5 hours)**
6. ✅ TableSelector component (1 hour)
7. ✅ ReservationForm component (1 hour)
8. ✅ ReservationSummary component (45 min)
9. ✅ Multi-step flow integration (1.5 hours)

### **Day 3: Polish & Test (3-4 hours)**
10. ✅ BookingConfirmationPage (45 min)
11. ✅ MyReservationsPage (1.5 hours)
12. ✅ Testing & bug fixes (1 hour)
13. ✅ Responsive design polish (1 hour)

---

## ✅ Acceptance Criteria

### **Must Have:**
- [ ] User can select date and time
- [ ] User can see available tables
- [ ] User can select a table
- [ ] User can enter booking details
- [ ] User can review and confirm booking
- [ ] User receives booking confirmation
- [ ] User can view their reservations
- [ ] User can cancel reservations
- [ ] Form validation works correctly
- [ ] Error handling for API failures
- [ ] Responsive on all devices

### **Nice to Have:**
- [ ] Add to calendar integration
- [ ] Email confirmation
- [ ] SMS notifications
- [ ] Waitlist feature
- [ ] Recurring reservations
- [ ] Loyalty points integration

---

## 📊 Success Metrics

- **Booking completion rate:** > 80%
- **Average booking time:** < 3 minutes
- **Form abandonment rate:** < 20%
- **Mobile booking rate:** > 40%
- **Error rate:** < 5%

---

## 🎯 Current Status

**Phase 3 Complete:**
- ✅ Table Management Frontend
- ✅ All 11 backend endpoints tested
- ✅ Authentication with animations
- ✅ Logout functionality
- ✅ Toast notifications

**Ready to Start:**
- 🚀 Phase 4: Reservation Frontend
- 📍 Starting with Type Definitions

---

**Let's build an amazing reservation system! 🎉**
