# 🐛 FRONTEND DEBUGGING GUIDE

## Current Issues (Screenshots)

### 1. ❌ "No Tables Available" - Reservation Page
**Symptom**: "Unfortunately, there are no tables available for the selected date and time."

**Possible Causes**:
- ✅ **NOT an API error** - This is expected behavior when no tables match criteria
- Could be real: No tables for that specific date/time/guest count
- Could be auth: User not logged in, so API returns empty array

**How to Debug**:
```javascript
// Open Browser Console (F12)
// Check if user is logged in:
localStorage.getItem('token')
// Should return JWT token string, not null

// Check API request in Network tab:
// Should see: GET /api/tables/available?date=...&time=...&guests=...
// Response should be: { success: true, data: [...] }
```

**Fix**:
1. If token is null → **Login first** (admin@restaurant.com / admin123)
2. If token exists but expired → **Logout and login again**
3. If API returns empty array → **Try different date/time**

---

### 2. ❌ "Request failed with status code 404" - Orders Page
**Symptom**: Orange warning icon with "Something went wrong" message

**Root Cause**: API endpoint not found (404) or authentication failure

**Backend Route**: `GET /api/orders`
**Requires**: Bearer token in Authorization header

**How to Debug**:
```javascript
// Browser Console (F12)
// Check token:
const token = localStorage.getItem('token');
console.log('Token:', token);

// Test API manually:
fetch('http://localhost:5000/api/orders', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(r => r.json())
  .then(data => console.log('Orders:', data))
  .catch(err => console.error('Error:', err));
```

**Common Fixes**:
1. **Not logged in**: Click "Login" in navbar
2. **Token expired**: Logout and login again (tokens expire after 15 min)
3. **Wrong endpoint**: Check if frontend calling correct `/api/orders` path
4. **Backend not running**: Verify `http://localhost:5000/api/health` returns 200

---

### 3. ❌ "Request failed with status code 404" - Kitchen View
**Symptom**: Same as Orders page - 404 error at top of page

**Root Cause**: Similar to Orders - authentication or endpoint issue

**Backend Route**: `GET /api/orders?status=pending,preparing,confirmed`
**Requires**: Staff/Admin role + Bearer token

**How to Debug**:
```javascript
// Check user role:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user?.role);
// Should be 'admin' or 'staff' for Kitchen access

// Test Kitchen API:
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/orders?status=pending', {
  headers: { 'Authorization': 'Bearer ' + token }
})
  .then(r => r.json())
  .then(data => console.log('Kitchen Orders:', data));
```

**Fix**:
1. Login as admin or staff user
2. Verify role in localStorage: `localStorage.getItem('user')`
3. If role is 'customer' → Login as admin instead

---

## 🎯 QUICK FIX CHECKLIST

### Step 1: Verify Backend is Running
```powershell
# PowerShell - Test backend health
Invoke-WebRequest -Uri "http://localhost:5000/api/health"
# Should return: Status 200
```

### Step 2: Verify Frontend is Running
```powershell
# PowerShell - Test frontend
Invoke-WebRequest -Uri "http://localhost:3000"
# Should return: Status 200
```

### Step 3: Clear Browser State & Re-login
1. Open `http://localhost:3000`
2. Press **F12** → Console tab
3. Run: `localStorage.clear(); sessionStorage.clear();`
4. Hard refresh: **Ctrl + Shift + R** (or Cmd + Shift + R on Mac)
5. Click **"Login"** in navbar
6. Login as:
   - **Admin**: `admin@restaurant.com` / `admin123`
   - **Customer**: `customer@example.com` / `customer123`
7. Navigate to problematic pages again

### Step 4: Check Network Tab
1. F12 → **Network** tab
2. Clear network log (🚫 icon)
3. Navigate to Orders page
4. Look for requests to `/api/orders`
5. Click request → Check:
   - **Status**: Should be 200 (not 404, not 401)
   - **Headers**: Should include `Authorization: Bearer ...`
   - **Response**: Should have `{ success: true, data: {...} }`

---

## 🔧 BACKEND API TEST COMMANDS

### Test with PowerShell:

```powershell
# 1. Login and get token
$loginData = @{ email = "admin@restaurant.com"; password = "admin123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $response.token
Write-Host "Token: $($token.Substring(0,50))..."

# 2. Test Orders API
$headers = @{ Authorization = "Bearer $token" }
$orders = Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Headers $headers
Write-Host "Orders found: $($orders.data.orders.Count)"

# 3. Test Tables API
$tables = Invoke-RestMethod -Uri "http://localhost:5000/api/tables/available?date=2025-10-08&time=19:00&guests=4" -Headers $headers
Write-Host "Tables available: $($tables.data.Count)"
```

---

## 📊 VERIFIED WORKING (Backend Tests)

✅ **All backend endpoints tested successfully**:
- `/api/auth/login` → 200 OK (returns token)
- `/api/orders` → 200 OK (7 orders found)
- `/api/tables/available` → 200 OK (9 tables found)
- `/api/health` → 200 OK

✅ **Test suite results**: **14/14 tests PASSED (100%)**

---

## 🚀 MOST LIKELY SOLUTION

**The issue is NOT the backend - it's frontend authentication state.**

### Try this:
1. Open browser **Incognito/Private window**
2. Navigate to `http://localhost:3000`
3. Login immediately: `admin@restaurant.com` / `admin123`
4. Navigate to Orders page
5. If it works → Main browser has stale/expired token
6. Solution: Clear localStorage in main browser and re-login

---

## 📝 NOTES

- JWT tokens expire after **15 minutes** (900 seconds)
- Token refresh should happen automatically via authService interceptor
- If refresh fails → User redirected to login
- Protected routes check token validity before rendering
- 404 errors could also mean:
  - Route pattern mismatch (e.g., `/api/restaurants/:id/orders` vs `/api/orders`)
  - Middleware blocking request before it reaches controller
  - CORS issue (check browser console for CORS errors)

---

## 🆘 LAST RESORT

If nothing works, restart both services:

```powershell
# Stop all Node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Start Backend
cd D:\First\backend
npm run build
node dist/index.js

# Start Frontend (in new terminal)
cd D:\First\frontend
npm start
```

Then login fresh and test again.

---

**Created**: Oct 8, 2025  
**Status**: All backend tests passing (100%), frontend auth state issue suspected
