# 🛠️ Debug & Development Tools

This folder contains HTML-based debugging and testing tools for development.

## Available Tools

### 🔧 clear-auth.html
**Purpose**: Clear expired authentication tokens from browser localStorage

**When to use**:
- Getting 401 Unauthorized errors
- After logout but still see authentication issues
- Need to reset authentication state

**How to use**:
1. Open `file:///D:/First/tools/clear-auth.html` in browser
2. Click "Xóa TẤT CẢ dữ liệu đăng nhập"
3. Navigate to login page
4. Login again with fresh credentials

---

### 🧪 test-backend.html
**Purpose**: Comprehensive backend API testing interface

**Features**:
- Test backend health status
- Test authentication endpoints
- Test protected routes with tokens
- Manage authentication tokens
- Quick endpoint validation

**How to use**:
1. Open `file:///D:/First/tools/test-backend.html` in browser
2. Use buttons to test different endpoints
3. Login to get authentication token
4. Test authenticated endpoints

---

### 📡 test-api.html
**Purpose**: Simple API testing interface

**Features**:
- Quick API endpoint testing
- Request/response inspection
- Basic authentication testing

---

### 🔑 quick-login.html
**Purpose**: Fast login interface for testing

**Features**:
- Pre-filled test credentials
- Quick authentication for development
- Direct access to protected pages

---

## Usage Notes

- All tools run client-side in browser
- No server required for the tools themselves
- Tools interact with backend at `http://localhost:5000`
- Frontend should be running at `http://localhost:3000`

## Opening Tools

**Method 1: Direct URL**
```
file:///D:/First/tools/clear-auth.html
file:///D:/First/tools/test-backend.html
```

**Method 2: From Terminal**
```powershell
Start-Process "D:\First\tools\clear-auth.html"
```

**Method 3: From VS Code**
- Right-click file → "Reveal in File Explorer"
- Double-click to open in default browser
