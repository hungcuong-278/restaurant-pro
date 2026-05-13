# 🎯 SUMMARY: FIX LỖI "NO TABLES AVAILABLE"

## ❌ Các lỗi đã tìm ra:

### 1. **URL API không khớp giữa Frontend và Backend**
- ❌ Frontend gọi: `/api/restaurants/{id}/tables`
- ✅ Backend mount: `/api/tables`
- **Fix**: Xóa `/restaurants/{RESTAURANT_ID}` khỏi tất cả URL trong `frontend/src/services/tableService.ts`

### 2. **API Availability sai endpoint**
- ❌ Frontend gọi: `/api/reservations/available-tables`
- ✅ Backend có: `/api/tables/availability/check`
- **Fix**: Đổi URL trong `frontend/src/services/reservationService.ts` line 119

### 3. **Backend thiếu tableService.ts**
- ❌ File `backend/src/services/tableService.ts` bị **RỖNG**!
- ✅ Đã tạo lại với method `getAvailableTablesForBooking()`
- **Fix**: Tạo lại file với đầy đủ logic query database

### 4. **Backend controller thiếu default restaurant ID**
- ❌ Controller đọc `req.params.restaurantId` nhưng route không có param
- ✅ Thêm fallback: `const restaurantId = req.params.restaurantId || 'a8d307c4-40c2-4e11-8468-d65710bae6f3'`

## ✅ Các file đã sửa:

### Frontend:
1. **`frontend/src/services/tableService.ts`**
   - Xóa `RESTAURANT_ID` constant
   - Đổi tất cả URL từ `/api/restaurants/${RESTAURANT_ID}/tables` → `/api/tables`

2. **`frontend/src/services/reservationService.ts`**
   - Đổi URL từ `/reservations/available-tables` → `/tables/availability/check`

### Backend:
3. **`backend/src/services/tableService.ts`** - TẠO LẠI HOÀN TOÀN
   - Added: `getAvailableTablesForBooking()` - Main method for reservation
   - Added: `getTables()` - Get all tables
   - Added: `getTableById()` - Get single table
   - Added: `updateTableStatus()` - Update table status
   - Added stub methods for compatibility

4. **`backend/src/controllers/tableController.ts`**
   - Changed import from `default` to `* as tableService`
   - Fixed: `getTable()` - removed extra `restaurantId` param
   - Fixed: `updateTableStatus()` - removed extra `restaurantId` param
   - Added default restaurant ID in `getTableAvailability()`

## 🧪 CÁCH TEST:

### Test Backend API trực tiếp:

```powershell
# 1. Start backend
cd D:\First\backend
npx ts-node src/index.ts

# 2. Test API (trong terminal khác)
Invoke-RestMethod "http://localhost:5000/api/tables/availability/check?date=2025-10-10&time=19:00&party_size=2"
```

**Expected result:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "number": "1",
      "table_number": "1",
      "capacity": 4,
      "status": "available",
      "location": "...",
      ...
    }
  ]
}
```

### Test Frontend:

1. Mở: http://localhost:3000/reservations
2. Chọn date, time, party size
3. Click "Find Tables"
4. **Sẽ thấy danh sách bàn available!** ✅

## 🚀 CÁCH START BACKEND:

### Option 1: PowerShell
```powershell
cd D:\First\backend
npx ts-node src/index.ts
```

### Option 2: Dedicated Window
```powershell
Start-Process powershell -ArgumentList "-NoExit -Command 'Set-Location D:\First\backend; npx ts-node src/index.ts'"
```

## 🔍 TROUBLESHOOTING:

### Nếu vẫn lỗi "Failed to check availability":

1. **Kiểm tra backend có chạy không:**
   ```powershell
   Invoke-RestMethod "http://localhost:5000/health"
   ```
   Expected: "Restaurant API is running!"

2. **Kiểm tra compile errors:**
   ```powershell
   cd D:\First\backend
   npx tsc --noEmit
   ```
   Should: No errors

3. **Kiểm tra database có tables không:**
   ```powershell
   cd D:\First\backend
   npx ts-node -e "import knex from './src/config/database'; knex('tables').select('*').then(console.log).finally(() => process.exit())"
   ```

4. **Check backend logs:**
   - Xem terminal window backend có error gì không
   - Check for "404 Not Found" hoặc "500 Internal Server Error"

### Nếu frontend vẫn hiện "No Tables Available":

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to find tables
4. Check request to `/api/tables/availability/check`
5. If 404: Backend chưa chạy
6. If 500: Backend có error (check logs)
7. If 200 but empty data: Database không có tables

## 📋 CODE CHANGES DETAIL:

### tableService.ts (Main Logic):

```typescript
export const getAvailableTablesForBooking = async (
  restaurantId: string,
  date: string,
  time: string,
  partySize?: number
): Promise<Table[]> => {
  // 1. Query all active, available tables
  let query = knex('tables')
    .where('restaurant_id', restaurantId)
    .where('is_active', 1)
    .where('status', 'available');

  // 2. Filter by capacity
  if (partySize) {
    query = query.where('capacity', '>=', partySize);
  }

  const tables = await query.select('*');

  // 3. Filter out tables with reservations
  const availableTables: Table[] = [];
  for (const table of tables) {
    const reservation = await knex('reservations')
      .where('table_id', table.id)
      .where('reservation_date', date)
      .where('reservation_time', time)
      .whereIn('status', ['pending', 'confirmed'])
      .first();

    if (!reservation) {
      availableTables.push({
        ...table,
        table_number: table.number  // Alias for frontend
      });
    }
  }

  return availableTables;
};
```

### Frontend Service Changes:

**Before:**
```typescript
const url = `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/tables`;
```

**After:**
```typescript
const url = `${API_BASE_URL}/tables`;
```

## ✅ FINAL CHECKLIST:

- [x] Frontend tableService URLs fixed
- [x] Frontend reservationService URL fixed  
- [x] Backend tableService.ts recreated
- [x] Backend controller imports fixed
- [x] Backend controller method signatures fixed
- [x] Default restaurant ID added
- [x] Code compiles without errors
- [ ] **Backend running** ← BẠN CẦN LÀM
- [ ] **Frontend test successful** ← BẠN CẦN TEST

## 🎯 NEXT STEPS:

1. **START BACKEND:**
   ```powershell
   cd D:\First\backend
   npx ts-node src/index.ts
   ```

2. **VERIFY API WORKS:**
   ```powershell
   Invoke-RestMethod "http://localhost:5000/api/tables/availability/check?date=2025-10-10&time=19:00&party_size=2"
   ```

3. **TEST FRONTEND:**
   - Go to http://localhost:3000/reservations
   - Select date/time/party size
   - Click "Find Tables"
   - **Should see table list!** ✅

---

**Tóm lại:** 
- ✅ Tất cả code đã được fix
- ✅ Compilation successful  
- 🔄 Cần start backend và test!

Hãy bắt đầu backend và test thử nhé! 🚀
