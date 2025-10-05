# 🎯 Week 8 Master Plan - Demo Preparation
**Period**: October 6-14, 2025 (7 working days)  
**Demo Date**: Tuesday, October 14, 2025  
**Goal**: Impressive demo for university professor

---

## 📊 Feasibility Analysis

### Time Available
- **Total Days**: 7 days (Oct 6-12, working days + weekend)
- **Working Hours**: ~56 hours (8 hours/day)
- **Buffer**: 2 days for testing & polish (Oct 13-14)

### Features Requested

| Feature | Priority | Estimated Time | Feasibility | Status |
|---------|----------|----------------|-------------|--------|
| 🔐 User Authentication System | 🔴 CRITICAL | 16 hours (2 days) | ✅ YES | Must Have |
| ⚠️ Fix Reservation System | 🔴 CRITICAL | 8 hours (1 day) | ✅ YES | Must Have |
| 🍽️ Menu Management UI | 🟡 HIGH | 12 hours (1.5 days) | ✅ YES | Should Have |
| 📊 Analytics Dashboard | 🟡 HIGH | 12 hours (1.5 days) | ✅ YES | Should Have |
| 🏪 About Restaurant Page | 🟢 MEDIUM | 8 hours (1 day) | ✅ YES | Nice to Have |

**Total Estimated**: 56 hours = Exactly 7 days! ✅ **FEASIBLE!**

---

## 🎯 Priority Ranking (MUST → SHOULD → NICE)

### 🔴 CRITICAL (Must Complete Before Demo)
**Days 1-3: Oct 6-8**

1. **User Authentication System** (Day 1-2: 16 hours)
   - Register, Login, Logout
   - JWT tokens
   - Protected routes
   - User roles (Admin, Manager, Staff)
   - **Why Critical**: Professor will want to see security

2. **Fix Reservation System** (Day 3: 8 hours)
   - Already planned in detail
   - **Why Critical**: Core restaurant feature, currently broken

---

### 🟡 HIGH PRIORITY (Should Complete)
**Days 4-5: Oct 9-10**

3. **Menu Management UI** (Day 4: 12 hours)
   - Add/Edit/Delete menu items via UI
   - Image upload
   - Category management
   - No more editing code!
   - **Why High**: Shows admin capabilities

4. **Analytics Dashboard** (Day 5: 12 hours)
   - Revenue charts (daily/weekly/monthly)
   - Popular items
   - Order statistics
   - Real-time metrics
   - **Why High**: Impressive visual feature for demo

---

### 🟢 MEDIUM PRIORITY (Nice to Have)
**Days 6-7: Oct 11-12**

5. **About Restaurant Page** (Day 6: 8 hours)
   - Restaurant story
   - 6 signature dishes with images
   - Gallery
   - Contact info
   - **Why Medium**: Marketing page, nice for demo but not core

6. **Polish & Testing** (Day 7: 8 hours)
   - Bug fixes
   - UI improvements
   - Performance optimization
   - Demo preparation

---

## 📅 Detailed Daily Schedule

---

## **DAY 1: Monday, Oct 6** 🔐
**Theme**: User Authentication Backend  
**Goal**: Complete backend authentication system

### Hour 1-2: Database & Models (9:00-11:00 AM)
```sql
-- Migration: 006_create_users_auth.ts
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'staff', -- admin, manager, staff
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Tasks**:
- [ ] Create migration file
- [ ] Run migration
- [ ] Seed admin user
- [ ] Test database

### Hour 3-4: Auth Service & Controllers (11:00 AM-1:00 PM)
```typescript
// backend/src/services/authService.ts
- hashPassword(password)
- comparePassword(password, hash)
- generateToken(user)
- verifyToken(token)
- createUser(userData)
- loginUser(email, password)
```

**Deliverables**:
- [ ] authService.ts complete
- [ ] authController.ts complete
- [ ] JWT implementation

### 🍽️ Lunch Break (1:00-2:00 PM)

### Hour 5-6: Auth Routes & Middleware (2:00-4:00 PM)
```typescript
// Routes:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh

