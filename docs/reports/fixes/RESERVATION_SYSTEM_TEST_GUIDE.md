# Reservation System - Testing Guide 🧪

## 📋 Overview

Guide để test complete reservation booking flow với authentication.

**Date**: October 3, 2025  
**Phase**: Phase 4 - Reservation Frontend Complete  
**Features**: Multi-step booking, authentication guards, user management

---

## 🚀 Quick Start

### Prerequisites

1. **Backend Running**: 
   ```powershell
   cd D:\First\backend
   npm run dev
   ```
   ✅ Check: http://localhost:5000/api/health

2. **Frontend Running**:
   ```powershell
   cd D:\First\frontend
   npm start
   ```
   ✅ Check: http://localhost:3000

---

## 🧪 Test Scenarios

### **Scenario 1: Guest User (Not Logged In)**

#### Test Steps:
1. Open browser: **http://localhost:3000**
2. **DO NOT login**
3. Click "**Book Table**" in navigation menu
4. **Expected Result**:
   - ⚠️ Alert message: "Please login or create an account to make a reservation"
   - 🔄 Redirect to `/login` page
   - ✅ URL `/reservations/new` saved in sessionStorage

#### Expected Behavior:
```
Guest clicks "Book Table"
  ↓
Alert shown
  ↓
Redirect to /login
  ↓
(URL saved for later redirect)
```

---

### **Scenario 2: Register New Account**

#### Test Steps:
1. On login page, click "**Sign Up**" or navigate to `/register`
2. Fill registration form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser@example.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
3. Click "**Register**"
4. **Expected Result**:
   - ✅ Account created successfully
   - 🔄 May redirect to login or home page
   - 📝 Note: Check if auto-redirect to booking page works

---

### **Scenario 3: Login Existing User**

#### Test Steps:
1. Navigate to `/login`
2. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `Test123!`
3. Click "**Login**"
4. **Expected Result**:
   - ✅ Success notification appears
   - 🎉 Welcome message: "Welcome, Test"
   - ⏱️ 3-second countdown with progress bar
   - 🔄 Auto-redirect to `/reservations/new` (saved URL)
   - ✅ "My Reservations" link appears in header

#### Expected Flow:
```
Login successful
  ↓
Show success notification (3 seconds)
  ↓
Check sessionStorage for saved URL
  ↓
Redirect to /reservations/new (or / if no saved URL)
```

---

### **Scenario 4: Complete Booking Flow**

#### **Step 1: Date & Time Selection**

1. On `/reservations/new` page
2. **Select Date**:
   - Click on a date (must be today or future)
   - ❌ Past dates should be disabled (gray)
   - ❌ Dates >90 days should be disabled
   - ✅ Today should have gold border
   - ✅ Selected date should have gold background

3. **Select Time**:
   - Click on a time slot
   - ⚠️ Times <2 hours from now should be disabled
   - ⚠️ Times outside 11:00-22:00 should not appear
   - ✅ Selected time should have gold background
   - 💡 Hover on disabled time shows tooltip

4. Click "**Continue**"
5. **Expected Result**:
   - ✅ Progress stepper shows Step 1 complete (green checkmark)
   - 🔄 Move to Step 2 (Table Selection)

---

#### **Step 2: Table Selection**

1. **Party Size**:
   - Select party size from dropdown (1-20 people)
   - 🔄 Tables should auto-refresh when party size changes

2. **Wait for Tables to Load**:
   - 🔄 Loading spinner appears
   - 📡 API call: `GET /api/restaurants/{id}/tables/availability?date=&time=&party_size=`
   - ✅ Tables display in grid layout

3. **Filter Logic**:
   - Only tables with `capacity >= party_size` shown
   - ⭐ "Perfect Match" badge if `capacity === party_size`
   - ℹ️ "X extra seats" if `capacity > party_size`

4. **Select Table**:
   - Click on a table card
   - ✅ Selected table shows gold border + background
   - ✅ "Selected" badge appears

5. Click "**Continue**"
6. **Expected Result**:
   - ✅ Step 2 complete
   - 🔄 Move to Step 3 (Customer Details)

---

#### **Step 3: Customer Details**

1. **Auto-Fill Check**:
   - ✅ Name should be pre-filled: "Test User"
   - ✅ Email should be pre-filled: "testuser@example.com"
   - 📝 Phone number empty (user must enter)

2. **Fill Form**:
   - Phone: `+1234567890` (min 10 digits)
   - Special Requests: `Window seat if available` (optional, max 500 chars)

3. **Validation Tests**:
   - Try empty name → ❌ Error: "Name is required"
   - Try invalid email → ❌ Error: "Please enter a valid email"
   - Try short phone → ❌ Error: "Phone must be at least 10 digits"

4. **Valid Form**:
   - All fields valid → ✅ No error messages
   - Click "**Continue**"

5. **Expected Result**:
   - ✅ Step 3 complete
   - 🔄 Move to Step 4 (Review)

---

#### **Step 4: Review & Confirm**

