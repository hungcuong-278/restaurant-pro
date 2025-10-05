# User Order Access Control - Implementation Plan

**Date**: October 5, 2025  
**Status**: 🎯 Planning  
**Priority**: High  
**Type**: Security Enhancement

---

## 🎯 Requirements

### Current State (Problems)
❌ **All orders visible to everyone** - No authentication required  
❌ **No user association** - Orders not linked to specific users  
❌ **Security risk** - Anyone can view/modify any order  
❌ **No privacy** - Users see other customers' orders  

### Target State (Goals)
✅ **User Authentication Required** - Must login to view orders  
✅ **User-Specific Orders** - Users only see their own orders  
✅ **Role-Based Access** - Staff/Admin see all orders  
✅ **Public Menu** - Website menu visible without login (future)  

---

## 📊 Database Analysis

### ✅ Database Already Has User Support!

**orders table** (migration 003):
```sql
customer_id UUID → references users.id
staff_id UUID → references users.id
```

**users table** (migration 001):
```sql
id UUID PRIMARY KEY
email VARCHAR UNIQUE
role ENUM('customer', 'staff', 'admin')
```

**Current Seed Data**: Has users with roles ✅

---

## 🏗️ Architecture Design

### Access Control Matrix

| User Role | View Orders | Create Order | Update Status | Delete Order |
|-----------|-------------|--------------|---------------|--------------|
| **Guest** | ❌ None | ❌ No | ❌ No | ❌ No |
| **Customer** | ✅ Own only | ✅ Yes (as customer) | ❌ No | ❌ Own unpaid |
| **Staff** | ✅ All | ✅ Yes (for customers) | ✅ Yes | ✅ Yes |
| **Admin** | ✅ All | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 📝 Implementation Tasks

### Phase 1: Backend Authentication (High Priority)

#### Task 1.1: Create Authentication Middleware ⏳
**File**: `backend/src/middleware/auth.ts` (new)

**Functions Needed**:
- `authenticate()` - Verify JWT token
- `requireAuth()` - Require authentication
- `requireRole(roles)` - Require specific roles
- `attachUser()` - Attach user to request

**Dependencies**:
- JWT library (jsonwebtoken)
- Passport.js (optional)

#### Task 1.2: Update Order Controller ⏳
**File**: `backend/src/controllers/orderController.ts`

**Changes**:
```typescript
// GET /orders - Filter by user role
getAllOrders(req: Request, res: Response) {
  const user = req.user; // From auth middleware
  
  if (user.role === 'customer') {
    // Filter: WHERE customer_id = user.id
    orders = await orderService.getOrdersByCustomer(user.id);
  } else {
    // Staff/Admin: Get all orders
    orders = await orderService.getAllOrders();
  }
}

// POST /orders - Set customer_id
createOrder(req: Request, res: Response) {
  const user = req.user;
  
  orderData.customer_id = user.role === 'customer' 
    ? user.id  // Customer creates their own order
    : req.body.customer_id; // Staff can create for customers
}
```

#### Task 1.3: Update Order Service ⏳
**File**: `backend/src/services/orderService.ts`

**New Methods**:
- `getOrdersByCustomer(customerId)` - Filter by customer
- `canUserAccessOrder(userId, orderId)` - Check permissions
- `canUserUpdateOrder(userId, orderId)` - Check update permissions

#### Task 1.4: Update Routes with Auth Middleware ⏳
**File**: `backend/src/routes/orderRoutes.ts`

**Changes**:
```typescript
import { authenticate, requireAuth, requireRole } from '../middleware/auth';

// All order routes require authentication
router.use(authenticate, requireAuth);

// View orders - Any authenticated user
router.get('/orders', getAllOrders);

// Create order - Customer or Staff
router.post('/orders', createOrder);

// Update status - Staff/Admin only
router.patch('/orders/:id/status', 
  requireRole(['staff', 'admin']), 
  updateOrderStatus
);

// Delete order - Admin only
router.delete('/orders/:id', 
  requireRole(['admin']), 
  deleteOrder
);
```

---

### Phase 2: Frontend Authentication (High Priority)

