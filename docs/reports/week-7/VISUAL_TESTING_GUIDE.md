# 🎨 Visual Testing Guide - Step by Step

---

## 📸 BƯỚC 1: Mở DevTools

**Keyboard Shortcut:**
```
F12
hoặc
Ctrl + Shift + I
```

**Hoặc Right-click:**
- Right-click anywhere → chọn "Inspect"

**Màn hình sẽ như này:**
```
┌─────────────────────────────────────────────┐
│  Restaurant Pro (your app)                  │
│                                             │
│                                             │
│                                             │ ← Your app
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  Elements  Console  Sources  Network   >> │
│  ┌────────────────────────────────────┐    │
│  │ <html>                             │    │ ← DevTools
│  │   <body>                           │    │
│  │     <div id="root">                │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 📱 BƯỚC 2: Toggle Device Toolbar

**Keyboard Shortcut:**
```
Ctrl + Shift + M
```

**Hoặc Click icon:**
- Tìm icon 📱 (device icon) ở góc trên DevTools
- Click vào đó

**Màn hình sau khi toggle:**
```
┌───────────────────────────────────────┐
│ Device Toolbar                        │
│ Dimensions: 375 x 667  [▼] Responsive│ ← Dropdown
│ Zoom: 100%    Rotate: ↻              │
├───────────────────────────────────────┤
│ ╔═══════════════════════════════╗    │
│ ║                               ║    │
│ ║     Your App                  ║    │ ← App trong mobile frame
│ ║     (mobile view)             ║    │
│ ║                               ║    │
│ ║                               ║    │
│ ╚═══════════════════════════════╝    │
└───────────────────────────────────────┘
```

---

## 🎯 BƯỚC 3: Chọn Device

**Click dropdown "Responsive":**

Chọn **"iPhone SE"** để test mobile

**Có 3 options:**
1. **Responsive** - Tự set kích thước
2. **iPhone SE** - 375 x 667 ← Chọn cái này
3. **iPad** - 768 x 1024
4. **Desktop** - Custom

---

## 🧪 BƯỚC 4: Test Order List Page

**Navigate to:** `http://localhost:3000/orders`

### ✅ Kiểm tra:

**1. Header Layout:**
```
┌─────────────────────────┐
│ Orders              ← Title (should stack)
│ X orders found          │
│                         │
│ ┌───────────────────┐   │
│ │  + New Order      │   │ ← Full-width button
│ └───────────────────┘   │
└─────────────────────────┘
```

**✓ PASS nếu:**
- Title và button xếp theo chiều dọc
- Button rộng full màn hình
- Không bị cut off

**✗ FAIL nếu:**
- Button và title cùng hàng (quá chật)
- Button nhỏ, khó nhấn
- Có scroll ngang

---

**2. Filters Layout:**
```
┌─────────────────────────┐
│ [🔍 Search orders...]   │ ← Full-width
│                         │
│ [All Status ▼]          │ ← Full-width
│                         │
│ [All Payments ▼]        │ ← Full-width
└─────────────────────────┘
```

**✓ PASS:** Filters xếp dọc, dễ nhấn

---

**3. Order Cards:**
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │ ☐ Order #123        │ │ ← Single column
│ │ Table 5             │ │
│ │ 3 items             │ │
│ │ $50.00              │ │
│ │ [Pending]           │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ☐ Order #124        │ │ ← Second card
│ │ Table 2             │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**✓ PASS:** 1 cột, dễ đọc

---

## 🍕 BƯỚC 5: Test New Order Page

**Click "New Order"** → Navigate to `/orders/new`

### ✅ Kiểm tra:

**1. Order Type Buttons:**
```
┌─────────────────────────┐
│ 1. Select Order Type    │
│                         │
│ ┌───────────────────┐   │
│ │   🍽️ Dine In      │   │ ← Stack vertically
│ │   Eat at restaurant │ │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │   🥡 Takeout      │   │
│ │   Take away       │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │   🚚 Delivery     │   │
│ │   Deliver to...   │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

**✓ PASS:** 3 buttons xếp dọc, dễ nhấn

---

**2. Table Selection (Dine In):**
```
┌─────────────────────────┐
│ 2. Select Table         │
│                         │
│ ┌────────┐ ┌────────┐   │ ← 2 columns
│ │  🪑    │ │  🪑    │   │
│ │Table 1 │ │Table 2 │   │
│ │4 seats │ │6 seats │   │
│ └────────┘ └────────┘   │
│                         │
│ ┌────────┐ ┌────────┐   │
│ │Table 3 │ │Table 4 │   │
│ └────────┘ └────────┘   │
└─────────────────────────┘
```

**✓ PASS:** 2 cột, vừa vặn

---

**3. Menu Items:**
```
┌─────────────────────────┐
│ 3. Select Menu Items    │
│                         │
│ [🔍 Search menu...]     │
│                         │
│ [All] [Appetizers] [...] ← Scroll ngang OK
│                         │
│ ┌─────────────────────┐ │ ← 1 column
│ │ Pizza Margherita    │ │
│ │ Fresh tomatoes...   │ │
│ │ $12.00   [- 1 +]    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Caesar Salad        │ │
│ │ Romaine lettuce...  │ │
│ │ $8.00    [- 1 +]    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**✓ PASS:** 1 cột menu items

