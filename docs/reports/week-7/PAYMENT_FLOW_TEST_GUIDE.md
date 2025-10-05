# 💳 Payment Flow - Quick Test Guide

## 🚀 **Quick Start**

### **Access Payment Page:**
```
http://localhost:3000/payment/process
```

### **Test with Sample Data:**
```
Order: ORD-20251005-001
Amount: 285,000 ₫
```

---

## 🧪 **Test Scenarios**

### **Test 1: Cash Payment (In-Store)**

1. Open: `http://localhost:3000/payment/process?order=ORD-20251005-001&amount=285000`
2. Click **💵 Tiền Mặt** card
3. Verify:
   - ✅ Orange badge shows "Tại quầy"
   - ✅ Warning message appears: "⚠️ Thanh toán tại cửa hàng"
   - ✅ "Xác Nhận Thanh Toán" button visible
4. Click **✅ Xác Nhận Thanh Toán**
5. Verify:
   - ✅ Confirmation dialog shows order details
   - ✅ Click OK → Success alert appears
   - ✅ Redirects to orders page

**Expected:** ✅ Flow completes without showing QR code

---

### **Test 2: Credit Card Payment (In-Store)**

1. Open payment page
2. Click **💳 Thẻ Tín Dụng** card
3. Verify:
   - ✅ Orange badge "Tại quầy"
   - ✅ Same flow as cash
4. Click **✅ Xác Nhận Thanh Toán**
5. Verify confirmation and redirect

**Expected:** ✅ Same as cash flow

---

### **Test 3: Bank Transfer (Online)**

1. Open payment page
2. Click **🏦 Chuyển Khoản** card
3. Verify:
   - ✅ Green badge shows "Online"
   - ✅ Success message: "✅ Thanh toán online"
   - ✅ QR code appears below
   - ✅ MB Bank info visible:
     * Bank: MB Bank
     * Account: 9724 2220 3982 1491
     * Name: Restaurant Pro
   - ✅ Amount shows: 285,000 ₫
   - ✅ Order number shows: ORD-20251005-001
4. Verify payment instructions (5 steps)
5. Verify copy buttons work:
   - Click "📋 Copy" on account → Alert: "✅ Đã copy số tài khoản!"
   - Click "📋 Copy" on amount → Alert: "✅ Đã copy số tiền!"
6. Click **✅ Đã Chuyển Khoản Thành Công**
7. Verify:
   - ✅ Confirmation dialog
   - ✅ Success alert
   - ✅ Redirects to orders

**Expected:** ✅ Full QR flow with MB Bank info

---

### **Test 4: E-wallet (Online)**

1. Open payment page
2. Click **📱 Ví Điện Tử** card
3. Verify:
   - ✅ Green badge "Online"
   - ✅ Same QR code flow as bank transfer
   - ✅ Instructions mention Momo, ZaloPay, VNPay
4. Complete payment confirmation

**Expected:** ✅ Same as bank transfer flow

---

## 📱 **Mobile Testing**

### **Test on Phone:**
```
http://192.168.1.212:3000/payment/process?order=ORD-20251005-001&amount=285000
```
(Replace IP with your computer's IP)

### **Mobile Checks:**
- [ ] Payment method cards stack vertically
- [ ] Touch targets are large enough
- [ ] QR code is scannable size
- [ ] Copy buttons work on tap
- [ ] Text is readable
- [ ] No horizontal scrolling

---

## 🎯 **Integration Test**

### **Test with Order Flow:**

1. **Mock Order Creation:**
```typescript
// In browser console:
const mockOrder = {
  order_number: 'ORD-20251005-999',
  total_amount: 450000,
  id: 'test-order-id'
};

// Navigate programmatically:
window.location.href = '/payment/process?order=' + mockOrder.order_number + '&amount=' + mockOrder.total_amount;
```

2. **Verify:**
   - ✅ Order number appears: ORD-20251005-999
   - ✅ Amount appears: 450,000 ₫
   - ✅ All payment methods work
   - ✅ QR uses correct amount

---

## 🔍 **Validation Tests**

### **Test 5: Missing Order Info**

1. Open: `http://localhost:3000/payment/process`
2. Verify:
   - ✅ Order number shows: N/A
   - ✅ Amount shows: 0 ₫
   - ✅ Page still functional

### **Test 6: No Payment Method Selected**

1. Open payment page with valid data
2. **Don't select any payment method**
3. Click **✅ Xác Nhận Thanh Toán** (if visible)
4. Verify:
   - ✅ Alert: "⚠️ Vui lòng chọn phương thức thanh toán!"

---

## 🎨 **Visual Tests**

### **Check Visual Elements:**

- [ ] Payment method cards have hover effect
- [ ] Selected card has blue border
- [ ] Checkmark appears on selected card
- [ ] Badges show correct colors (orange/green)
- [ ] QR code has rounded corners and shadow
- [ ] Bank info cards have subtle shadows
- [ ] Buttons have proper colors
- [ ] Loading spinner works (if processing)
- [ ] 🔒 Security notice visible

---

## 🐛 **Bug Checks**

### **Potential Issues:**

1. **QR Image Not Found:**
   - Expected: Shows gray placeholder with "QR Code" text
   - Check: `frontend/public/payment-qr.png` exists

2. **Copy Not Working:**
   - Expected: Alert appears
   - Check: Browser clipboard permission
   - Note: Only works on HTTPS or localhost

3. **Navigation Fails:**
   - Expected: Redirects to /orders or /orders/:orderId
   - Check: React Router is working

4. **MB Bank Info Wrong:**
   - Check: Account shows exactly `9724 2220 3982 1491`
   - Check: Bank name shows `MB Bank`

---

## ✅ **Success Criteria**

### **All Tests Pass If:**

- ✅ All 4 payment methods selectable
- ✅ In-store methods show warning message
- ✅ Online methods show QR code
- ✅ MB Bank account info correct
- ✅ Copy buttons work
- ✅ Confirmation dialogs work
- ✅ Navigation works after completion
- ✅ Mobile responsive
- ✅ No console errors

---

## 📊 **Test Results**

**Date:** October 5, 2025

| Test | Status | Notes |
|------|--------|-------|
| Cash Payment | ⏳ | Pending |
| Credit Card | ⏳ | Pending |
| Bank Transfer | ⏳ | Pending |
| E-wallet | ⏳ | Pending |
| Mobile Responsive | ⏳ | Pending |
| QR Display | ⏳ | Pending |
| Copy Buttons | ⏳ | Pending |
| Navigation | ⏳ | Pending |

---

## 🚀 **Next: Save QR Image**

**To complete QR display:**

1. Save your MB Bank QR code image
2. Place it at: `d:\First\frontend\public\payment-qr.png`
3. Refresh browser
4. QR code should display!

**QR Code should encode:**
- Account: 9724 2220 3982 1491
- Bank: MB Bank (code: 970422)
- Format: VietQR standard

---

**Happy Testing! 🎉**
