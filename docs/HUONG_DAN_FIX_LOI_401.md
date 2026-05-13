# 🚨 HƯỚNG DẪN KHẮC PHỤC LỖI 401 - URGENT

## ⚠️ TRIỆU CHỨNG
- Khi vào trang **Orders**: Hiện "Request failed with status code 401"
- Khi vào trang **Kitchen**: Hiện "Request failed with status code 401"  
- Khi vào trang **Reservations**: Hiện "No Tables Available"

## 🔍 NGUYÊN NHÂN
Token đăng nhập của bạn đã **HẾT HẠN** (thời gian sống: 15 phút)

## ✅ CÁCH FIX NHANH (30 GIÂY)

### Bước 1: Logout
1. Click nút **LOGOUT** ở góc trên bên phải
2. Hoặc vào: http://localhost:3000/login

### Bước 2: Login lại
1. Nhập thông tin:
   ```
   Email: admin@restaurant.com
   Password: admin123
   ```
2. Click **LOGIN**

### Bước 3: Test lại
1. Vào trang **Orders** - Sẽ thấy danh sách orders
2. Vào trang **Kitchen** - Sẽ thấy orders trong kitchen
3. Vào trang **Book Table** - Sẽ thấy danh sách tables

---

## 🔧 NẾU LOGOUT KHÔNG HOẠT ĐỘNG

### Cách 1: Clear Browser Data
1. Mở Chrome DevTools: nhấn **F12**
2. Vào tab **Application** 
3. Bên trái, click **Local Storage** → **http://localhost:3000**
4. Bên phải, tìm key `token` và click **Delete** (icon thùng rác)
5. Refresh page: nhấn **F5**
6. Login lại

### Cách 2: Hard Refresh
1. Nhấn **Ctrl + Shift + R** (Windows)
2. Hoặc **Cmd + Shift + R** (Mac)
3. Login lại

### Cách 3: Xóa Cache
1. Nhấn **Ctrl + Shift + Delete**
2. Chọn **Cached images and files**
3. Chọn **Time range: Last hour**
4. Click **Clear data**
5. Đóng trình duyệt
6. Mở lại và vào http://localhost:3000
7. Login

---

## 📊 THÔNG TIN ĐĂNG NHẬP

### Admin Account
```
Email: admin@restaurant.com
Password: admin123
Role: Admin (Full access)
```

### Customer Account  
```
Email: customer@test.com
Password: password123
Role: Customer
```

### Test Account
```
Email: john@example.com
Password: password123
Role: Customer
```

---

## 🎯 SAU KHI ĐĂNG NHẬP THÀNH CÔNG

Bạn có thể:
- ✅ Xem và quản lý **Orders**
- ✅ Xem **Kitchen View** (real-time orders)
- ✅ **Đặt bàn** (Book Table)
- ✅ Xem **My Reservations**
- ✅ Tạo **New Order**
- ✅ Xem **Menu**

---

## ⏰ LƯU Ý VỀ TOKEN

- **Thời gian sống**: 15 phút (900 giây)
- **Sau 15 phút không hoạt động**: Token tự động hết hạn
- **Khi hết hạn**: Phải logout và login lại
- **Refresh Token**: Có thời gian sống 7 ngày

---

## 🐛 NẾU VẪN GẶP VẤN ĐỀ

### Kiểm tra Backend
Mở Command Prompt và chạy:
```bash
curl http://localhost:5000/health
```

**Nếu thấy lỗi "Connection refused":**
- Backend đã tắt
- Cần khởi động lại backend

**Nếu thấy response OK:**
- Backend đang chạy tốt
- Vấn đề là token của frontend

### Kiểm tra Frontend
Mở trình duyệt và vào:
```
http://localhost:3000
```

**Nếu không load được:**
- Frontend đã tắt
- Cần khởi động lại frontend

---

## 📞 HỖ TRỢ KỸ THUẬT

Nếu sau tất cả các bước trên vẫn không fix được:

1. **Screenshot** màn hình lỗi
2. **Mở Chrome DevTools** (F12)
3. Vào tab **Console**
4. **Screenshot** các lỗi màu đỏ
5. Gửi cho team dev

---

## 🔐 BẢO MẬT

⚠️ **QUAN TRỌNG:**
- **KHÔNG** chia sẻ token với người khác
- **KHÔNG** copy token ra file text
- Token tự động được lưu an toàn trong browser
- Khi logout, token sẽ bị xóa hoàn toàn

---

**Cập nhật lần cuối:** 2025-10-08 15:30
**Trạng thái:** 
- ✅ Backend: RUNNING
- ⏳ Frontend: COMPILING
- 🔧 Fix: DEPLOYED

**Hotline:** Contact dev team nếu cần hỗ trợ