1. **Review Information**:
   - 📅 Date & Time display
   - 🪑 Table details (number, capacity, location)
   - 👤 Guest information (name, party size, email, phone)
   - 💬 Special requests (if provided)
   - ℹ️ Important information (4 bullet points)

2. **Edit Functionality**:
   - Click "Edit" on any section → 🔄 Jump back to that step
   - Test going back and forward

3. **Terms & Conditions**:
   - ⬜ Checkbox unchecked → "Confirm Reservation" button **disabled** (gray)
   - ✅ Check the checkbox → Button **enabled** (gold)

4. **Final Confirmation**:
   - Click "**Confirm Reservation**"
   - 🔄 Loading spinner appears
   - 📡 API call: `POST /api/restaurants/{id}/reservations`

5. **Expected Result**:
   - ✅ Reservation created
   - 🔄 Redirect to `/reservations/confirmation/{reservationId}`

---

### **Scenario 5: Confirmation Page**

#### Test Steps:

1. **Success Animation**:
   - ✅ Green checkmark appears with bounce animation
   - 🎉 "Reservation Confirmed!" message
   - ⏱️ Auto-hide after 3 seconds

2. **Confirmation Number**:
   - 🔢 Display: First 8 characters of ID (uppercase)
   - 🎨 Gold background box
   - 💾 "Please save this confirmation number"

3. **Reservation Details**:
   - 📅 Date & Time
   - 👤 Guest information
   - 👥 Party size
   - 💬 Special requests
   - ✅ Status badge (should be "Confirmed" in green)

4. **Quick Actions**:

   a. **Add to Calendar**:
      - Click "📅 Add to Calendar"
      - ✅ Download `.ics` file (iCal format)
      - 📁 File name: `reservation-{id}.ics`
      - 📆 Open file → Should add to calendar app
      - Duration: 2 hours

   b. **Print**:
      - Click "🖨️ Print"
      - ✅ Browser print dialog opens
      - 📄 Print-optimized layout (hides action buttons)

   c. **My Reservations**:
      - Click "My Reservations" link
      - 🔄 Navigate to `/reservations/my-reservations`

5. **Navigation**:
   - "🏠 Return to Home" → Navigate to `/`
   - "➕ Make Another Reservation" → Navigate to `/reservations/new`

---

### **Scenario 6: My Reservations Page**

#### Test Steps:

1. **Navigate**:
   - Click "**My Reservations**" in header
   - Or go to `/reservations/my-reservations`

2. **Authentication Check**:
   - If not logged in → Redirect to `/login`
   - If logged in → Show reservations list

3. **Filter Tabs**:
   - **All**: Show all reservations
   - **Upcoming**: Only future, not cancelled/completed
   - **Past**: Past date or completed status
   - **Cancelled**: Only cancelled reservations
   - Each tab shows count: `All (3)`, `Upcoming (2)`, etc.

4. **Reservation Cards**:
   - 🔢 Confirmation number
   - ✅ Status badge with color
   - 📅 Date & Time
   - 👥 Party size
   - 💬 Special requests (if any)

5. **Actions**:

   a. **View Details**:
      - Click "View Details"
      - 🔄 Navigate to confirmation page

   b. **Cancel Reservation**:
      - Click "Cancel" button (red border)
      - ⚠️ Confirmation dialog appears
      - If <2 hours away → Extra warning
      - Confirm cancellation
      - ✅ Status changes to "Cancelled"
      - 🔄 Card updates with red "Cancelled" badge
      - ❌ "Cancel" button disappears

6. **Empty States**:
   - No reservations → "No Reservations Found" message
   - Filter with no results → "You don't have any {filter} reservations"
   - 🎯 "Make a Reservation" button shown

7. **Make New Reservation**:
   - Click "➕ Make New Reservation"
   - 🔄 Navigate to `/reservations/new`

---

## 🐛 Known Issues to Test

### Issue 1: Backend Endpoints
- ❓ Check if reservation endpoints exist in backend
- 📡 Test API calls with browser DevTools
- Endpoints needed:
  ```
  GET  /api/restaurants/:id/tables/availability?date=&time=&party_size=
  POST /api/restaurants/:id/reservations
  GET  /api/reservations/user/:userId
  GET  /api/reservations/:id
  PATCH /api/reservations/:id
  ```

### Issue 2: TypeScript Errors
- ✅ Fixed: `isTooSoonTime` type error
- Check console for any runtime errors

### Issue 3: Date/Time Validation
- Test edge cases:
  - Selecting today's date with past time
  - Selecting exactly 2 hours from now
  - Selecting 90 days from now
  - Selecting 91 days from now (should be disabled)

### Issue 4: Table Availability
- Test with different party sizes:
  - 1 person
  - 10 people
  - 20 people
  - 21 people (should show error or limit)

---

## 🔍 Browser DevTools Checks

### Console Errors
```javascript
// Open DevTools (F12) → Console tab
// Should see NO errors (only deprecation warnings OK)
```