// Middleware:
- authenticateToken
- authorizeRole(['admin', 'manager'])
```

**Deliverables**:
- [ ] Auth routes working
- [ ] Middleware protecting routes
- [ ] Test with Postman

### Hour 7-8: Testing & Documentation (4:00-6:00 PM)
- [ ] Test register flow
- [ ] Test login flow
- [ ] Test token refresh
- [ ] Test protected routes
- [ ] Document API endpoints
- [ ] **Day 1 Summary**: Write summary report

---

## **DAY 2: Tuesday, Oct 7** 🎨
**Theme**: User Authentication Frontend  
**Goal**: Complete login/register UI

### Hour 1-2: Login & Register Pages (9:00-11:00 AM)
```typescript
// frontend/src/pages/auth/LoginPage.tsx
- Email & password form
- Validation
- Error handling
- Redirect after login

// frontend/src/pages/auth/RegisterPage.tsx
- Full registration form
- Password confirmation
- Role selection (admin only)
```

**Deliverables**:
- [ ] LoginPage.tsx complete
- [ ] RegisterPage.tsx complete
- [ ] Form validation

### Hour 3-4: Auth Context & Protected Routes (11:00 AM-1:00 PM)
```typescript
// frontend/src/contexts/AuthContext.tsx
- useAuth hook
- login(email, password)
- logout()
- register(userData)
- getCurrentUser()

// Protected route wrapper
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

**Deliverables**:
- [ ] AuthContext complete
- [ ] Protected routes working
- [ ] Automatic redirects

### 🍽️ Lunch Break (1:00-2:00 PM)

### Hour 5-6: User Profile & Management (2:00-4:00 PM)
```typescript
// frontend/src/pages/ProfilePage.tsx
- View profile
- Edit profile
- Change password

// frontend/src/pages/admin/UserManagementPage.tsx (if time)
- List all users
- Edit user roles
- Deactivate users
```

**Deliverables**:
- [ ] ProfilePage complete
- [ ] User can update info
- [ ] Password change works

### Hour 7-8: Integration & Testing (4:00-6:00 PM)
- [ ] Test full register → login flow
- [ ] Test protected routes
- [ ] Test logout
- [ ] Fix bugs
- [ ] **Day 2 Summary**: Write summary report

---

## **DAY 3: Wednesday, Oct 8** 📅
**Theme**: Fix Reservation System  
**Goal**: Reservation fully functional

### Following the detailed plan from WEEK_8_DETAILED_PLAN.md
(Already created, just execute it)

**Key Tasks**:
- [ ] Fix backend API endpoints
- [ ] Fix frontend service layer
- [ ] Create TableSelectionPage
- [ ] Create NewReservationPage
- [ ] Create ReservationDetailsPage
- [ ] End-to-end testing
- [ ] **Day 3 Summary**: Write summary report

---

## **DAY 4: Thursday, Oct 9** 🍽️
**Theme**: Menu Management System  
**Goal**: Add/Edit menu items via UI (no code editing!)

### Hour 1-2: Menu Management Backend (9:00-11:00 AM)
```typescript
// Already have basic endpoints, add:
POST   /api/admin/menu/items (with image upload)
PUT    /api/admin/menu/items/:id
DELETE /api/admin/menu/items/:id
POST   /api/admin/menu/categories

// Add image upload with multer
- Save to /uploads/menu/
- Return image URL
```

**Deliverables**:
- [ ] Image upload working
- [ ] CRUD endpoints protected (admin only)

### Hour 3-4: Menu Management UI - List & Form (11:00 AM-1:00 PM)
```typescript
// frontend/src/pages/admin/MenuManagementPage.tsx
- List all menu items (with images)
- Search & filter
- Edit button → modal
- Delete with confirmation
- Add new item button

// frontend/src/components/admin/MenuItemForm.tsx
- Form with all fields
- Image upload preview
- Category dropdown
- Price in VND
- Save/Cancel buttons
```

**Deliverables**:
- [ ] Menu list displays
- [ ] Can click edit
- [ ] Form opens in modal

### 🍽️ Lunch Break (1:00-2:00 PM)

### Hour 5-6: Image Upload & Category Management (2:00-4:00 PM)
```typescript
// Image upload component
- Drag & drop
- Preview before upload
- Size validation
- Format validation (jpg, png)

// Category management
- Add new category
- Edit category name
- Delete category (with warning if has items)
```

**Deliverables**:
- [ ] Image upload works smoothly
- [ ] Can create categories
- [ ] Can assign items to categories

### Hour 7-8: Testing & Polish (4:00-6:00 PM)
- [ ] Test add new item
- [ ] Test edit existing item
- [ ] Test delete item
- [ ] Test image upload
- [ ] Test category management
- [ ] UI polish
- [ ] **Day 4 Summary**: Write summary report

