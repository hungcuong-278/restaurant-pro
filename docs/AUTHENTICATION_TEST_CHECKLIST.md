# ✅ Authentication System - Testing Checklist

**Date:** October 6, 2025  
**Purpose:** Verify authentication system works after runtime error fixes  
**Estimated Time:** 10-15 minutes

---

## 🚀 Pre-Test Setup

### 1. Verify Servers Running
```powershell
# Check both servers:
netstat -ano | findstr ":3000 :5000"

# Should show:
# TCP 0.0.0.0:3000  LISTENING  (Frontend)
# TCP 0.0.0.0:5000  LISTENING  (Backend)
```

**Status:** ⬜ Both servers running

---

### 2. Open Application
```powershell
Start-Process "http://localhost:3000"
```

**Status:** ⬜ Browser opened successfully

---

## 🧪 Core Authentication Tests

### Test 1: Homepage Access (Unauthenticated)
**Steps:**
1. Open `http://localhost:3000`
2. Check browser console (F12)
3. Look for errors

**Expected:**
- ✅ Homepage loads without errors
- ✅ Console shows no "Cannot destructure" errors
- ✅ Navigation bar shows "Đăng Nhập" button
- ✅ No user welcome message

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 2: Login Page Access
**Steps:**
1. Click "Đăng Nhập" button in navigation
2. Verify you're redirected to `/login`
3. Check form elements

**Expected:**
- ✅ Login page loads successfully
- ✅ Email and Password input fields visible
- ✅ "Đăng Nhập" submit button visible
- ✅ "Chưa có tài khoản? Đăng ký ngay" link visible
- ✅ Professional Tailwind CSS styling

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 3: Login with Admin Credentials
**Steps:**
1. Enter email: `admin@restaurant.com`
2. Enter password: `admin123`
3. Click "Đăng Nhập"
4. Watch for welcome notification

**Expected:**
- ✅ Login successful (no errors)
- ✅ Welcome notification appears: "Chào mừng Admin User!"
- ✅ Progress bar animation (5 seconds)
- ✅ Redirected to `/` (homepage)
- ✅ Navigation shows user name and "Đăng Xuất"
- ✅ "Đăng Nhập" button replaced with user menu

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 4: UserStatusComponent Display
**Steps:**
1. After login, stay on homepage
2. Look for "User Status" component
3. Check all displayed information

**Expected:**
- ✅ Authentication Status: "Đã xác thực" (green)
- ✅ User ID displayed
- ✅ Full Name: "Admin User"
- ✅ Email: "admin@restaurant.com"
- ✅ Role: "admin" with purple badge
- ✅ Phone number (if any)

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 5: AuthActivityLog Component
**Steps:**
1. Scroll down on homepage
2. Find "Nhật Ký Hoạt Động Authentication"
3. Check for login event

**Expected:**
- ✅ Activity log component visible
- ✅ Latest event shows login
- ✅ Event icon: 🟢
- ✅ Event message: "Admin User đã đăng nhập thành công"
- ✅ Timestamp displayed
- ✅ User details (name, email, role) shown

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 6: Protected Routes (Dashboard)
**Steps:**
1. Navigate to `/dashboard` manually or via menu
2. Verify access granted

**Expected:**
- ✅ Dashboard page loads
- ✅ No redirect to login
- ✅ Admin/Staff content visible (if applicable)
- ✅ User data accessible

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 7: Navigation Menu (Authenticated)
**Steps:**
1. Check navigation bar
2. Look for role-based menu items

**Expected:**
- ✅ User welcome message: "Xin chào, Admin"
- ✅ "Đăng Xuất" button visible
- ✅ Role-specific links (Admin: "Admin Panel", Staff: "Staff Tools")
- ✅ Mobile menu working (if on small screen)

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 8: Logout Functionality
**Steps:**
1. Click "Đăng Xuất" button
2. Confirm logout in dialog (if prompted)
3. Check redirection

**Expected:**
- ✅ Logout confirmation dialog appears
- ✅ After confirming, redirected to `/login`
- ✅ Navigation bar shows "Đăng Nhập" again
- ✅ User welcome message gone
- ✅ Protected content not accessible

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 9: Logout Event Logging
**Steps:**
1. After logout, go back to homepage
2. Check AuthActivityLog component

**Expected:**
- ✅ New logout event appears
- ✅ Event icon: 🔴
- ✅ Message: "Người dùng đã đăng xuất"
- ✅ Timestamp updated

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

### Test 10: Protected Route Redirect (Unauthenticated)
**Steps:**
1. After logout, manually go to `/dashboard`
2. Observe behavior

**Expected:**
- ✅ Automatically redirected to `/login`
- ✅ Cannot access protected content
- ✅ No errors in console

**Status:** ⬜ PASS / ⬜ FAIL

**Notes:** _____________________________________

---

## 🎨 Component-Specific Tests

