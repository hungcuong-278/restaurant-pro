# Week 5: Database Integration & Menu Management 🗄️

## Overview
Week 5 focuses on integrating PostgreSQL database, implementing real database operations, and building a complete Menu Management system to replace mock data with persistent storage.

## 🎯 Main Objectives

### 🗄️ Database Setup & Integration
- **PostgreSQL Setup**: Local database configuration
- **Migration System**: Execute existing Knex.js migrations
- **Connection Pool**: Database connection management
- **Environment Variables**: Production-ready configuration

### 🍽️ Menu Management System
- **Menu Categories**: CRUD operations for food categories
- **Menu Items**: Complete menu item management
- **Image Upload**: Menu item photo handling
- **Real-time Updates**: Live menu changes

### 🔧 Backend API Enhancement
- **Database Controllers**: Replace mock data with real DB queries
- **Validation Layer**: Enhanced data validation
- **Error Handling**: Database-specific error management
- **Authentication Middleware**: JWT token validation

## 📋 Detailed Task Breakdown

### Phase 1: Database Foundation (Days 1-2)

#### 1.1 PostgreSQL Setup
```bash
# Local development database
- Install PostgreSQL 14+
- Create restaurant_db database
- Configure user permissions
- Test connection
```

#### 1.2 Environment Configuration
```env
# Database configuration
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=restaurant_user
DB_PASSWORD=secure_password
```

#### 1.3 Migration Execution
- Run existing migrations (001, 002, 003)
- Verify table creation
- Set up database indexes
- Create seed data

### Phase 2: Menu Management API (Days 3-4)

#### 2.1 Menu Categories API
```typescript
// Routes: /api/menu/categories
GET    /                    # List all categories
POST   /                    # Create new category
PUT    /:id                 # Update category
DELETE /:id                 # Delete category
```

#### 2.2 Menu Items API
```typescript
// Routes: /api/menu/items
GET    /                    # List menu items (with pagination)
GET    /:id                 # Get single item
POST   /                    # Create new item
PUT    /:id                 # Update item
DELETE /:id                 # Delete item
PATCH  /:id/availability    # Toggle availability
```

#### 2.3 Database Services
```typescript
// services/menuService.ts
- getMenuCategories()
- createMenuCategory()
- updateMenuCategory()
- deleteMenuCategory()
- getMenuItems()
- createMenuItem()
- updateMenuItem()
- deleteMenuItem()
- toggleItemAvailability()
```

### Phase 3: Frontend Integration (Days 5-6)

#### 3.1 API Service Enhancement
```typescript
// services/menuService.ts
- fetchCategories()
- createCategory()
- updateCategory()
- deleteCategory()
- fetchMenuItems()
- createMenuItem()
- updateMenuItem()
- deleteMenuItem()
```

#### 3.2 Redux State Management
```typescript
// store/slices/menuSlice.ts
- categories: MenuCategory[]
- menuItems: MenuItem[]
- currentCategory: string | null
- loading states
- error handling
```

#### 3.3 UI Components
```typescript
// components/menu/
- MenuCategoryList.tsx
- MenuCategoryForm.tsx
- MenuItemList.tsx
- MenuItemForm.tsx
- MenuItemCard.tsx
```

### Phase 4: Image Upload System (Day 7)

#### 4.1 Backend Upload Handler
```typescript
// middleware/upload.ts
- Multer configuration
- File type validation
- Size limits
- Storage path setup
```

#### 4.2 Frontend Upload Component
```typescript
// components/ImageUpload.tsx
- Drag & drop interface
- Preview functionality
- Progress indicator
- Error handling
```

## 🛠️ Technical Implementation

### Database Schema (Already Created)
```sql
-- menu_categories
id, restaurant_id, name, slug, description, sort_order, is_active

-- menu_items  
id, restaurant_id, category_id, name, description, price, cost,
image_url, allergens, dietary_info, preparation_time, 
is_available, is_featured
```

### API Endpoints Structure
```
/api/v1/
├── menu/
│   ├── categories/
│   │   ├── GET    /           # List categories
│   │   ├── POST   /           # Create category
│   │   ├── PUT    /:id        # Update category
│   │   └── DELETE /:id        # Delete category
│   └── items/
│       ├── GET    /           # List items
│       ├── GET    /:id        # Get item
│       ├── POST   /           # Create item
│       ├── PUT    /:id        # Update item
│       ├── DELETE /:id        # Delete item
│       └── PATCH  /:id/toggle # Toggle availability
```

### Data Flow Architecture
```
React Components ─── Redux Actions ─── API Services ─── Backend Routes ─── Database
     │                     │                │                 │              │
     └─── UI Updates ───── State ────── HTTP Calls ────── Controllers ──── Knex.js
```

## 📁 File Structure Additions

### Backend Files
```
backend/src/
├── controllers/
│   ├── menuController.ts      # Menu CRUD operations
│   └── categoryController.ts  # Category management
├── services/
│   ├── menuService.ts         # Business logic
│   └── categoryService.ts     # Category logic
├── routes/
│   └── menuRoutes.ts          # Menu API routes
├── middleware/
│   ├── upload.ts              # File upload handler
│   └── validation.ts          # Enhanced validation
└── types/
    └── menu.ts                # Menu type definitions
```

### Frontend Files
```
frontend/src/
├── components/menu/
│   ├── MenuCategoryList.tsx
│   ├── MenuCategoryForm.tsx
│   ├── MenuItemList.tsx
│   ├── MenuItemForm.tsx
│   └── MenuItemCard.tsx
├── pages/admin/
│   └── MenuManagementPage.tsx
├── store/slices/
│   └── menuSlice.ts
├── services/
│   └── menuService.ts         # Enhanced menu API
└── types/
    └── menu.ts                # Menu type definitions
```

## 🧪 Testing Strategy

### Database Testing
- Connection pool testing
- Migration rollback testing
- Query performance testing
- Data integrity validation

### API Testing
- CRUD operation testing
- Authentication middleware testing
- File upload testing
- Error handling testing

### Frontend Testing
- Component rendering tests
- Redux state management tests
- API integration tests
- User interaction tests

## 📊 Success Metrics

### Technical Goals
- ✅ Database connected and migrations executed
- ✅ All menu CRUD operations working
- ✅ File upload system functional
- ✅ Real-time menu updates working
- ✅ Error handling comprehensive

### User Experience Goals
- ✅ Fast menu loading (< 2 seconds)
- ✅ Smooth CRUD operations
- ✅ Intuitive admin interface
- ✅ Real-time availability updates
- ✅ Mobile-responsive design

## 🚀 Next Week Preview (Week 6)

### Upcoming Features
- **Table Management**: Real-time table status
- **Reservation System**: Complete booking flow
- **Order Processing**: POS system integration
- **Payment Integration**: Stripe/PayPal setup

## 📝 Development Notes

### Prerequisites
- PostgreSQL 14+ installed
- Node.js 18+ and npm
- VS Code with PostgreSQL extension
- Postman for API testing

### Environment Setup
```bash
# Database setup
createdb restaurant_db
psql restaurant_db -c "CREATE USER restaurant_user WITH PASSWORD 'secure_password';"
psql restaurant_db -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;"

# Run migrations
cd backend
npm run migrate
npm run seed
```

### Development Workflow
1. Set up local PostgreSQL database
2. Run backend migrations and seeds
3. Implement database controllers
4. Create API endpoints
5. Build frontend components
6. Integrate Redux state management
7. Test full CRUD workflow
8. Implement image upload
9. Final testing and optimization

---

**Week 5 Goal**: Transform Restaurant Pro from a mock-data application into a fully functional database-driven menu management system! 🎉