---

## **DAY 5: Friday, Oct 10** 📊
**Theme**: Analytics Dashboard  
**Goal**: Impressive charts and statistics

### Hour 1-2: Analytics Backend (9:00-11:00 AM)
```typescript
// backend/src/services/analyticsService.ts

// Revenue analytics
GET /api/analytics/revenue/daily?start_date&end_date
GET /api/analytics/revenue/summary

// Order analytics
GET /api/analytics/orders/stats
GET /api/analytics/orders/by-status

// Menu analytics
GET /api/analytics/menu/popular-items?limit=10
GET /api/analytics/menu/low-stock

// Customer analytics (if time)
GET /api/analytics/customers/new
GET /api/analytics/customers/returning
```

**Deliverables**:
- [ ] Revenue calculations working
- [ ] Order stats accurate
- [ ] Popular items query optimized

### Hour 3-4: Dashboard UI - Charts Setup (11:00 AM-1:00 PM)
```bash
# Install chart library
npm install recharts
```

```typescript
// frontend/src/pages/admin/DashboardPage.tsx
- Overview cards (total revenue, orders, customers)
- Revenue line chart (last 30 days)
- Orders pie chart (by status)
- Popular items bar chart
- Recent orders table
```

**Deliverables**:
- [ ] Dashboard layout created
- [ ] Chart library integrated
- [ ] API calls working

### 🍽️ Lunch Break (1:00-2:00 PM)

### Hour 5-6: Charts Implementation (2:00-4:00 PM)
```typescript
// Revenue Chart
<LineChart data={revenueData}>
  <Line dataKey="revenue" stroke="#10b981" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
</LineChart>

// Orders by Status
<PieChart>
  <Pie data={ordersByStatus} dataKey="value" />
</PieChart>

// Popular Items
<BarChart data={popularItems}>
  <Bar dataKey="order_count" fill="#3b82f6" />
</BarChart>
```

**Deliverables**:
- [ ] All charts rendering
- [ ] Data displays correctly
- [ ] Charts responsive

### Hour 7-8: Dashboard Polish & Features (4:00-6:00 PM)
- [ ] Date range selector
- [ ] Export to CSV button (bonus)
- [ ] Real-time updates
- [ ] Loading states
- [ ] Error handling
- [ ] **Day 5 Summary**: Write summary report

---

## **DAY 6: Saturday, Oct 11** 🏪
**Theme**: About Restaurant Page  
**Goal**: Beautiful marketing page

### Hour 1-3: Content & Structure (9:00 AM-12:00 PM)
```typescript
// frontend/src/pages/AboutPage.tsx

Sections:
1. Hero Section
   - Restaurant name
   - Tagline: "Experience Authentic European Cuisine"
   - Hero image

2. Our Story
   - Restaurant history (write compelling story)
   - Chef introduction
   - Mission & values

3. Signature Dishes (6 items)
   - Beef Tenderloin
   - Grilled Salmon
   - Duck Confit
   - Truffle Risotto
   - Chocolate Lava Cake
   - Tiramisu
   (Each with image, description, price)

4. Gallery
   - Restaurant interior photos
   - Dish photos
   - Dining experience photos

5. Contact & Location
   - Address
   - Phone
   - Email
   - Opening hours
   - Google Maps embed
```

**Tasks**:
- [ ] Write restaurant story (compelling narrative)
- [ ] Create page structure
- [ ] Design layout

### 🍽️ Lunch Break (12:00-1:00 PM)

### Hour 4-6: Images & Styling (1:00-4:00 PM)
```typescript
// Image sources (free stock photos)
- Unsplash.com (food photography)
- Pexels.com (restaurant interior)

// Styling
- Elegant typography
- Color scheme: Gold (#D4AF37) + Dark (#1F2937)
- Smooth animations
- Parallax scrolling effects
```

**Tasks**:
- [ ] Add 6 signature dish images
- [ ] Add gallery images (8-10 photos)
- [ ] Add hero image
- [ ] Style page beautifully

### Hour 7-8: Interactive Features (4:00-6:00 PM)
```typescript
// Features:
- Image lightbox for gallery
- Smooth scroll to sections
- Reservation CTA buttons
- Social media links
- Newsletter signup form (optional)
```

