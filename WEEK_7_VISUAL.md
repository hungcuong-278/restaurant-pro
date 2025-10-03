# Week 7 Visual Overview 🎨

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                  WEEK 7: ORDER MANAGEMENT & PAYMENT SYSTEM                   ║
║                         October 4-11, 2025 (8 Days)                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│  📚 DOCUMENTATION STRUCTURE                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ⭐ WEEK_7_README.md              → START HERE! (Navigation guide)           │
│                                                                              │
│  📋 WEEK_7_SUMMARY.md             → Quick reference (453 lines)             │
│     ├── Phase overview                                                       │
│     ├── File structure                                                       │
│     ├── Success metrics                                                      │
│     └── Quick start guide                                                    │
│                                                                              │
│  📖 WEEK_7_DETAILED_PLAN.md       → Main technical guide (1,527 lines)      │
│     ├── Phase 1: Order Backend (Days 1-2)       [7 tasks, 16h]             │
│     ├── Phase 2: Payment Backend (Days 3-4)     [6 tasks, 16h]             │
│     ├── Phase 3: Order Frontend (Days 5-6)      [5 tasks, 16h]             │
│     ├── Phase 4: Payment Frontend (Days 7-8)    [6 tasks, 16h]             │
│     └── Phase 5: Kitchen Display (Bonus)        [2 tasks, 8h] [OPTIONAL]   │
│                                                                              │
│  ✅ WEEK_7_PROGRESS.md            → Track your progress (832 lines)         │
│     ├── Task checklists (26 tasks)                                          │
│     ├── Time tracking (estimated vs actual)                                 │
│     ├── Daily logs (8 days)                                                 │
│     └── Progress stats                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🗺️ PROJECT ROADMAP                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Day 1-2: ORDER BACKEND ████████████████                                    │
│  ├─ Order Service Layer                                                      │
│  ├─ Order Controller & Routes                                                │
│  ├─ Order Number Generator                                                   │
│  ├─ Tax & Total Calculator                                                   │
│  └─ Testing                                                                  │
│                                                                              │
│  Day 3-4: PAYMENT BACKEND ████████████████                                  │
│  ├─ Payment Service Layer                                                    │
│  ├─ Payment Controller & Routes                                              │
│  ├─ Split Bill Logic                                                         │
│  ├─ [Stripe Integration] (Optional)                                          │
│  └─ Testing                                                                  │
│                                                                              │
│  Day 5-6: ORDER FRONTEND ████████████████                                   │
│  ├─ Redux Store Setup                                                        │
│  ├─ Order Service (API Client)                                               │
│  ├─ Create Order Page (POS Interface)                                        │
│  ├─ Order Management Page                                                    │
│  └─ Order Components                                                         │
│                                                                              │
│  Day 7-8: PAYMENT FRONTEND ████████████████                                 │
│  ├─ Payment Redux Store                                                      │
│  ├─ Payment Service                                                          │
│  ├─ Checkout Page                                                            │
│  ├─ Payment Components                                                       │
│  ├─ Receipt Generator                                                        │
│  └─ Payment Success Flow                                                     │
│                                                                              │
│  Bonus: KITCHEN DISPLAY ░░░░░░░░ (Optional)                                 │
│  ├─ Kitchen Display Page                                                     │
│  └─ Real-time Updates (WebSocket)                                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🎯 FEATURES TO BUILD                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✅ MUST HAVE (Critical)                                                     │
│  ────────────────────────────────────────────────────────────────────────   │
│  ▸ Create orders with multiple items                                         │
│  ▸ Update order status (pending → confirmed → preparing → ready → served)   │
│  ▸ Add/remove items from orders                                              │
│  ▸ Calculate totals accurately (subtotal, tax 8.5%, tip)                    │
│  ▸ Process cash payments with change calculation                             │
│  ▸ Split bill (equal or custom amounts)                                      │
│  ▸ Generate and print receipts                                               │
│  ▸ View order history with filters                                           │
│  ▸ Order management interface (POS)                                          │
│                                                                              │
│  🟦 NICE TO HAVE (Optional)                                                  │
│  ────────────────────────────────────────────────────────────────────────   │
│  ▸ Stripe card payment integration                                           │
│  ▸ Kitchen display system                                                    │
│  ▸ Real-time updates via WebSocket                                           │
│  ▸ Sound alerts for new orders                                               │
│  ▸ Advanced order analytics                                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  📂 FILES TO CREATE (35 files)                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BACKEND (12 files)                                                          │
│  ├── src/services/                                                           │
│  │   ├── orderService.ts           ✅ [Task 1.1]                            │
│  │   ├── paymentService.ts         ✅ [Task 2.1]                            │
│  │   └── stripeService.ts          🟦 [Task 2.2] [OPTIONAL]                │
│  ├── src/controllers/                                                        │
│  │   ├── orderController.ts        ✅ [Task 1.2]                            │
│  │   └── paymentController.ts      ✅ [Task 2.3]                            │
│  ├── src/routes/                                                             │
│  │   ├── orderRoutes.ts            ✅ [Task 1.2]                            │
│  │   └── paymentRoutes.ts          ✅ [Task 2.3]                            │
│  └── src/utils/                                                              │
│      ├── orderNumberGenerator.ts   ✅ [Task 1.3]                            │
│      ├── orderCalculator.ts        ✅ [Task 1.4]                            │
│      ├── billSplitter.ts           ✅ [Task 2.4]                            │
│      └── orderErrors.ts            ✅ [Task 1.6]                            │
│                                                                              │
│  FRONTEND (23 files)                                                         │
│  ├── src/store/slices/                                                       │
│  │   ├── orderSlice.ts             ✅ [Task 3.1]                            │
│  │   └── paymentSlice.ts           ✅ [Task 4.1]                            │
│  ├── src/services/                                                           │
│  │   ├── orderService.ts           ✅ [Task 3.2]                            │
│  │   └── paymentService.ts         ✅ [Task 4.2]                            │
│  ├── src/pages/                                                              │
│  │   ├── orders/                                                             │
│  │   │   ├── CreateOrderPage.tsx   ✅ [Task 3.3]                            │
│  │   │   └── OrderManagementPage.tsx ✅ [Task 3.4]                          │
│  │   ├── checkout/                                                           │
│  │   │   ├── CheckoutPage.tsx      ✅ [Task 4.3]                            │
│  │   │   └── PaymentSuccessPage.tsx ✅ [Task 4.6]                           │
│  │   └── kitchen/                                                            │
│  │       └── KitchenDisplayPage.tsx 🟦 [Task 5.1] [OPTIONAL]               │
│  ├── src/components/                                                         │
│  │   ├── orders/                                                             │
│  │   │   ├── TableSelector.tsx      ✅ [Task 3.3]                           │
│  │   │   ├── MenuItemGrid.tsx       ✅ [Task 3.3]                           │
│  │   │   ├── OrderItemsList.tsx     ✅ [Task 3.3]                           │
│  │   │   ├── OrderSummary.tsx       ✅ [Task 3.3]                           │
│  │   │   ├── OrderActions.tsx       ✅ [Task 3.3]                           │
│  │   │   ├── OrderCard.tsx          ✅ [Task 3.4]                           │
│  │   │   ├── OrderStatusBadge.tsx   ✅ [Task 3.5]                           │
│  │   │   ├── OrderDetailsModal.tsx  ✅ [Task 3.5]                           │
│  │   │   ├── MenuItemCard.tsx       ✅ [Task 3.5]                           │
│  │   │   └── OrderItemRow.tsx       ✅ [Task 3.5]                           │
│  │   └── payment/                                                            │
│  │       ├── TipCalculator.tsx      ✅ [Task 4.4]                           │
│  │       ├── CashPaymentForm.tsx    ✅ [Task 4.4]                           │
│  │       ├── SplitBillForm.tsx      ✅ [Task 4.4]                           │
│  │       ├── PaymentSummary.tsx     ✅ [Task 4.4]                           │
│  │       └── ReceiptView.tsx        ✅ [Task 4.4]                           │
│  └── src/utils/                                                              │
│      └── receiptGenerator.ts        ✅ [Task 4.5]                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🔄 DATA FLOW                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CREATE ORDER FLOW:                                                          │
│  ┌──────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐        │
│  │   User   │─────▸│ Redux   │─────▸│ API Call │─────▸│ Backend  │        │
│  │   (POS)  │      │ Action  │      │ Service  │      │ Service  │        │
│  └──────────┘      └─────────┘      └──────────┘      └──────────┘        │
│       │                                                       │              │
│       │                                                       ▼              │
│       │                                                  ┌──────────┐        │
│       │                                                  │ Database │        │
│       │                                                  │  INSERT  │        │
│       │                                                  └──────────┘        │
│       │                                                       │              │
│       ◀───────────────────────────────────────────────────────┘              │
│       │                                                                      │
│       ▼                                                                      │
│  ┌──────────┐                                                                │
│  │  Show    │                                                                │
│  │  Order   │                                                                │
│  └──────────┘                                                                │
│                                                                              │
│  PAYMENT FLOW:                                                               │
│  ┌──────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐        │
│  │   User   │─────▸│  Redux  │─────▸│ Payment  │─────▸│ Payment  │        │
│  │(Checkout)│      │ Action  │      │ Service  │      │ Backend  │        │
│  └──────────┘      └─────────┘      └──────────┘      └──────────┘        │
│       │                                                       │              │
│       │                                                       ▼              │
│       │                                              ┌──────────────────┐    │
│       │                                              │ Create Payment   │    │
│       │                                              │ Update Order     │    │
│       │                                              │ Status: Paid     │    │
│       │                                              └──────────────────┘    │
│       │                                                       │              │
│       ◀───────────────────────────────────────────────────────┘              │
│       │                                                                      │
│       ▼                                                                      │
│  ┌──────────┐                                                                │
│  │  Show    │                                                                │
│  │ Receipt  │                                                                │
│  └──────────┘                                                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🧮 ORDER CALCULATION FORMULA                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 1: Calculate Subtotal                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ Subtotal = Σ (item.price × item.quantity)                          │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Step 2: Calculate Discount (if any)                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ Discount = Subtotal × (discount_percent / 100)                     │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Step 3: Calculate Tax (on subtotal - discount)                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ Taxable Amount = Subtotal - Discount                               │     │
│  │ Tax = Taxable Amount × 0.085  (8.5% tax rate)                      │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Step 4: Calculate Tip (on original subtotal)                                │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ Tip = Subtotal × (tip_percent / 100)                               │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Step 5: Calculate Total                                                     │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │ Total = Subtotal - Discount + Tax + Tip                            │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  Example:                                                                    │
│  Items:        2 × $25.00 = $50.00                                           │
│                1 × $15.00 = $15.00                                           │
│  ───────────────────────────────────────                                     │
│  Subtotal:               $65.00                                              │
│  Discount (10%):        - $6.50                                              │
│  ───────────────────────────────────────                                     │
│  Taxable:                $58.50                                              │
│  Tax (8.5%):            + $4.97                                              │
│  Tip (18%):             + $11.70   (on $65 subtotal)                         │
│  ───────────────────────────────────────                                     │
│  TOTAL:                  $75.17                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚡ QUICK START                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1️⃣  READ: WEEK_7_README.md (navigation guide)                              │
│                                                                              │
│  2️⃣  SCAN: WEEK_7_SUMMARY.md (big picture)                                  │
│                                                                              │
│  3️⃣  SETUP: Run migrations                                                  │
│      $ cd backend                                                            │
│      $ npm run migrate:latest                                                │
│      $ npm run seed                                                          │
│                                                                              │
│  4️⃣  START: Day 1 - Task 1.1 (Order Service)                                │
│      Open: WEEK_7_DETAILED_PLAN.md → Phase 1 → Task 1.1                     │
│      Create: backend/src/services/orderService.ts                            │
│                                                                              │
│  5️⃣  TRACK: Update WEEK_7_PROGRESS.md after each task                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  📊 SUCCESS METRICS                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🎯 Completion Target: 100% (26/26 tasks)                                    │
│  ⏱️  Time Target: 64 hours (±20% acceptable)                                │
│  🐛 Bug Target: < 5 critical bugs                                            │
│  📝 Code Quality: Zero TypeScript errors                                     │
│  ✅ Testing: All endpoints working                                           │
│  🎨 UI Quality: Professional appearance, mobile responsive                   │
│                                                                              │
│  End-to-End Test:                                                            │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ 1. Create order with 3 items           → ✅                    │         │
│  │ 2. Verify totals calculated correctly  → ✅                    │         │
│  │ 3. Update order status to confirmed    → ✅                    │         │
│  │ 4. Add one more item to order          → ✅                    │         │
│  │ 5. Navigate to checkout page           → ✅                    │         │
│  │ 6. Add 18% tip                         → ✅                    │         │
│  │ 7. Process cash payment ($100)         → ✅                    │         │
│  │ 8. Verify change calculated ($17.54)   → ✅                    │         │
│  │ 9. View receipt with all details       → ✅                    │         │
│  │ 10. Print receipt                      → ✅                    │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  🏆 COMPLETION CHECKLIST                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 1: Order Backend                  [0/7]  ⬜⬜⬜⬜⬜⬜⬜   0%             │
│  Phase 2: Payment Backend                [0/6]  ⬜⬜⬜⬜⬜⬜     0%             │
│  Phase 3: Order Frontend                 [0/5]  ⬜⬜⬜⬜⬜       0%             │
│  Phase 4: Payment Frontend               [0/6]  ⬜⬜⬜⬜⬜⬜     0%             │
│  Phase 5: Kitchen Display (Optional)     [0/2]  ⬜⬜           0%             │
│  ────────────────────────────────────────────────────────────────            │
│  OVERALL PROGRESS                        [0/26] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ 0%           │
│                                                                              │
│  Update this as you complete tasks!                                          │
│  Each ⬜ = ~4% progress                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 LET'S BUILD SOMETHING AMAZING!                         ║
║                                                                              ║
║  "The secret of getting ahead is getting started." - Mark Twain             ║
║                                                                              ║
║  Start with Task 1.1 and work your way through systematically.              ║
║  You've got this! 💪                                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
