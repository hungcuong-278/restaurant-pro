# 📱 Quick Responsive Test Checklist

**Date**: October 5, 2025  
**Tester**: _________________  
**Duration**: ~15-20 minutes

---

## 🚀 Quick Start

1. **Mở ứng dụng**: http://localhost:3000
2. **Mở DevTools**: `F12`
3. **Toggle Device Toolbar**: `Ctrl+Shift+M`
4. **Chọn thiết bị**: iPhone SE (375px)

---

## ✅ Test Checklist

### **📱 iPhone SE (375px) - 10 phút**

#### Page 1: Order List (`/orders`)
- [ ] Header: Title và button xếp theo chiều dọc
- [ ] Button "New Order" rộng full màn hình
- [ ] Order cards hiển thị 1 cột
- [ ] Không có scroll ngang
- [ ] Tất cả buttons dễ nhấn (đủ lớn)

#### Page 2: New Order (`/orders/new`)  
- [ ] 3 nút order type xếp dọc (Dine In, Takeout, Delivery)
- [ ] Table selection: 2 cột
- [ ] Menu items: 1 cột
- [ ] Cart ở dưới (không bên cạnh)
- [ ] Nút +/- quantity dễ nhấn
- [ ] Không có scroll ngang

#### Page 3: Order Details (click vào 1 order)
- [ ] Nút "Back" rộng full màn hình
- [ ] Action buttons (Edit, Cancel, Print) wrap xuống dòng
- [ ] Order items hiển thị rõ ràng
- [ ] Giá tiền có label "Total:" trên mobile
- [ ] Payment section hiển thị tốt
- [ ] Không có scroll ngang

#### Mobile Menu Test
- [ ] Click hamburger menu (☰) ở góc phải
- [ ] Menu slide vào mượt
- [ ] Backdrop (nền đen mờ) xuất hiện
- [ ] Tất cả menu items cao đủ (48px)
- [ ] Click backdrop để đóng menu
- [ ] Menu đóng mượt

#### Modal Test  
- [ ] Vào Order Details
- [ ] Click "Cancel Order"
- [ ] Modal hiện full-width
- [ ] Buttons xếp dọc
- [ ] Dễ đọc và dễ nhấn
- [ ] Click "No" hoặc backdrop để đóng

---

### **📱 iPad (768px) - 5 phút**

Đổi device sang iPad hoặc set width = 768px

- [ ] Order list: 2 cột
- [ ] New Order: Order type 3 cột ngang
- [ ] Menu items: 2 cột
- [ ] Tất cả còn dễ nhấn (touch-friendly)
- [ ] Không có scroll ngang

---

### **💻 Desktop (1280px+) - 3 phút**

Tắt Device Toolbar (Ctrl+Shift+M) hoặc set width = 1280px

- [ ] Order list: 3-4 cột
- [ ] New Order: Menu và Cart cạnh nhau
- [ ] Tất cả layout đẹp, không bị vỡ
- [ ] Hover effects hoạt động
- [ ] Không có visual regressions

---

## 🎯 Critical Checks (2 phút)

### 1. Horizontal Scroll Test
- [ ] Ở width 375px, thử scroll ngang → KHÔNG được scroll ngang

### 2. Button Size Test  
- [ ] Right-click vào 1 button → Inspect
- [ ] Check "Computed" tab → min-height ≥ 44px

### 3. Text Size Test
- [ ] Inspect text → font-size ≥ 14px (0.875rem)
- [ ] Input fields → font-size ≥ 16px (1rem)

---

## 📊 Test Results

```
iPhone SE (375px):     ☐ PASS  ☐ FAIL
iPad (768px):          ☐ PASS  ☐ FAIL  
Desktop (1280px):      ☐ PASS  ☐ FAIL
No Horizontal Scroll:  ☐ PASS  ☐ FAIL
Touch Targets OK:      ☐ PASS  ☐ FAIL

Overall Result:        ☐ PASS ✅  ☐ FAIL ❌
```

---

## 🐛 Issues Found

```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

---

## ✅ Nếu TẤT CẢ PASS → Responsive Design HOÀN THÀNH! 🎉

## ❌ Nếu có FAIL → Note lại issue và báo để fix

---

**Testing Time**: Start: _____ End: _____ (Goal: ~20 phút)