### Test 11: Header Component
**Check:**
- ⬜ Logo displays correctly
- ⬜ Navigation links work (Trang Chủ, Thực Đơn, Đặt Bàn)
- ⬜ Responsive design (desktop & mobile)
- ⬜ User menu dropdown (if applicable)
- ⬜ Smooth transitions

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 12: LoginNotification Component
**Check:**
- ⬜ Appears immediately after successful login
- ⬜ Shows user name and role
- ⬜ Progress bar animates from 100% to 0%
- ⬜ Auto-hides after 5 seconds
- ⬜ Styled with Tailwind CSS (professional look)

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 13: HomePage Component
**Check (when authenticated):**
- ⬜ Hero section displays
- ⬜ "Đặt Bàn Ngay" button works
- ⬜ Features section shows
- ⬜ Admin-only section visible (if admin)
- ⬜ No console errors

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🔍 Console Checks

### Test 14: Browser Console Errors
**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Clear console
4. Perform login → navigate → logout cycle
5. Check for errors

**Expected:**
- ✅ No "Cannot destructure property 'user'" errors
- ✅ No Redux-related errors
- ✅ No "undefined state.auth" errors
- ✅ Only expected warnings (if any)

**Errors Found:** ⬜ None / ⬜ List below:
_____________________________________

---

### Test 15: Network Requests
**Steps:**
1. Open DevTools Network tab
2. Login with credentials
3. Check API requests

**Expected:**
- ✅ POST `/api/auth/login` → 200 OK
- ✅ Response contains `{ user, token }`
- ✅ JWT token stored in localStorage/sessionStorage
- ✅ GET `/api/auth/me` (if called) → 200 OK

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🎭 Role-Based Tests

### Test 16: Login as Staff
**Credentials:**
- Email: `staff@restaurant.com`
- Password: `staff123`

**Check:**
- ⬜ Login successful
- ⬜ Role badge shows "staff" (blue)
- ⬜ Staff-specific menu items visible
- ⬜ No admin-only content

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 17: Register New Customer
**Steps:**
1. Go to `/register`
2. Fill form:
   - First Name: `Test`
   - Last Name: `Customer`
   - Email: `testcustomer@example.com`
   - Phone: `0987654321`
   - Password: `test123`
3. Submit

**Expected:**
- ✅ Registration successful
- ✅ Auto-login after registration
- ✅ Welcome notification appears
- ✅ Role badge shows "customer" (green)

**Status:** ⬜ PASS / ⬜ FAIL

---

## 📱 Responsive Design Tests

### Test 18: Mobile View (< 768px)
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or small screen
4. Test login flow

**Check:**
- ⬜ Header collapses to hamburger menu
- ⬜ Login form responsive
- ⬜ Buttons properly sized
- ⬜ Text readable
- ⬜ No horizontal scroll

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🚀 Performance Tests

### Test 19: Page Load Speed
**Check:**
- ⬜ Homepage loads < 2 seconds
- ⬜ Login page loads < 1 second
- ⬜ Authentication state updates instantly
- ⬜ No noticeable lag in navigation

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 20: Memory Leaks
**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Login → Logout → Login (repeat 5 times)
4. Take another snapshot
5. Compare

**Expected:**
- ✅ No significant memory increase
- ✅ No detached DOM nodes

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ SKIP

---

## 📊 Final Summary

### Test Results
- **Total Tests:** 20
- **Passed:** _____ / 20
- **Failed:** _____ / 20
- **Skipped:** _____ / 20

### Critical Tests (Must Pass)
- [ ] Test 1: Homepage loads without errors
- [ ] Test 3: Login successful
- [ ] Test 8: Logout functional
- [ ] Test 10: Protected route redirect
- [ ] Test 14: No console errors

**All Critical Tests Passed?** ⬜ YES / ⬜ NO

---

## 🐛 Issues Found

### Issue 1:
**Description:** _____________________________________  
**Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low  
**Component:** _____________________________________  
**Steps to Reproduce:** _____________________________________

### Issue 2:
**Description:** _____________________________________  
**Severity:** ⬜ Critical / ⬜ High / ⬜ Medium / ⬜ Low  
**Component:** _____________________________________  
**Steps to Reproduce:** _____________________________________

---

## ✅ Sign-Off

**Tested By:** _____________________________________  
**Date:** October 6, 2025  
**Time:** _____________________________________  
**Overall Status:** ⬜ PASS / ⬜ FAIL / ⬜ NEEDS WORK

**Comments:**
_____________________________________
_____________________________________
_____________________________________

---

## 🎯 Next Steps

### If All Tests Pass ✅
1. ✅ Authentication system fully functional
2. ✅ Proceed to Week 8 Day 3: Reservation System
3. ✅ Commit runtime fixes to Git
4. ✅ Update project documentation

### If Tests Fail ❌
1. Document all failures above
2. Prioritize critical issues
3. Review error logs in browser console
4. Check backend logs for API errors
5. Re-run failed tests after fixes

---

**Quick Command Reference:**

```powershell
# Check servers
netstat -ano | findstr ":3000 :5000"

# Open browser
Start-Process "http://localhost:3000"

# View backend logs
cd D:\First\backend; npm run dev

# View frontend logs (if needed)
cd D:\First\frontend; npm start
```

---

**Ready to test?** Let's go! 🚀
