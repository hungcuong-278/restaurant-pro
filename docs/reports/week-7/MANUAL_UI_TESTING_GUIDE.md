# 🧪 MANUAL UI TESTING GUIDE - Task 3.7
# Restaurant Pro - Order Management System

**Testing Date:** December 26, 2024  
**Tester:** [Your Name]  
**Browser:** Chrome / Firefox / Edge  
**Screen Resolution:** 1920x1080 (recommended)

---

## 📋 PRE-TEST SETUP

### ✅ Check Servers Running

1. **Backend:** http://localhost:5000
   - Open browser tab: http://localhost:5000/api/health
   - Should see: `{"status":"ok"}`

2. **Frontend:** http://localhost:3000
   - Open browser tab: http://localhost:3000
   - Should see: Restaurant Pro homepage

3. **Database:** Check backend terminal
   - Should see: "Server running on port 5000"
   - No error messages

### ✅ Open Developer Tools

- Press `F12` or `Ctrl+Shift+I`
- Open Console tab
- Clear console (`Ctrl+L`)
- Keep it open during testing

---

## 🧪 TEST SUITE 1: ORDER LIST PAGE

### Test 1.1: Navigate to Orders Page ⏱️ 2 min

**Steps:**
1. Open http://localhost:3000
2. Click "Orders" in navigation menu
3. Wait for page to load

**Expected Results:**
- [ ] ✅ Page loads within 2 seconds
- [ ] ✅ URL is `/orders`
- [ ] ✅ Page title shows "Orders" or "Order Management"
- [ ] ✅ Orders list displays (table or cards)
- [ ] ✅ No console errors (check F12)
- [ ] ✅ Loading spinner shows briefly

**Actual Results:**
```
[Write what you see here]
```

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED

**Screenshot:** (Optional)

---

### Test 1.2: View Order List ⏱️ 3 min

**Steps:**
1. On Orders page
2. Observe the list of orders
3. Check each order card/row

**Expected Results:**
- [ ] ✅ At least 1 order displays
- [ ] ✅ Each order shows:
  - Order ID (first 8 characters)
  - Table number
  - Status badge (colored)
  - Payment status badge
  - Total amount (formatted with đ)
  - Created date/time
- [ ] ✅ Status badges have correct colors:
  - Pending: Yellow/Orange
  - Confirmed: Blue
  - Preparing: Purple
  - Ready: Green
  - Served: Teal
  - Completed: Green with checkmark
  - Cancelled: Red

**Actual Results:**
```
Number of orders shown: ___
Order statuses visible: ___
Colors look correct: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 1.3: Search/Filter Orders ⏱️ 2 min

**Steps:**
1. Look for search box or filters
2. Try typing order ID or table number
3. Try filtering by status (if available)

**Expected Results:**
- [ ] ✅ Search box is visible
- [ ] ✅ Typing filters results in real-time
- [ ] ✅ Filtered results are accurate
- [ ] ✅ "No results" message if no match

**Actual Results:**
```
[Write results here]
```

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ NOT IMPLEMENTED

---

## 🧪 TEST SUITE 2: ORDER DETAILS PAGE

### Test 2.1: Open Order Details ⏱️ 2 min

**Steps:**
1. Click on any order from the list
2. Wait for details page to load
3. Observe the layout

**Expected Results:**
- [ ] ✅ Details page loads within 1 second
- [ ] ✅ URL changes to `/orders/[order-id]`
- [ ] ✅ "Back to Orders" button visible
- [ ] ✅ Order information displays
- [ ] ✅ No console errors

**Actual Results:**
```
Load time: ___ seconds
URL: ___
Layout looks good: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 2.2: Verify Order Information ⏱️ 3 min

**Steps:**
1. On order details page
2. Check all sections carefully

**Expected Results:**
- [ ] ✅ **Header Section:**
  - Order ID (short format)
  - Current status badge
  - Payment status badge
  - Action buttons visible

- [ ] ✅ **Order Info Card:**
  - Table number
  - Customer name (if any)
  - Order date/time
  - Status timeline/progress
  
- [ ] ✅ **Items Section:**
  - All items listed
  - Item names
  - Quantities (×2, ×3, etc.)
  - Unit prices
  - Subtotals
  - Special instructions (if any)
  
- [ ] ✅ **Total Section:**
  - Subtotal amount
  - Tax/Service charge (if any)
  - Grand total
  - All amounts formatted correctly (with đ)

