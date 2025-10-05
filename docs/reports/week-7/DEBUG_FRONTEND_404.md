# 🔍 DEBUG: Frontend 404 Error

## ✅ Backend Verified Working

**Test Result:**
```bash
GET http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/orders
✅ STATUS: 200 OK
✅ Returns 20 orders
```

**Conclusion:** Backend API is working perfectly!

---

## 🔎 Frontend Configuration

**API Base URL:** `http://localhost:5000/api`  
**File:** `frontend/src/services/api.ts`

**Order Service URL Construction:**
```typescript
const url = `/restaurants/${RESTAURANT_ID}/orders`;
// With baseURL, becomes:
// http://localhost:5000/api/restaurants/{id}/orders
```

**Expected Full URL:**
```
http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/orders
```

---

## ❓ Possible Causes of 404

### 1. Frontend Cache Issue
- Browser caching old failed requests
- Service worker caching
- Axios response cache

**Solution:** Hard refresh browser
```
Ctrl + Shift + R  (Windows)
Cmd + Shift + R   (Mac)
```

### 2. CORS Preflight Failure
- OPTIONS request failing before GET
- Backend CORS not configured for localhost:3000

**Check:** Open Browser DevTools → Network tab → Look for OPTIONS request

### 3. Wrong Environment Variable
- `REACT_APP_API_URL` set to wrong value in `.env`
- Overriding the default `http://localhost:5000/api`

**Check:** `frontend/.env` file

### 4. Request Interceptor Issue
- Auth interceptor adding wrong headers
- Retry logic causing issues

**Check:** Console for interceptor errors

---

## 🛠️ Debug Steps for User

### Step 1: Open Browser Console
Press **F12** → Go to **Console** tab

**Look for:**
- Red error messages
- Failed requests
- CORS errors

### Step 2: Open Network Tab
Press **F12** → Go to **Network** tab → Click **"Try Again"**

**Check:**
1. What is the **Request URL**? (Should be: `http://localhost:5000/api/restaurants/.../orders`)
2. What is the **Status Code**? (Shows 404?)
3. What is the **Request Method**? (Should be GET)
4. Is there an **OPTIONS** request before GET? (CORS preflight)

### Step 3: Check Request Headers
In Network tab → Click the failed request → **Headers** tab

**Look for:**
- `Origin: http://localhost:3000`
- `Content-Type: application/json`

### Step 4: Hard Refresh
```
Ctrl + Shift + R
```
Then try loading Orders page again.

---

## 🚀 Quick Fixes to Try

### Fix 1: Clear Browser Cache
```javascript
// In browser console, run:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Fix 2: Check Backend CORS
Backend should allow `localhost:3000`:

```typescript
// backend/src/app.ts should have:
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### Fix 3: Restart Frontend
```bash
# Kill and restart
Ctrl+C in frontend terminal
npm start
```

---

## 📸 Screenshot Needed

Bạn chụp screenshot của:
1. **Browser Console** (F12 → Console tab)
2. **Network Tab** showing the failed request
3. **Request details** (URL, Status, Headers)

Hoặc copy/paste exact error message từ console!

---

## 🎯 Expected Behavior

**When working correctly:**
```
Request URL: http://localhost:5000/api/restaurants/a8d307c4-40c2-4e11-8468-d65710bae6f3/orders
Status: 200 OK
Response: { success: true, data: [...20 orders...] }
```

---

**Waiting for your console/network info to debug further!** 🔍
