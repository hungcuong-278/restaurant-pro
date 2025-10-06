# Registration Testing Guide

## Overview
Complete guide for testing customer registration functionality in the Restaurant Pro system.

**Date**: Current Session  
**Status**: Ready for Testing  
**Servers**: Frontend (3000) and Backend (5000) Running

---

## System Architecture

### Data Flow
```
Frontend Form (camelCase)
    ↓ firstName, lastName
Backend Controller (camelCase)
    ↓ Joi validation
Backend Service (converts)
    ↓ first_name, last_name
Database (snake_case)
    ↓ Stores in users table
Backend Response (snake_case)
    ↓ first_name, last_name
Frontend Display (snake_case)
    ↓ user.first_name, user.last_name
```

### Naming Convention
- **Frontend Form → Backend**: camelCase (`firstName`, `lastName`)
- **Backend → Database**: snake_case (`first_name`, `last_name`)
- **Backend Response → Frontend**: snake_case (`first_name`, `last_name`)
- **Frontend Display**: snake_case (`user.first_name`, `user.last_name`)

This is **CORRECT and INTENTIONAL** design!

---

## Test Cases

### Test 1: Successful Registration ✅

**URL**: http://localhost:3000/register

**Test Data**:
```
First Name: Nguyen
Last Name: Van A
Email: customer1@example.com
Phone: 0987654321
Password: Test123!
Confirm Password: Test123!
Role: customer
[✓] Agree to Terms
```

**Expected Results**:
1. ✅ Form submission successful
2. ✅ Welcome notification appears: "Nguyen Van A đã đăng nhập thành công"
3. ✅ Auto-redirect to homepage (/)
4. ✅ Header shows: "Welcome, Nguyen"
5. ✅ User authenticated (green status)
6. ✅ Backend logs show user creation
7. ✅ Database contains new user with `first_name='Nguyen'`, `last_name='Van A'`

**Backend Verification**:
```powershell
# Check user in database
sqlite3 D:\First\backend\database\dev.sqlite3 "SELECT id, email, first_name, last_name, role FROM users WHERE email='customer1@example.com';"
```

---

### Test 2: Duplicate Email (Error Handling) ⚠️

**Test Data**: Use same email as Test 1
```
Email: customer1@example.com
(Other fields different)
```

**Expected Results**:
1. ❌ Registration fails
2. 🔴 Error message: "Email address is already registered"
3. ✅ Form stays on registration page
4. ✅ No new user created
5. ✅ Original user data unchanged

---

### Test 3: Invalid Email Format ⚠️

**Test Data**:
```
Email: notanemail
(Other fields valid)
```

**Expected Results**:
1. ❌ Client-side validation error
2. 🔴 Error message: "Please enter a valid email address"
3. ✅ Submit button disabled or form blocked
4. ✅ No API call made

---

### Test 4: Weak Password ⚠️

**Test Data**:
```
Password: 123
(Too short, no uppercase, no special char)
```

**Expected Results**:
1. ❌ Client-side validation errors:
   - "Password must be at least 8 characters"
   - "Password must contain at least one uppercase letter"
   - "Password must contain at least one special character"
2. ✅ Form blocked from submission
3. ✅ No API call made

---

### Test 5: Password Mismatch ⚠️

**Test Data**:
```
Password: Test123!
Confirm Password: Test456!
```

**Expected Results**:
1. ❌ Validation error
2. 🔴 Error message: "Passwords do not match"
3. ✅ Form blocked
4. ✅ No API call

---

### Test 6: Missing Required Fields ⚠️

**Test Data**: Leave First Name empty

**Expected Results**:
1. ❌ Validation error
2. 🔴 Error message: "First name is required"
3. ✅ Field highlighted in red
4. ✅ Form blocked

---

### Test 7: Terms Not Agreed ⚠️

**Test Data**: All fields valid, but checkbox unchecked

**Expected Results**:
1. ❌ Validation error
2. 🔴 Error message: "You must agree to the terms and conditions"
3. ✅ Form blocked
4. ✅ Checkbox highlighted

---

### Test 8: Login After Registration ✅

**After completing Test 1**:

**Steps**:
1. Click Logout button in Header
2. Navigate to /login
3. Enter credentials:
   ```
   Email: customer1@example.com
   Password: Test123!
   ```
4. Click Login

**Expected Results**:
1. ✅ Login successful
2. ✅ Welcome notification: "Nguyen Van A đã đăng nhập thành công"
3. ✅ Redirect to homepage
4. ✅ Header shows: "Welcome, Nguyen"
5. ✅ User state populated correctly
6. ✅ JWT token stored in localStorage

---

### Test 9: Protected Routes Access ✅

**After logging in as customer**:

**Test Routes**:
```
/reservations → ✅ Should access
/reservations/my-reservations → ✅ Should access
/menu → ✅ Should access
/admin → ❌ Should redirect (not admin role)
```

**Expected Results**:
1. ✅ Customer can access customer routes
2. ❌ Customer blocked from admin routes
3. ✅ Proper role-based access control working

---

### Test 10: Session Persistence 🔄