**Actual Results:**
```
All sections visible: YES / NO
Missing sections: ___
Data looks accurate: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 2.3: Order Status Manager ⏱️ 3 min

**Steps:**
1. Scroll to "Order Status" section
2. Look for status update component
3. Check available actions

**Expected Results:**
- [ ] ✅ Current status highlighted/selected
- [ ] ✅ Status flow diagram visible (if implemented)
- [ ] ✅ "Update Status" or "Change Status" button
- [ ] ✅ Button enabled if order can be updated
- [ ] ✅ Button disabled if order is cancelled/completed

**Actual Results:**
```
Status manager found: YES / NO
Can update status: YES / NO
UI looks intuitive: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🧪 TEST SUITE 3: PAYMENT MODAL

### Test 3.1: Open Payment Modal ⏱️ 2 min

**Steps:**
1. Find an order with status "unpaid" or "partial"
2. Look for "Process Payment" button
3. Click the button

**Expected Results:**
- [ ] ✅ Button is visible and enabled
- [ ] ✅ Modal/dialog opens smoothly
- [ ] ✅ Modal has proper title "Process Payment"
- [ ] ✅ Modal shows order ID
- [ ] ✅ Close (X) button visible
- [ ] ✅ Background dims/darkens

**Actual Results:**
```
Button found: YES / NO
Modal opens: YES / NO
Animation smooth: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.2: Payment Summary Display ⏱️ 2 min

**Steps:**
1. Payment modal is open
2. Look at the top summary section

**Expected Results:**
- [ ] ✅ **Payment Summary Card visible with:**
  - Total Amount (large, bold)
  - Already Paid amount (if partial payment)
  - Current Payments amount (in this session)
  - Remaining balance (highlighted)
  - All amounts correct
  - Color coding (green for paid, orange for remaining)

**Actual Results:**
```
Total Amount: ___đ
Remaining: ___đ
Summary clear: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.3: Payment Method Selection ⏱️ 3 min

**Steps:**
1. Look at payment method buttons
2. Click each method one by one
3. Observe selected state

**Expected Results:**
- [ ] ✅ **4 payment methods visible:**
  - 💵 Cash
  - 💳 Credit/Debit Card
  - 📱 Mobile Payment
  - 🏦 Bank Transfer
- [ ] ✅ Each method has icon
- [ ] ✅ Clicking selects the method
- [ ] ✅ Selected method highlighted (blue border/background)
- [ ] ✅ Only one method selected at a time

**Actual Results:**
```
All 4 methods visible: YES / NO
Icons display: YES / NO
Selection works: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.4: Amount Input ⏱️ 4 min

**Steps:**
1. Find the amount input field
2. Try entering different amounts

**Test Cases:**
- [ ] Enter valid amount (e.g., 50000)
- [ ] Enter decimal amount (e.g., 50000.50)
- [ ] Try negative number (should be rejected)
- [ ] Try amount > remaining (should warn)
- [ ] Try 0 (should be rejected)
- [ ] Try letters (should be rejected)

**Expected Results:**
- [ ] ✅ Input accepts numbers only
- [ ] ✅ Input accepts decimals
- [ ] ✅ Validation prevents invalid amounts
- [ ] ✅ Error messages show for invalid input
- [ ] ✅ Input is large and easy to read

**Actual Results:**
```
Validation works: YES / NO
Error messages clear: YES / NO
Issues found: ___
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.5: Quick Amount Buttons ⏱️ 3 min

**Steps:**
1. Look for quick amount buttons (25%, 50%, 75%, Full)
2. Click each button and check input value
3. Verify calculations

**Test for each button:**
- [ ] **25% button:** Sets 25% of remaining amount
- [ ] **50% button:** Sets 50% of remaining amount
- [ ] **75% button:** Sets 75% of remaining amount
- [ ] **Full button:** Sets 100% of remaining amount

**Expected Results:**
- [ ] ✅ All 4 buttons visible
- [ ] ✅ Clicking sets amount in input
- [ ] ✅ Calculations are accurate (check with calculator)
- [ ] ✅ Amount formatted with 2 decimals

**Actual Results:**
```
Remaining: 100,000đ
25% should be: 25,000đ → Actual: ___
50% should be: 50,000đ → Actual: ___
75% should be: 75,000đ → Actual: ___
Full should be: 100,000đ → Actual: ___
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.6: Add Payment to List ⏱️ 3 min

**Steps:**
1. Select payment method (Cash)
2. Enter amount (e.g., 30000)
3. Click "Add Payment" button

**Expected Results:**
- [ ] ✅ Payment appears in list below
- [ ] ✅ Payment shows:
  - Method icon (💵)
  - Method name (Cash)
  - Amount (30,000đ)
  - Timestamp
  - Remove (×) button
- [ ] ✅ Input field clears after adding
- [ ] ✅ Remaining balance updates
- [ ] ✅ Can add multiple payments

**Actual Results:**
```
Payment added: YES / NO
Remaining updated: YES / NO
Can add more: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.7: Remove Payment from List ⏱️ 2 min