#### Task 2.1: Add Auth Context ⏳
**File**: `frontend/src/contexts/AuthContext.tsx` (new)

**Features**:
- Store current user info (id, email, role)
- Login/Logout functions
- Check if authenticated
- Check user role

#### Task 2.2: Create Login Page ⏳
**File**: `frontend/src/pages/auth/LoginPage.tsx` (new)

**Features**:
- Email/Password form
- Login with JWT
- Remember me option
- Redirect after login

#### Task 2.3: Add Protected Routes ⏳
**File**: `frontend/src/App.tsx`

**Changes**:
```typescript
import ProtectedRoute from './components/ProtectedRoute';

<Routes>
  {/* Public routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/menu" element={<PublicMenuPage />} /> {/* Future */}
  
  {/* Protected routes - Require login */}
  <Route element={<ProtectedRoute />}>
    <Route path="/orders" element={<OrderListPage />} />
    <Route path="/orders/new" element={<NewOrderPage />} />
    <Route path="/orders/:id" element={<OrderDetailsPage />} />
  </Route>
  
  {/* Staff/Admin only */}
  <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
    <Route path="/kitchen" element={<KitchenViewPage />} />
  </Route>
</Routes>
```

#### Task 2.4: Update Order Service ⏳
**File**: `frontend/src/services/orderService.ts`

**Changes**:
- Add JWT token to API requests
- Handle 401 Unauthorized errors
- Redirect to login if not authenticated

#### Task 2.5: Update Order Pages ⏳
**Files**: OrderListPage, NewOrderPage, OrderDetailsPage

**Changes**:
- Show user info in header
- Display "My Orders" for customers
- Display "All Orders" for staff
- Hide admin actions for customers

---

### Phase 3: User Experience Enhancements (Medium Priority)

#### Task 3.1: Add User Profile Menu ⏳
**Component**: `frontend/src/components/UserMenu.tsx` (new)

**Features**:
- Show user name/email
- My Orders link
- My Profile link
- Logout button

#### Task 3.2: Add Order History Filter ⏳
**Page**: `frontend/src/pages/orders/OrderHistoryPage.tsx` (new)

**Features**:
- Show customer's past orders
- Filter by date range
- Search by order number
- Download invoice

#### Task 3.3: Add Order Notifications ⏳
**Feature**: Real-time updates for customer's orders

**Implementation**:
- WebSocket connection
- Push notifications
- Email notifications (already exists)

---

## 🔐 Security Considerations

### Authentication Method
**Option A: JWT with HttpOnly Cookies** ✅ Recommended
- More secure (XSS protection)
- Auto-included in requests
- No localStorage needed

**Option B: JWT in localStorage**
- Simpler implementation
- Vulnerable to XSS
- Manual token management

### Password Security
- ✅ Already implemented: bcrypt hashing
- ✅ Salt rounds: 10
- ✅ Stored in users table

### Session Management
- JWT expiration: 24 hours (configurable)
- Refresh token: Optional (for "Remember Me")
- Auto logout on token expiry

---

## 📊 Database Changes Needed

### ✅ No Schema Changes Required!

**Reason**: Database already has:
- `orders.customer_id` column ✅
- `orders.staff_id` column ✅
- `users.role` enum ✅

**Only Need**: Update seed data to assign customer_id to existing orders

### Update Seed Data ⏳
**File**: `backend/seeds/01_seed_initial_data.ts`