**Tasks**:
- [ ] Gallery lightbox works
- [ ] All CTAs functional
- [ ] Mobile responsive
- [ ] **Day 6 Summary**: Write summary report

---

## **DAY 7: Sunday, Oct 12** 🎨
**Theme**: Polish, Testing & Demo Prep  
**Goal**: Everything perfect for demo

### Hour 1-2: Bug Fixing (9:00-11:00 AM)
- [ ] Go through ALL pages
- [ ] Fix any errors in console
- [ ] Fix any visual glitches
- [ ] Test all user flows

### Hour 3-4: UI/UX Polish (11:00 AM-1:00 PM)
- [ ] Consistent styling across pages
- [ ] Loading states everywhere
- [ ] Error messages user-friendly
- [ ] Success animations
- [ ] Hover effects
- [ ] Transitions smooth

### 🍽️ Lunch Break (1:00-2:00 PM)

### Hour 5-6: Performance & Mobile (2:00-4:00 PM)
- [ ] Optimize images
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Mobile responsiveness check
- [ ] Test on different screen sizes

### Hour 7-8: Demo Preparation (4:00-6:00 PM)
```markdown
# Demo Script Preparation

1. Introduction (1 min)
   - Restaurant Pro overview
   - Key features

2. User Authentication (2 min)
   - Register new user
   - Login as admin
   - Show role-based access

3. Menu Management (2 min)
   - Add new dish via UI
   - Upload image
   - Edit existing item

4. Order System (2 min)
   - Create order
   - Process payment
   - Show VND currency

5. Reservation System (2 min)
   - Make reservation
   - View reservations
   - Update status

6. Analytics Dashboard (2 min)
   - Show revenue charts
   - Popular items
   - Statistics

7. About Page (1 min)
   - Restaurant story
   - Signature dishes

Total: 12 minutes (keep under 15 min)
```

**Tasks**:
- [ ] Create demo account
- [ ] Prepare demo data
- [ ] Write demo script
- [ ] Practice demo flow
- [ ] **Day 7 Summary**: Write summary report

---

## **DAY 8-9: Monday-Tuesday, Oct 13-14** 🎯
**Final Polish & Demo Day**

### Monday Oct 13: Final Testing
- [ ] Full system test
- [ ] Fix critical bugs only
- [ ] Prepare presentation slides (optional)
- [ ] Test on professor's expected setup

### Tuesday Oct 14: DEMO DAY! 🎉
- [ ] Final sanity check
- [ ] Start servers early
- [ ] Have backup plan ready
- [ ] Present with confidence!

---

## 📊 Success Criteria for Demo

### Must Have ✅ (All working perfectly)
- [x] User register & login
- [x] Role-based access (admin/staff)
- [x] Create orders with VND prices
- [x] Process payments
- [x] Make reservations
- [x] Add menu items via UI (no code!)
- [x] Analytics dashboard with charts

### Should Have 🌟 (Impressive features)
- [x] Beautiful About page
- [x] Image uploads
- [x] Real-time statistics
- [x] Mobile responsive
- [x] Smooth animations

### Nice to Have 💎 (Bonus points)
- [ ] Email notifications
- [ ] Export reports
- [ ] Dark mode
- [ ] Multiple language support

---

## 🎯 Daily Summary Template

Each evening, create:
```markdown
# Day X Summary - [Date]

## Completed ✅
- Task 1 with details
- Task 2 with details

## In Progress 🔄
- Task still working on

## Blocked ⚠️
- Issues encountered

## Tomorrow's Focus 📋
- Priority 1
- Priority 2

## Time Tracking ⏱️
- Planned: 8 hours
- Actual: X hours
- Efficiency: X%

## Notes 📝
- Lessons learned
- Things to remember
```

Save as: `docs/reports/week-8/DAY_X_SUMMARY.md`

---

## 📚 Resources & Dependencies

### New NPM Packages Needed
```bash
# Backend
npm install multer          # File upload
npm install jsonwebtoken    # JWT auth
npm install bcrypt          # Password hashing

# Frontend
npm install recharts        # Charts
npm install react-dropzone # Image upload
npm install axios           # Already have
npm install react-hook-form # Form handling
```

### Documentation to Reference
- JWT Authentication: jwt.io
- Recharts: recharts.org
- React Dropzone: react-dropzone.js.org

---

## ⚠️ Risk Management