**Steps:**
1. Add 2-3 payments to the list
2. Click remove (×) button on one payment
3. Observe changes

**Expected Results:**
- [ ] ✅ Payment removed immediately
- [ ] ✅ Remaining balance increases
- [ ] ✅ Other payments stay in list
- [ ] ✅ No errors

**Actual Results:**
```
[Write results]
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.8: Split Payment ⏱️ 5 min

**Steps:**
1. Open order with total 100,000đ
2. Add payment: Cash - 40,000đ
3. Add payment: Card - 30,000đ  
4. Add payment: Mobile - 30,000đ
5. Verify total = 100,000đ

**Expected Results:**
- [ ] ✅ Can add multiple payments
- [ ] ✅ Different methods allowed
- [ ] ✅ Running total updates
- [ ] ✅ Remaining balance = 0 when full
- [ ] ✅ Green indicator shows when fully paid
- [ ] ✅ Receipt button appears

**Actual Results:**
```
Total payments: ___đ
Should equal: 100,000đ
Remaining: ___đ
Fully paid indicator: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.9: Partial Payment Warning ⏱️ 3 min

**Steps:**
1. Open order with total 100,000đ
2. Add payment: Cash - 60,000đ (less than total)
3. Observe warnings/indicators

**Expected Results:**
- [ ] ✅ Orange warning box appears
- [ ] ✅ Warning message: "Partial payment: 40,000đ remaining"
- [ ] ✅ Remaining amount highlighted
- [ ] ✅ Can still process payment
- [ ] ✅ Message about "Partially Paid" status

**Actual Results:**
```
Warning shown: YES / NO
Message clear: YES / NO
Can proceed: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 3.10: Process Payment ⏱️ 5 min

**Steps:**
1. Add payment(s) to list
2. Click "Process Payment" button
3. Confirm in dialog (if any)
4. Wait for response

**Expected Results:**
- [ ] ✅ Confirmation dialog appears
- [ ] ✅ Shows total amount to process
- [ ] ✅ Shows number of payments
- [ ] ✅ Button shows loading state
- [ ] ✅ Success message appears
- [ ] ✅ Modal closes automatically
- [ ] ✅ Order page refreshes
- [ ] ✅ Payment status updated
- [ ] ✅ Payment history appears

**Actual Results:**
```
Processing time: ___ seconds
Success message: YES / NO
Modal closed: YES / NO
Status updated: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🧪 TEST SUITE 4: PAYMENT HISTORY

### Test 4.1: View Payment History ⏱️ 3 min

**Steps:**
1. Open order with existing payments
2. Look for "Payment History" section
3. Examine the list

**Expected Results:**
- [ ] ✅ Payment History card visible
- [ ] ✅ Shows title "Payment History"
- [ ] ✅ Shows count of payments
- [ ] ✅ Each payment displays:
  - Method icon
  - Method name
  - Amount
  - Timestamp
  - Transaction ID
  - Status badge
- [ ] ✅ Payments sorted by date (newest first)
- [ ] ✅ Total paid summary at top

**Actual Results:**
```
History found: YES / NO
Number of payments: ___
Total shown: ___đ
Format looks good: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 4.2: Payment Status Badges ⏱️ 2 min

**Steps:**
1. Look at status badges in payment history
2. Check colors and labels

**Expected Status Types:**
- [ ] ✅ Pending (yellow)
- [ ] ✅ Processing (blue)
- [ ] ✅ Completed (green)
- [ ] ✅ Failed (red)
- [ ] ✅ Refunded (gray)

**Actual Results:**
```
Badges display correctly: YES / NO
Colors appropriate: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🧪 TEST SUITE 5: RECEIPT GENERATION

### Test 5.1: Generate Receipt Button ⏱️ 2 min

**Steps:**
1. Open fully paid order
2. Look for "Generate Receipt" button
3. Check button state

**Expected Results:**
- [ ] ✅ Button visible only when order is paid
- [ ] ✅ Button NOT visible for unpaid orders
- [ ] ✅ Button enabled and clickable
- [ ] ✅ Button has icon (🧾)