**Changes**:
```typescript
// Get a sample customer user
const customer = await knex('users')
  .where({ role: 'customer' })
  .first();

// Update existing orders to have customer_id
await knex('orders').update({
  customer_id: customer.id
});
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Auth middleware tests
- [ ] Order service permission tests
- [ ] User role validation tests

### Integration Tests
- [ ] Login flow test
- [ ] Order creation with user test
- [ ] Access control tests

### Manual Tests
- [ ] Customer can only see own orders
- [ ] Staff can see all orders
- [ ] Guest redirected to login
- [ ] Unauthorized access blocked

---

## 📈 Implementation Phases

### 🚀 Phase 1: MVP (2-3 hours) - START HERE
**Goal**: Basic authentication working

**Tasks**:
1. ✅ Create auth middleware (30 min)
2. ✅ Update order controller (30 min)
3. ✅ Update order service (30 min)
4. ✅ Create login page (45 min)
5. ✅ Add protected routes (30 min)
6. ✅ Test basic flow (15 min)

**Success Criteria**:
- ✅ Users must login to view orders
- ✅ Customers see only their orders
- ✅ Staff see all orders
- ✅ Unauthorized access blocked

---

### 🎯 Phase 2: Enhanced Security (1-2 hours)
**Goal**: Production-ready security

**Tasks**:
1. Add JWT refresh tokens
2. Add password reset flow
3. Add session timeout
4. Add CSRF protection
5. Add rate limiting for auth endpoints

---

### ✨ Phase 3: UX Polish (1-2 hours)
**Goal**: Better user experience

**Tasks**:
1. User profile page
2. Order history page
3. Real-time notifications
4. "Remember Me" feature
5. Social login (Google, Facebook)

---

## 🎬 Quick Start Guide

### For Customers
1. **Register/Login** → Access orders page
2. **Create Order** → Automatically assigned to you
3. **View Orders** → See only your orders
4. **Track Status** → Real-time updates

### For Staff
1. **Login** → Access all orders
2. **Kitchen View** → Manage all orders
3. **Create Order** → Select customer or guest
4. **Update Status** → Full control

### For Public Users (Future)
1. **View Menu** → No login required
2. **Browse Items** → See photos, prices
3. **Register** → Create account to order
4. **Order** → Login required

---

## 🔄 Migration Path

### Step 1: Database (No Changes Needed) ✅
```bash
# Schema already supports users!
# Just verify:
cd backend
npm run knex migrate:status
```

### Step 2: Backend Auth
```bash
# Install dependencies
cd backend
npm install jsonwebtoken @types/jsonwebtoken

# Create middleware
# Update controllers
# Update routes

# Test
npm test
```

### Step 3: Frontend Auth
```bash
# Install dependencies
cd frontend
npm install jwt-decode

# Create auth context
# Create login page
# Add protected routes

# Test
npm start
```

### Step 4: Test & Deploy
```bash
# Run all tests
npm test

# Test manually
# Deploy to production
```

---

## 📊 Impact Analysis

### Benefits
✅ **Security**: Protect user privacy  
✅ **Compliance**: GDPR-ready (users own their data)  
✅ **UX**: Personalized experience  
✅ **Business**: User accounts enable loyalty programs  
✅ **Scalability**: Ready for public website  

### Risks
⚠️ **Breaking Change**: Existing system allows anonymous orders  
⚠️ **Migration**: Need to assign customer_id to existing orders  
⚠️ **Testing**: Need comprehensive security testing  

### Mitigation
✅ **Backward Compat**: Support guest orders (customer_id = NULL) temporarily  
✅ **Migration Script**: Auto-assign test customer to old orders  
✅ **Testing**: Add auth tests before deployment  

---

## 🎯 Success Metrics

### Security Metrics
- [ ] 100% of order endpoints require authentication
- [ ] 0 unauthorized access incidents
- [ ] All passwords hashed with bcrypt

### User Metrics
- [ ] Customers can only access their own orders
- [ ] Staff can access all orders
- [ ] Login time < 2 seconds
- [ ] Session duration configurable

### Technical Metrics
- [ ] JWT implementation secure
- [ ] Auth middleware covers all routes
- [ ] 90%+ test coverage for auth logic

---

## 🚀 Recommended Approach

**Option A: Full Implementation (4-5 hours)** ✅ Recommended
- Complete auth system
- Production-ready security
- All roles working
- Comprehensive testing

**Option B: Quick MVP (2 hours)**
- Basic login only
- Simple role check
- Minimal features
- Quick to market

**Option C: Gradual Rollout (1 week)**
- Phase 1: Backend auth
- Phase 2: Frontend login
- Phase 3: Role-based access
- Phase 4: UX polish

---

## 🤔 Decision Needed

Bạn muốn:

1. **Full Implementation** (4-5h) - Complete, production-ready
2. **Quick MVP** (2h) - Basic auth, fast start
3. **Gradual** (1 week) - One phase at a time

---

*Last Updated: October 5, 2025*