---

**4. Cart (Your Order):**
```
┌─────────────────────────┐
│ Your Order              │ ← Ở DƯỚI menu
│                         │
│ ┌─────────────────────┐ │
│ │ Pizza Margherita    │ │
│ │ $12.00 × 1          │ │
│ │ [- 1 +]     $12.00  │ │
│ │ [Special notes...]  │ │
│ └─────────────────────┘ │
│                         │
│ Subtotal: $12.00        │
│ Tax:      $1.20         │
│ ─────────────────       │
│ Total:    $13.20        │
│                         │
│ ┌───────────────────┐   │
│ │  📝 Place Order   │   │ ← Full-width
│ └───────────────────┘   │
└─────────────────────────┘
```

**✓ PASS:** Cart ở dưới, full-width button

---

## 📋 BƯỚC 6: Test Order Details

**Click vào 1 order từ list**

### ✅ Kiểm tra:

**1. Header:**
```
┌─────────────────────────┐
│ ┌───────────────────┐   │
│ │ ← Back to Orders  │   │ ← Full-width
│ └───────────────────┘   │
│                         │
│ Order #abc123           │
│                         │
│ ┌───────────────────┐   │
│ │  ✏️ Edit         │   │ ← Buttons wrap
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │  ❌ Cancel       │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │  🖨️ Print        │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

**✓ PASS:** Buttons xếp dọc hoặc wrap

---

**2. Order Items:**
```
┌─────────────────────────┐
│ Order Items             │
│                         │
│ ┌─────────────────────┐ │
│ │ 1. Pizza Margherita │ │ ← Item card
│ │    $12.00 each      │ │
│ │    × 2              │ │
│ │                     │ │
│ │ Total:      $24.00  │ │ ← "Total:" label
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 2. Caesar Salad     │ │
│ │    $8.00 each       │ │
│ │    × 1              │ │
│ │ Total:      $8.00   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**✓ PASS:** 
- Items hiển thị rõ ràng
- Có label "Total:" trên mobile
- Dễ đọc giá tiền

---

## 🍔 BƯỚC 7: Test Mobile Menu

**Click hamburger icon (☰) ở header**

### ✅ Kiểm tra:

**Animation:**
```
Before:                  After:
┌────────────────┐      ┌────────────────┐
│  LOGO    ☰     │      │  LOGO    ✕     │
└────────────────┘      │                │
                        │  [backdrop]    │ ← Nền đen mờ
                        │  ┌──────────┐  │
                        │  │ Home     │  │ ← Menu slide in
                        │  │ Orders   │  │
                        │  │ Menu     │  │
                        │  │ Login    │  │
                        │  └──────────┘  │
                        └────────────────┘
```

**✓ PASS nếu:**
- Backdrop (nền đen mờ) xuất hiện
- Menu slide vào từ phải
- Menu items cao đủ (48px)
- Click backdrop → menu đóng
- Animation mượt

---

## 🔔 BƯỚC 8: Test Modal

**Click "Cancel Order" button**

### ✅ Kiểm tra:

```
┌─────────────────────────┐
│  [backdrop mờ]          │
│  ┌───────────────────┐  │
│  │  ⚠️              │  │
│  │                   │  │
│  │ Cancel Order?     │  │ ← Modal full-width
│  │                   │  │
│  │ Are you sure you  │  │
│  │ want to cancel?   │  │
│  │                   │  │
│  │ ┌───────────────┐ │  │
│  │ │Yes, Cancel    │ │  │ ← Buttons stack
│  │ └───────────────┘ │  │
│  │ ┌───────────────┐ │  │
│  │ │No, Keep Order │ │  │
│  │ └───────────────┘ │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

**✓ PASS:**
- Modal full-width
- Buttons xếp dọc
- Buttons full-width
- Dễ đọc và nhấn

---

## 📏 BƯỚC 9: Measure Touch Targets

**Right-click button → Inspect:**

```
DevTools → Styles panel:

.button {
  min-height: 48px;     ← Phải ≥ 44px
  padding: 12px 16px;
}

Computed tab:
  height: 48px          ← Check actual height
```

**✓ PASS:** height ≥ 44px

---

## 🚫 BƯỚC 10: Test Horizontal Scroll

**Thử scroll ngang:**

```
Method 1: Trackpad
- Vuốt ngang → KHÔNG được scroll

Method 2: Mouse
- Scroll wheel ngang → KHÔNG được scroll

Method 3: Visual
- Không có scrollbar ngang ở dưới
```

**✓ PASS:** Không scroll ngang được

---

## ✅ TẤT CẢ PASS → SUCCESS! 🎉

**Nếu tất cả 10 bước PASS:**
- Responsive design HOÀN THÀNH
- App ready cho mobile users
- Có thể move to next task

**Nếu có FAIL:**
- Note lại bước nào fail
- Screenshot lỗi
- Báo để fix

---

## 📸 Screenshots để so sánh

**iPhone SE (375px):**
- Order List
- New Order  
- Order Details

**iPad (768px):**
- Order List (2 cols)
- New Order (side-by-side)

**Desktop (1280px):**
- Order List (3-4 cols)
- New Order (full layout)

---

**Happy Testing! 🚀**