**Actual Results:**
```
Button found on paid order: YES / NO
Button hidden on unpaid: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 5.2: Open Receipt in New Window ⏱️ 3 min

**Steps:**
1. Click "Generate Receipt" button
2. Wait for new window/tab to open
3. Examine the receipt

**Expected Results:**
- [ ] ✅ New window/tab opens
- [ ] ✅ Receipt displays within 2 seconds
- [ ] ✅ Window size appropriate (500x800)
- [ ] ✅ Button changes to "Receipt Generated"

**Actual Results:**
```
New window opened: YES / NO
Load time: ___ seconds
Looks professional: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 5.3: Receipt Content ⏱️ 5 min

**Steps:**
1. Receipt window is open
2. Check all sections carefully

**Expected Receipt Content:**
- [ ] ✅ **Header:**
  - Restaurant name (Golden Fork Restaurant)
  - Restaurant address
  - Restaurant phone
  - Professional styling
  
- [ ] ✅ **Order Information:**
  - Order number
  - Table number
  - Customer name (if any)
  - Order date/time
  - Completion time

- [ ] ✅ **Items Section:**
  - All items listed
  - Quantities correct
  - Prices correct
  - Subtotals calculated
  - Special instructions shown

- [ ] ✅ **Totals:**
  - Grand total prominent
  - Amount correct

- [ ] ✅ **Payments:**
  - All payments listed
  - Methods shown
  - Amounts correct
  - Transaction IDs visible

- [ ] ✅ **Footer:**
  - "Thank You!" message
  - "Please come again"
  - Generation timestamp

**Actual Results:**
```
All sections present: YES / NO
Data accurate: YES / NO
Professional appearance: YES / NO
Missing information: ___
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 5.4: Print Receipt ⏱️ 2 min

**Steps:**
1. Receipt window open
2. Press `Ctrl+P` to open print dialog
3. Check print preview

**Expected Results:**
- [ ] ✅ Print dialog opens
- [ ] ✅ Receipt looks good in preview
- [ ] ✅ Fits on one page
- [ ] ✅ No unnecessary elements (buttons, etc.)
- [ ] ✅ Colors print well (or B&W friendly)

**Actual Results:**
```
Print preview good: YES / NO
Fits on page: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🧪 TEST SUITE 6: KITCHEN VIEW

### Test 6.1: Navigate to Kitchen Page ⏱️ 2 min

**Steps:**
1. Look for "Kitchen" link in navigation
2. Click if available
3. Wait for page load

**Expected Results:**
- [ ] ✅ Kitchen link visible (if user has access)
- [ ] ✅ Kitchen link restricted to staff/admin
- [ ] ✅ Page loads quickly
- [ ] ✅ URL is `/kitchen`

**Actual Results:**
```
Kitchen link visible: YES / NO
Access granted: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ NOT ACCESSIBLE

---

### Test 6.2: Kitchen Board Layout ⏱️ 3 min

**Steps:**
1. On kitchen page
2. Observe the layout
3. Check columns

**Expected Results:**
- [ ] ✅ **3 columns visible:**
  - Preparing (purple/blue)
  - Ready (green)
  - Served (teal/dark)
- [ ] ✅ Each column shows count
- [ ] ✅ Orders displayed as cards
- [ ] ✅ Responsive layout

**Actual Results:**
```
Layout: 3 columns / other: ___
Cards visible: YES / NO
Design clear: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 6.3: Order Cards in Kitchen ⏱️ 3 min

**Steps:**
1. Look at order cards in each column
2. Check information displayed

**Expected Each Card Shows:**
- [ ] ✅ Order number
- [ ] ✅ Table number
- [ ] ✅ Items list
- [ ] ✅ Quantities
- [ ] ✅ Time since ordered
- [ ] ✅ Special instructions (highlighted)
- [ ] ✅ Action button (Mark Ready, Mark Served)

**Actual Results:**
```
All info visible: YES / NO
Special instructions stand out: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 6.4: Update Status from Kitchen ⏱️ 3 min

**Steps:**
1. Find order in "Preparing" column
2. Click "Mark Ready" button
3. Observe changes

**Expected Results:**
- [ ] ✅ Order moves to "Ready" column
- [ ] ✅ Animation smooth
- [ ] ✅ Button changes to "Mark Served"
- [ ] ✅ No page refresh needed
- [ ] ✅ Count updates in columns

**Actual Results:**
```
Order moved: YES / NO
Animation: smooth / jumpy / none
Count updated: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 6.5: Auto-Refresh ⏱️ 1 min

**Steps:**
1. Stay on kitchen page
2. Wait 30-60 seconds
3. Watch for auto-refresh