**Steps**:
1. Login as customer1@example.com
2. Refresh browser (F5)
3. Check user state

**Expected Results**:
1. ✅ User still authenticated
2. ✅ Token persists in localStorage
3. ✅ User data reloaded from token
4. ✅ No redirect to login page
5. ✅ Header still shows user name

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database file exists and is accessible
- [ ] Browser console open (F12)
- [ ] Network tab open to monitor requests

### During Testing
- [ ] Check browser console for errors
- [ ] Monitor Network tab for API calls
- [ ] Verify response status codes (201 = success)
- [ ] Check response payload structure
- [ ] Verify error messages are user-friendly
- [ ] Test on different screen sizes (mobile, tablet, desktop)

### Post-Test Verification
- [ ] Check database for user records
- [ ] Verify password is hashed (not plain text)
- [ ] Confirm user_sessions table entries
- [ ] Check JWT token structure
- [ ] Verify token expiration (24h)
- [ ] Test logout functionality
- [ ] Clear test data if needed

---

## Expected API Responses

### Successful Registration (201 Created)
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "email": "customer1@example.com",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "role": "customer",
    "phone": "0987654321",
    "is_active": true,
    "email_verified": false,
    "created_at": "2025-01-XX"
  },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 86400
}
```

### Duplicate Email Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Email address is already registered"
}
```

### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "First name is required",
  "field": "firstName"
}
```

---

## Common Issues & Solutions

### Issue 1: "useAuth must be used within an AuthProvider"
**Cause**: AuthProvider not wrapping App component  
**Solution**: Already fixed in App.tsx (AuthProvider added)  
**Status**: ✅ Resolved

### Issue 2: Property 'firstName' does not exist
**Cause**: Mixing camelCase and snake_case  
**Solution**: Frontend uses snake_case for display (`user.first_name`)  
**Status**: ✅ Resolved (28 errors fixed)

### Issue 3: Registration succeeds but login fails
**Possible Causes**:
- Password not hashed correctly
- Email case mismatch
- User not marked as active
**Debug**: Check database directly

### Issue 4: Token not persisting
**Possible Causes**:
- localStorage not saving
- Token format incorrect
- Browser security settings
**Debug**: Check Application tab in DevTools

---

## Database Verification Commands

### Check User Created
```powershell
sqlite3 D:\First\backend\database\dev.sqlite3 "SELECT * FROM users WHERE email='customer1@example.com';"
```

### Check Password Hash
```powershell
sqlite3 D:\First\backend\database\dev.sqlite3 "SELECT email, password_hash FROM users WHERE email='customer1@example.com';"
```
**Verify**: Hash should start with `$2b$10$` (bcrypt with 10 rounds)

### Check Active Sessions
```powershell
sqlite3 D:\First\backend\database\dev.sqlite3 "SELECT * FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE email='customer1@example.com');"
```

### Count Total Customers
```powershell
sqlite3 D:\First\backend\database\dev.sqlite3 "SELECT COUNT(*) FROM users WHERE role='customer';"
```

---

## Success Criteria Summary

**All tests must pass**:
1. ✅ Customer can register with valid data
2. ✅ Duplicate email rejected
3. ✅ Invalid data rejected with clear errors
4. ✅ Password hashed securely
5. ✅ Auto-login after registration
6. ✅ Welcome notification displays
7. ✅ Can logout and login again
8. ✅ Token persists across refresh
9. ✅ Protected routes work correctly
10. ✅ Database records accurate

**If all pass**: Week 8 Day 1-2 COMPLETE ✅  
**Ready for**: Day 3 - Reservation System improvements

---

## Next Steps After Testing

### If Tests Pass ✅
1. Commit all changes to Git
2. Create detailed commit message
3. Push to GitHub
4. Update project documentation
5. Move to Week 8 Day 3

### If Tests Fail ❌
1. Document specific failure
2. Check browser console
3. Check backend logs
4. Verify database state
5. Fix issue
6. Re-run affected tests
7. Document fix

---

## Testing Schedule

**Estimated Time**: 30-60 minutes

1. **Test 1-2**: Basic registration (10 min)
2. **Test 3-7**: Error handling (15 min)
3. **Test 8-9**: Login & access control (10 min)
4. **Test 10**: Session persistence (5 min)
5. **Database verification**: (10 min)
6. **Documentation**: (10 min)

---

## Test Data Collection

Create `test-users.txt` with successful test accounts:
```
# Test User 1
Email: customer1@example.com
Password: Test123!
Name: Nguyen Van A
Status: ✅ Created [Date]

# Test User 2
Email: customer2@example.com
Password: Test456!
Name: Tran Thi B
Status: ✅ Created [Date]
```

---

## Ready to Test!

**Current Status**:
- ✅ Frontend: localhost:3000 (Running)
- ✅ Backend: localhost:5000 (Running)
- ✅ All 28 errors fixed
- ✅ AuthProvider configured
- ✅ Registration endpoint functional

**Start Testing**: Open http://localhost:3000/register

**Monitor**: Watch browser console and network tab for any issues.

Good luck! 🚀