### Network Requests
```javascript
// Open DevTools (F12) → Network tab
// Watch for these API calls:

// Step 2 - Fetch tables
GET /api/restaurants/f46275c0-9917-44fc-b144-e1e9cff89075/tables/availability
Status: 200 OK
Response: { success: true, data: [...tables] }

// Step 4 - Create reservation
POST /api/restaurants/f46275c0-9917-44fc-b144-e1e9cff89075/reservations
Status: 201 Created
Response: { success: true, data: {...reservation} }

// My Reservations - Fetch user reservations
GET /api/reservations/user/{userId}
Status: 200 OK
Response: { success: true, data: [...reservations] }

// Cancel reservation
PATCH /api/reservations/{id}
Body: { status: "cancelled" }
Status: 200 OK
```

### Redux State
```javascript
// Install Redux DevTools extension
// Open DevTools → Redux tab
// Check state changes:

reservation: {
  currentStep: 'datetime' | 'table' | 'details' | 'review',
  selectedDate: '2025-10-05',
  selectedTime: '19:00',
  selectedTable: {...},
  partySize: 4,
  availableTables: [...],
  reservations: [...],
  isLoading: false,
  error: null
}
```

### Local Storage
```javascript
// Open DevTools → Application → Local Storage
// Check:
sessionStorage.getItem('redirectAfterLogin')
// Should be: "/reservations/new" (when guest clicks Book Table)
```

---

## ✅ Success Criteria

### Functional Requirements
- ✅ Guest user redirected to login when clicking "Book Table"
- ✅ After login, user redirected back to booking page
- ✅ Complete 4-step booking flow works
- ✅ Date/time validation prevents invalid bookings
- ✅ Table filtering by party size works
- ✅ Form validation catches errors
- ✅ Reservation created successfully
- ✅ Confirmation page displays correctly
- ✅ iCal export works
- ✅ My Reservations page shows user's bookings
- ✅ Cancel reservation works
- ✅ All authentication guards work

### UI/UX Requirements
- ✅ Progress stepper shows current step
- ✅ Back/Next navigation works
- ✅ Loading states show during API calls
- ✅ Error messages display clearly
- ✅ Success notifications appear
- ✅ Responsive on mobile/tablet/desktop
- ✅ Design consistent (gold accent, rounded-none)

### Performance
- ✅ Pages load quickly (<2 seconds)
- ✅ API calls complete in reasonable time
- ✅ No memory leaks (check with long testing session)
- ✅ Smooth animations

---

## 📸 Screenshots Checklist

Take screenshots of:
1. ✅ Guest user alert when clicking "Book Table"
2. ✅ Login page with redirect message
3. ✅ Step 1: Calendar + time slots
4. ✅ Step 2: Table grid with selection
5. ✅ Step 3: Form with auto-fill
6. ✅ Step 4: Review summary
7. ✅ Confirmation page with success animation
8. ✅ My Reservations with filter tabs
9. ✅ Cancel confirmation dialog
10. ✅ Mobile responsive layout

---

## 🚨 Error Scenarios to Test

### 1. Network Errors
- Disconnect internet → Try to fetch tables
- Expected: Error message displayed

### 2. Invalid Data
- Try to select table without date/time
- Expected: "Continue" button disabled

### 3. Session Expired
- Login → Wait long time → Try to book
- Expected: May need to re-login

### 4. Duplicate Reservations
- Book same table/time twice
- Expected: Backend should prevent (if implemented)

### 5. Past Date Selection
- Try to select yesterday's date
- Expected: Date disabled, cannot select

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]
**Tester**: [Your Name]
**Browser**: Chrome/Firefox/Safari
**Device**: Desktop/Mobile

### Scenario 1: Guest User
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Scenario 2: Register Account
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Scenario 3: Login & Redirect
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Scenario 4: Complete Booking
- Step 1 (Date/Time): ✅ / ❌
- Step 2 (Table): ✅ / ❌
- Step 3 (Details): ✅ / ❌
- Step 4 (Review): ✅ / ❌
- Notes:

### Scenario 5: Confirmation Page
- Status: ✅ PASS / ❌ FAIL
- iCal Export: ✅ / ❌
- Print: ✅ / ❌
- Notes:

### Scenario 6: My Reservations
- Status: ✅ PASS / ❌ FAIL
- Filter Tabs: ✅ / ❌
- Cancel Action: ✅ / ❌
- Notes:

### Issues Found
1. [Description]
2. [Description]

### Overall Result
- Total Tests: X
- Passed: X
- Failed: X
- Success Rate: X%
```

---

## 🎯 Next Steps After Testing

1. **Fix any bugs found** during testing
2. **Optimize performance** if slow
3. **Improve UX** based on feedback
4. **Add more features**:
   - Email confirmation
   - SMS notifications
   - Reservation modifications
   - Recurring bookings
5. **Deploy to production**

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend is running
4. Check database has test data
5. Clear browser cache and cookies
6. Try incognito mode

---

**Happy Testing! 🧪🎉**