**Expected Results:**
- [ ] ✅ Page refreshes automatically
- [ ] ✅ No full page reload
- [ ] ✅ New orders appear
- [ ] ✅ Status changes reflect
- [ ] ✅ Smooth transition

**Actual Results:**
```
Auto-refresh works: YES / NO
Interval: ~___ seconds
Smooth: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 6.6: Bulk Status Update ⏱️ 4 min

**Steps:**
1. Select multiple orders (checkboxes)
2. Click "Update Selected" button
3. Choose target status
4. Confirm

**Expected Results:**
- [ ] ✅ Can select multiple orders
- [ ] ✅ Checkboxes work
- [ ] ✅ Bulk update button appears
- [ ] ✅ Status selector shows
- [ ] ✅ All selected orders update
- [ ] ✅ Success message with count
- [ ] ✅ Orders move to correct column

**Actual Results:**
```
Selected: ___ orders
All updated: YES / NO
Success count correct: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

## 🧪 TEST SUITE 7: EDGE CASES

### Test 7.1: Order with No Items ⏱️ 2 min

**Steps:**
1. Try to find or create empty order
2. See how system handles it

**Expected Results:**
- [ ] ✅ Empty order rejected or
- [ ] ✅ Shows "No items" message
- [ ] ✅ No calculation errors

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ NOT TESTABLE

---

### Test 7.2: Network Error Simulation ⏱️ 3 min

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Try to load orders page
5. Restore network

**Expected Results:**
- [ ] ✅ Error message displays
- [ ] ✅ Message is user-friendly
- [ ] ✅ Retry button available
- [ ] ✅ No app crash
- [ ] ✅ Recovery works when online

**Actual Results:**
```
Error handled: YES / NO
Message shown: "___"
App recovers: YES / NO
```

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 7.3: Large Order (50+ items) ⏱️ 3 min

**Steps:**
1. Find or create order with many items
2. Open order details
3. Check performance

**Expected Results:**
- [ ] ✅ Page loads without lag
- [ ] ✅ All items display
- [ ] ✅ Scrolling smooth
- [ ] ✅ Calculations accurate

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ NOT TESTABLE

---

### Test 7.4: Concurrent Updates ⏱️ 5 min

**Steps:**
1. Open same order in 2 browser tabs
2. Update status in tab 1
3. Refresh tab 2
4. Check consistency

**Expected Results:**
- [ ] ✅ Both tabs show same data
- [ ] ✅ No conflicts
- [ ] ✅ Latest update wins

**Status:** ⬜ PASS / ⬜ FAIL

---

## 📊 FINAL RESULTS SUMMARY

### Overall Statistics

**Test Suites:** 7  
**Total Tests:** 40+  

**Results:**
- ✅ PASSED: ___ / ___
- ❌ FAILED: ___ / ___
- ⬜ BLOCKED: ___ / ___
- ⬜ NOT TESTED: ___ / ___

**Pass Rate:** ____%

---

### Critical Issues Found

| # | Severity | Description | Page | Status |
|---|----------|-------------|------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

### Minor Issues Found

| # | Description | Page | Priority |
|---|-------------|------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

### UI/UX Observations

**Positive:**
- 
- 
- 

**Needs Improvement:**
- 
- 
- 

---

### Performance Notes

**Page Load Times:**
- Orders List: ___ seconds
- Order Details: ___ seconds
- Kitchen View: ___ seconds

**API Response Times:**
- Get Orders: ___ ms
- Process Payment: ___ ms
- Generate Receipt: ___ ms

---

### Browser Compatibility

- [ ] Chrome: ✅ / ❌
- [ ] Firefox: ✅ / ❌
- [ ] Edge: ✅ / ❌
- [ ] Safari: ✅ / ❌

---

### Overall Assessment

**Functionality:** ⭐⭐⭐⭐⭐ (1-5 stars)  
**Usability:** ⭐⭐⭐⭐⭐  
**Design:** ⭐⭐⭐⭐⭐  
**Performance:** ⭐⭐⭐⭐⭐  

**Recommendation:**
- [ ] ✅ READY FOR PRODUCTION
- [ ] ⚠️ READY WITH MINOR FIXES
- [ ] ❌ NEEDS MAJOR FIXES

---

**Tested By:** _______________  
**Date:** _______________  
**Time Spent:** ___ hours  
**Signature:** _______________

---

## 📝 NOTES & COMMENTS

```
Add any additional notes, screenshots, or comments here...
```

---

**END OF TEST GUIDE**
