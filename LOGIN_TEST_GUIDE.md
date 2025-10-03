# 🔐 Login Testing Guide

## Test Credentials

### Admin Account
- **Email:** `admin@restaurant.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full system access

### Chef Account  
- **Email:** `chef@restaurant.com`
- **Password:** `chef123`
- **Role:** Staff
- **Access:** Kitchen and orders

### Customer Account
- **Email:** `customer@restaurant.com`
- **Password:** `customer123`
- **Role:** Customer
- **Access:** Booking and orders

---

## Testing URLs

### Main Login Page
🔗 **http://localhost:3000/login**
- Full React application with Redux state management
- Includes login notification system
- Auto-redirect after successful login

### Standalone Test Page
🔗 **http://localhost:3000/login-test.html**
- Pure HTML/JavaScript test page
- Direct API calls without React
- Useful for debugging API issues
- Shows real-time console logs

---

## How to Test

### 1. Visual Check
- [ ] Page loads with white background
- [ ] "Welcome Back" heading is **visible** (black text)
- [ ] Email and Password fields are **visible**
- [ ] Placeholder text shows: "admin@restaurant.com" and "admin123"
- [ ] Helper hints show below inputs
- [ ] "Sign In" button is **visible** (black background)
- [ ] "Create Account" button is **visible** (white with black border)

### 2. Functionality Test
1. **Open Dev Console** (F12)
2. **Enter credentials:**
   - Email: `admin@restaurant.com`
   - Password: `admin123`
3. **Click "Sign In"**
4. **Check console logs:**
   ```
   🔐 Login attempt: {email: "...", password: "..."}
   📤 Dispatching loginUser...
   🌐 API Call: POST /auth/login {...}
   📥 API Response: {success: true, ...}
   ✅ Login successful: {...}
   ```
5. **Should redirect to** `/` (homepage)

### 3. Error Handling Test
1. **Enter invalid credentials:**
   - Email: `wrong@email.com`
   - Password: `wrongpass`
2. **Click "Sign In"**
3. **Should show red error message:**
   - "Login Failed"
   - Error description

### 4. Loading State Test
1. **Click "Sign In"**
2. **Button should show:**
   - Loading spinner
   - Text: "Signing In..."
   - Disabled state (can't click again)

---

## Common Issues & Fixes

### Issue 1: Text Not Visible (White on White)
**Symptom:** Can't see "Welcome Back" or form labels  
**Cause:** CSS classes `text-gr-black` not loaded or Tailwind config issue  
**Fix Applied:** Added inline styles `style={{ color: '#000' }}`

### Issue 2: Can't Type in Inputs
**Symptom:** Input fields don't accept text  
**Cause:** React state not updating  
**Fix Applied:** Using `onChange={handleInputChange}` with proper state management

### Issue 3: API Not Responding
**Symptom:** Network error or timeout  
**Cause:** Backend server not running  
**Fix:**
```bash
cd backend
npm run dev
# Check: http://localhost:5000/api/health
```

### Issue 4: CORS Error
**Symptom:** Browser console shows CORS policy error  
**Cause:** Frontend and backend on different origins  
**Fix:** Backend already configured with CORS middleware

### Issue 5: Token Not Stored
**Symptom:** Login successful but redirected back to login  
**Cause:** localStorage not saving token  
**Check:**
```javascript
// In browser console:
localStorage.getItem('authToken')
localStorage.getItem('user')
```

---

## Debugging Steps

### Step 1: Check Backend API
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1",
    "firstName": "Gordon",
    "lastName": "Ramsay",
    "email": "admin@restaurant.com",
    "role": "admin"
  },
  "token": "mock-jwt-token-123456789"
}
```

### Step 2: Check Frontend Dev Server
```bash
# Should see:
# Compiled successfully!
# webpack compiled with X warnings
# On http://localhost:3000
```

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - ✅ Green logs = Success
   - ❌ Red logs = Errors
   - 🔐 Auth-related logs

### Step 4: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: XHR
4. Click "Sign In"
5. Look for `POST /auth/login`
6. Check:
   - Status: 200 OK
   - Response: `{success: true, ...}`

---

## Files Modified for Login Fix

### 1. LoginPage.tsx
```tsx
// Added inline styles for visibility
<h2 style={{ color: '#000000' }}>Welcome Back</h2>

// Added placeholders
<input placeholder="admin@restaurant.com" />

// Added helper hints
<p className="text-xs text-gray-500">Try: admin@restaurant.com</p>

// Added console.log debugging
console.log('🔐 Login attempt:', formData);
```

### 2. authService.ts
```typescript
// Added API call logging
console.log('🌐 API Call: POST /auth/login', credentials);
console.log('📥 API Response:', response.data);
```

### 3. login-test.html (NEW)
- Standalone test page
- Direct API testing
- No React dependencies
- Real-time console output

---

## Success Criteria

✅ **Login page is visible** - All text and buttons show correctly  
✅ **Can enter credentials** - Input fields accept text  
✅ **Submit button works** - Clicking triggers login  
✅ **API call succeeds** - Backend responds with 200 OK  
✅ **Token is stored** - localStorage has authToken  
✅ **Redirect works** - After login, goes to homepage  
✅ **Error handling works** - Invalid credentials show error message  
✅ **Loading state works** - Button shows "Signing In..." during request

---

## Next Steps After Login Works

1. **Test other auth pages:**
   - `/register` - Registration page
   - `/forgot-password` - Password reset

2. **Test protected routes:**
   - `/admin` - Should require admin role
   - `/profile` - Should require authentication

3. **Test logout:**
   - Click logout button
   - Check localStorage cleared
   - Redirected to login

4. **Test token persistence:**
   - Login
   - Refresh page
   - Should stay logged in

---

**Updated:** October 3, 2025  
**Status:** Login fixes applied, ready for testing  
**Backend:** ✅ Running on http://localhost:5000  
**Frontend:** ✅ Running on http://localhost:3000