### High Risk
1. **Authentication Security**
   - Risk: Security vulnerabilities
   - Mitigation: Use bcrypt, JWT best practices
   - Backup: Have reference implementation ready

2. **Time Overrun**
   - Risk: Features take longer than estimated
   - Mitigation: Start with MUST HAVE features
   - Backup: Cut NICE TO HAVE features if needed

### Medium Risk
3. **Image Upload Issues**
   - Risk: File upload complications
   - Mitigation: Use proven library (multer)
   - Backup: Use external image URLs first

4. **Chart Rendering**
   - Risk: Chart library learning curve
   - Mitigation: Use simple charts first
   - Backup: Show tables instead of charts

---

## 🎓 Demo Tips

### Before Demo
1. ✅ Test everything 3 times
2. ✅ Have demo data ready
3. ✅ Clear browser cache
4. ✅ Close unnecessary apps
5. ✅ Full screen mode
6. ✅ Hide bookmarks bar

### During Demo
1. 🎤 Speak clearly and confidently
2. ⏱️ Keep track of time (15 min max)
3. 🎯 Focus on impressive features
4. 💬 Explain business value, not just tech
5. 😊 Smile and make eye contact

### If Things Go Wrong
1. 🆘 Have backup screenshots/video
2. 🔄 Restart server quickly
3. 🎭 Stay calm and professional
4. 💡 Explain what WOULD happen
5. ✨ Show alternative features

---

## 📈 Expected Outcomes

### By Oct 14, Professor Will See:
1. ✅ **Professional Restaurant Management System**
2. ✅ **Secure User Authentication** (Register/Login)
3. ✅ **Complete Order Flow** with VND currency
4. ✅ **Reservation System** fully functional
5. ✅ **Admin Panel** to manage menu (no code editing!)
6. ✅ **Analytics Dashboard** with beautiful charts
7. ✅ **Beautiful About Page** with branding
8. ✅ **Mobile Responsive** design
9. ✅ **Production-Ready** code quality

### Impressive Talking Points:
- "Built in 2 weeks from scratch"
- "Real-world business solution"
- "Modern tech stack (React, TypeScript, Node.js)"
- "Security best practices implemented"
- "Scalable architecture"
- "Ready for production deployment"

---

## 🎯 Priority Summary

### If Time is Short, Focus on:
1. 🔴 **Day 1-2**: User Auth (CRITICAL for demo)
2. 🔴 **Day 3**: Fix Reservations (CRITICAL, broken)
3. 🟡 **Day 4**: Menu Management (HIGH, impressive)
4. 🟡 **Day 5**: Analytics (HIGH, very impressive)
5. 🟢 **Day 6**: About Page (MEDIUM, nice to have)
6. 🟢 **Day 7**: Polish (MEDIUM, but important)

### Minimum Viable Demo (if behind schedule):
- User Auth ✅
- Order System ✅ (already works)
- Payment ✅ (already works)
- Reservations ✅
- Basic Analytics (even just numbers, no charts)

---

## 📞 Quick Commands

### Daily Startup
```bash
# Pull latest
git pull origin main

# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm start

# Database migration (if needed)
cd backend && npm run knex migrate:latest
```

### Daily Wrap-up
```bash
# Commit work
git add .
git commit -m "feat: Day X - [Feature completed]"
git push origin main

# Write daily summary
# Create: docs/reports/week-8/DAY_X_SUMMARY.md
```

---

## 🎉 Motivation

**7 days to impress your professor! 💪**

Each day brings you closer to an amazing demo. Stay focused, follow the plan, and you'll build something impressive!

**You've already built**:
- ✅ Complete menu system
- ✅ Order management
- ✅ Payment processing
- ✅ Beautiful UI

**This week you'll add**:
- 🔐 User authentication
- 🍽️ Menu management UI
- 📊 Analytics dashboard
- 🏪 About page
- ⚠️ Fixed reservations

**Result**: Production-ready restaurant management system! 🚀

---

**Plan Status**: 📋 Ready to Execute  
**Start Date**: Monday, October 6, 2025  
**Demo Date**: Tuesday, October 14, 2025  
**Confidence Level**: HIGH (95%) 💪

**Let's build something amazing! 🚀**

---

*Master Plan Created: October 6, 2025*  
*Last Updated: October 6, 2025*  
*Next Review: October 14, 2025 (Post-Demo)*
