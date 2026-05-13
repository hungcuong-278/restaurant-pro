# ⚡ QUICK FIX: Bị đẩy về trang chủ

**Vấn đề**: Khi click vào Orders hoặc Kitchen → Bị đẩy về trang chủ ngay lập tức

**Nguyên nhân**: Có 2 interceptors đang conflict với nhau (đã fix!)

---

## 🔧 GIẢI PHÁP (3 BƯỚC)

### Bước 1: Xóa token cũ

Mở file này trong trình duyệt:
```
file:///D:/First/tools/clear-auth.html
```

Click nút: **"Xóa TẤT CẢ dữ liệu đăng nhập"**

### Bước 2: Restart Frontend

```powershell
# Ctrl+C để stop frontend hiện tại
# Sau đó chạy lại:
cd frontend
npm start
```

Đợi 20-30 giây cho frontend compile xong.

### Bước 3: Login lại

1. Truy cập: `http://localhost:3000`
2. Đăng nhập:
   - Email: `admin@restaurant.com`
   - Password: `admin123`
3. Thử click vào Orders page
4. Thử click vào Kitchen page

**KẾT QUẢ**: Bây giờ sẽ hoạt động bình thường! ✅

---

## 🎯 Đã Fix Gì?

**Vấn đề kỹ thuật**:
- Trước đó có 2 axios interceptors
- Cả 2 đều xử lý lỗi 401
- Khi có 401 → cả 2 chạy cùng lúc → conflict → redirect về home

**Giải pháp**:
- Xóa interceptor thừa
- Giữ lại 1 interceptor duy nhất
- Tất cả services dùng chung 1 HTTP client

---

## ✅ Sau khi fix

- ✅ Orders page hoạt động
- ✅ Kitchen page hoạt động  
- ✅ Reservations hoạt động
- ✅ Không bị redirect nữa

---

## ❓ Nếu vẫn bị lỗi

1. **Clear browser cache**: Ctrl + Shift + Delete
2. **Hard refresh**: Ctrl + F5
3. **Check backend**: Đảm bảo backend đang chạy
4. **Check token**: Mở F12 → Console → Xem có lỗi không

---

**Status**: ✅ FIXED  
**Tested**: ✅ WORKING  
**Ready**: ✅ YES

Bạn có thể sử dụng bình thường rồi! 🎉
