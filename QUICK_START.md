# 🚀 Quick Start Guide - Restaurant Pro

## ✅ Current Status

### Servers Running
- **Frontend**: http://localhost:3000 ✅
- **Backend**: http://localhost:5000 ✅
- **Database**: SQLite (dev.sqlite3) ✅

### Data Available
- **Restaurant**: Golden Fork Restaurant (ID: e4e7bcd3-3b50-47ba-8abc-3597170677bb)
- **Tables**: 4 tables available (T001, T002, T003, P001)
- **Admin Account**: admin@restaurant.com / admin123

## 🎯 How to Start Servers

### Method 1: Using Batch Files (Recommended)

#### Start Frontend
```cmd
D:\First\frontend\start-frontend.bat
```
This will open a new command window with the frontend server.

#### Start Backend
```cmd
D:\First\backend\start-server.bat
```
This will open a new command window with the backend server.

### Method 2: Using PowerShell

#### Terminal 1 - Backend
```powershell
cd D:\First\backend
npm run dev
```

#### Terminal 2 - Frontend  
```powershell
cd D:\First\frontend
$env:BROWSER='none'
npm start
```

### Method 3: Using VS Code Terminal

1. Open VS Code
2. Open Terminal (Ctrl + `)
3. Split terminal (Ctrl + Shift + 5)
4. In first terminal:
   ```powershell
   cd backend
   npm run dev
   ```
5. In second terminal:
   ```powershell
   cd frontend
   npm start
   ```

## 🔍 Verify Servers Are Running

### Check Backend
```powershell
curl http://localhost:5000/api/health
```
Expected: `{"success":true,"message":"Restaurant Pro API is running!"...}`

### Check Frontend
```powershell
curl http://localhost:3000
```
Expected: HTML response with status 200 OK

### Check Port Status
```powershell
# Check if port 3000 (frontend) is in use
netstat -ano | findstr :3000

# Check if port 5000 (backend) is in use
netstat -ano | findstr :5000
```

## 🐛 Troubleshooting

### Issue: Frontend exits after compilation

**Symptoms:**
- Terminal shows "Compiled successfully!"
- But process exits immediately
- Port 3000 not listening

**Solution:**
Use the batch file instead:
```cmd
D:\First\frontend\start-frontend.bat
```

This opens a new window that stays open.

### Issue: Port already in use

**For Port 3000 (Frontend):**
```powershell
# Find process ID
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart frontend
D:\First\frontend\start-frontend.bat
```

**For Port 5000 (Backend):**
```powershell
# Find process ID
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart backend
cd D:\First\backend
npm run dev
```

### Issue: Backend database error

**Solution:**
Re-seed the database:
```powershell
cd D:\First\backend
npm run migrate
npm run seed
```

### Issue: Frontend shows "Table not found"

**Cause:** Restaurant ID mismatch

**Solution:**
1. Check current restaurant ID:
   ```powershell
   cd D:\First\backend
   node test-restaurant-data.js
   ```
2. Update frontend files if needed:
   - `frontend/src/pages/reservations/ReservationPage.tsx`
   - `frontend/src/pages/admin/TableManagementPage.tsx`

## 📱 Test the Application

### 1. Open Browser
Navigate to: http://localhost:3000

### 2. Test Guest User Flow
1. Click **"Book Table"** in header
2. Should redirect to login page
3. ✅ Authentication guard working

### 3. Login
- Email: `admin@restaurant.com`
- Password: `admin123`
- Should redirect back to booking page

### 4. Complete Booking
1. Select future date (> 2 hours from now)
2. Select time (11:00 - 22:00)
3. Enter party size (2-8 people)
4. Click **Continue**
5. Select a table
6. Fill in details
7. Review and confirm

### 5. View Reservations
- Click **"My Reservations"** in header
- See list of bookings
- Filter by Upcoming/Past/Cancelled

## 🔒 Default Accounts

### Admin Account
- **Email**: admin@restaurant.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full system access

### Manager Account
- **Email**: chef@restaurant.com
- **Password**: chef123
- **Role**: Manager
- **Access**: Restaurant management

## 📊 Available Tables

| Table | Capacity | Location | Status |
|-------|----------|----------|--------|
| T001 | 2 people | Main Hall | Available |
| T002 | 4 people | Main Hall | Available |
| T003 | 6 people | Main Hall | Available |
| P001 | 8 people | Private Room | Available |

## 🛠️ Development Commands

### Backend Commands
```powershell
cd D:\First\backend

# Start development server
npm run dev

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Seed database
npm run seed

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Commands
```powershell
cd D:\First\frontend

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Check for TypeScript errors
npm run type-check
```

## 📝 Important Files

### Configuration
- `backend/knexfile.ts` - Database configuration
- `backend/src/config/database.ts` - Database connection
- `frontend/src/services/api.ts` - API client configuration

### Environment
- Backend runs on port 5000
- Frontend runs on port 3000
- Database: SQLite at `backend/database/dev.sqlite3`

### Seeds & Migrations
- `backend/migrations/` - Database schema
- `backend/seeds/01_seed_initial_data.ts` - Initial data

## 🎨 Key Features Available

### Guest Users
- ✅ View restaurant info
- ✅ Browse menu
- ❌ Cannot make reservations (must login)

### Authenticated Users
- ✅ Make reservations
- ✅ View reservation history
- ✅ Cancel reservations
- ✅ View table availability
- ✅ Edit profile

### Admin Users
- ✅ Manage tables
- ✅ View all reservations
- ✅ Manage restaurant settings
- ✅ View analytics

## 🔗 Useful Links

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health
- GitHub: https://github.com/hungcuong-278/restaurant-pro

## 📖 Documentation

- [Database Setup Guide](./DATABASE_SETUP_COMPLETE.md)
- [Reservation Test Guide](./RESERVATION_SYSTEM_TEST_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)

## ⚡ Quick Commands Reference

```powershell
# Check if servers are running
netstat -ano | findstr ":3000 :5000"

# Kill all node processes (use with caution!)
Get-Process node | Stop-Process -Force

# Restart everything
cd D:\First\backend; npm run dev
cd D:\First\frontend; npm start

# Check database data
cd D:\First\backend; node test-restaurant-data.js

# Test API endpoint
curl http://localhost:5000/api/restaurants/e4e7bcd3-3b50-47ba-8abc-3597170677bb/tables
```

---

**Last Updated**: October 3, 2025
**Status**: ✅ Both servers running successfully
**Ready for**: Full system testing
