# MENU SYSTEM DATA FLOW

## 📊 KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE (SQLite)                         │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │menu_categories│◄──┤  menu_items  │◄──┤ order_items  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                    │                    │              │
│         │                    │                    ▼              │
│         │                    │            ┌──────────────┐      │
│         │                    │            │    orders    │      │
│         │                    │            └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │ API (Express + Knex)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                                                                   │
│  /api/menu/items          - GET/POST/PATCH/DELETE               │
│  /api/menu/categories     - GET                                  │
│  /api/orders              - GET/POST                             │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │ axios
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                                                                   │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────┐ │
│  │ MenuManagement    │  │    MenuPage       │  │ NewOrderPage│ │
│  │ (Admin/Chef)      │  │  (Customer View)  │  │  (Ordering) │ │
│  │                   │  │                   │  │             │ │
│  │ • Create Item ────┼──┼──► menuService ───┼──┼─────────────┤ │
│  │ • Update Item     │  │                   │  │             │ │
│  │ • Delete Item     │  │   fetchMenuItems()│  │ getMenuItems│ │
│  │ • Toggle Available│  │                   │  │             │ │
│  └───────────────────┘  └───────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 DATA FLOW KHI ADMIN THÊM MÓN MỚI

### 1️⃣ ADMIN CREATES NEW ITEM

```typescript
// MenuManagementPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Call menuService to create item
  await menuService.createMenuItem(formData);
  
  // 2. Refresh menu list immediately
  loadMenuItems();
  loadCategories();
};
```

### 2️⃣ MENUSERVICE SENDS TO BACKEND

```typescript
// frontend/src/services/menuService.ts
async createMenuItem(itemData: CreateMenuItemData): Promise<MenuItem> {
  const dataWithRestaurant = {
    ...itemData,
    restaurant_id: RESTAURANT_ID  // ✅ Always include restaurant_id
  };
  
  const response = await axios.post(
    `${API_BASE_URL}/menu/items`,
    dataWithRestaurant
  );
  return response.data.data;
}
```

### 3️⃣ BACKEND SAVES TO DATABASE

```typescript
// backend/src/controllers/menuController.ts
export const createMenuItem = async (req: Request, res: Response) => {
  const restaurantId = req.body.restaurant_id || 'default';
  const itemData = {
    ...req.body,
    restaurant_id: restaurantId
  };
  
  // ✅ Auto-generate slug from name
  const item = await menuService.createMenuItem(itemData);
  res.status(201).json({ success: true, data: item });
};
```

```typescript
// backend/src/services/menuService.ts
async createMenuItem(data): Promise<MenuItem> {
  const slug = data.slug || this.generateSlug(data.name); // ✅ Auto slug
  
  const [item] = await db('menu_items')
    .insert({ ...data, slug })
    .returning('*');
  
  return item;
}
```

### 4️⃣ OTHER PAGES GET UPDATES

#### Option A: User navigates to Menu/Order page
```typescript
// MenuPage.tsx / MenuItemGrid.tsx
useEffect(() => {
  dispatch(fetchMenuItems({}));  // Load on mount
}, []);
```

#### Option B: User switches back to tab (ADDED)
```typescript
// Auto-refresh when user comes back
useEffect(() => {
  const handleFocus = () => {
    dispatch(fetchMenuItems({}));  // ✅ Refresh on focus
  };
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);
```

## 📍 LUỒNG DỮ LIỆU CHI TIẾT

### CREATE FLOW
```
Admin fills form
    ↓
MenuManagementPage.handleSubmit()
    ↓
menuService.createMenuItem(formData + restaurant_id)
    ↓
POST /api/menu/items
    ↓
menuController.createMenuItem()
    ↓
menuService.createMenuItem() → Auto-generate slug
    ↓
db('menu_items').insert()
    ↓
[Database] menu_items table
    ↓
Response 201 Created
    ↓
loadMenuItems() - Refresh admin view
    ↓
MenuPage/NewOrderPage will see new item on next load
```

### READ FLOW (Menu Display)
```
User opens MenuPage
    ↓
useEffect() triggers
    ↓
dispatch(fetchMenuItems({}))
    ↓
menuService.getMenuItems({ restaurant_id: 'default' })
    ↓
GET /api/menu/items?restaurant_id=default&limit=100
    ↓
menuController.getMenuItems()
    ↓
menuService.getMenuItems() with JOIN menu_categories
    ↓
db('menu_items').leftJoin('menu_categories')
    ↓
[Database] Returns items with category info
    ↓
Response 200 OK with items array
    ↓
Redux store updated
    ↓
UI renders menu items grouped by category
```

### READ FLOW (Order System)
```
User opens NewOrderPage → Step 2
    ↓
MenuItemGrid component mounts
    ↓
useEffect() triggers
    ↓
fetchMenuItems()
    ↓
menuService.getMenuItems()
    ↓
GET /api/menu/items?restaurant_id=default&limit=100
    ↓
Same backend flow as above
    ↓
Local state updated: setMenuItems(items)
    ↓
User can add items to cart
    ↓
Create order with menu_item_ids
```

## 🔐 RESTAURANT_ID TRACKING

**WHY?** Multi-tenant support - same database, multiple restaurants

```typescript
// Config
export const RESTAURANT_ID = 'default';

// Every API call includes it:
✅ getMenuItems({ restaurant_id: 'default' })
✅ createMenuItem({ ...data, restaurant_id: 'default' })
✅ updateMenuItem(id, { ...data, restaurant_id: 'default' })
✅ deleteMenuItem(id, '?restaurant_id=default')
```

## 🔗 FOREIGN KEY RELATIONSHIPS

```sql
menu_categories
    ├── id (PK)
    └── restaurant_id

menu_items
    ├── id (PK)
    ├── restaurant_id
    ├── category_id (FK → menu_categories.id)  ✅ Linked
    └── slug (generated from name)

order_items
    ├── id (PK)
    ├── order_id (FK → orders.id)
    ├── menu_item_id (FK → menu_items.id)  ✅ Linked
    └── quantity

orders
    ├── id (PK)
    ├── restaurant_id
    └── table_id
```

**IMPORTANT:** 
- ❌ Seed file NO LONGER deletes old menu items
- ✅ Order items maintain references to menu_items
- ✅ When admin adds item → Database → Available everywhere

## 🔄 AUTO-REFRESH MECHANISMS

### 1. Manual Refresh (Always Available)
- Admin: `loadMenuItems()` after create/update/delete
- Menu: "Try Again" button
- Order: "Try Again" button

### 2. On Component Mount
```typescript
useEffect(() => {
  fetchMenuItems();
}, []); // Runs once when component loads
```

### 3. On Window Focus (NEW)
```typescript
useEffect(() => {
  const handleFocus = () => fetchMenuItems();
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);
```
**When it triggers:**
- User switches from Admin tab → Menu tab
- User switches from another app → Browser
- User refreshes the page

## ✅ WHAT'S CONNECTED

1. **Admin adds item** → Saves to `menu_items` table
2. **MenuPage** → Reads from `menu_items` (with category info)
3. **NewOrderPage** → Reads from `menu_items` (for ordering)
4. **Order creation** → Saves `menu_item_id` in `order_items`
5. **Order display** → JOINs `order_items` ← `menu_items` to show names

## 🚨 DATA SAFETY

### Seed File Protection
```typescript
// Check if data exists before seeding
const existingItems = await knex('menu_items')
  .where('restaurant_id', restaurantId)
  .count('* as count')
  .first();

if (existingItems && Number(existingItems.count) > 0) {
  console.log('⏭️  Menu items already exist, skipping seed...');
  return; // ✅ Don't delete existing data
}
```

### Foreign Key Protection
- `menu_items.category_id` → `ON DELETE SET NULL` (item stays, category removed)
- `order_items.menu_item_id` → Should be `ON DELETE RESTRICT` (can't delete menu item if in orders)

## 📊 CURRENT STATE

- ✅ 11 sample menu items in database
- ✅ 4 categories (Appetizers, Main Courses, Desserts, Beverages)
- ✅ 5 existing orders with European menu items
- ✅ Foreign keys properly linked
- ✅ Auto-refresh on window focus
- ✅ Manual refresh after admin actions

## 🎯 TESTING CHECKLIST

1. **Admin adds new item**
   - ✅ Item appears in Admin menu list immediately
   - ✅ Item appears in Menu page (on refresh/focus)
   - ✅ Item appears in Order page (on refresh/focus)

2. **Admin updates item**
   - ✅ Changes reflect in Admin immediately
   - ✅ Changes reflect in Menu page (on refresh/focus)
   - ✅ Changes reflect in Order page (on refresh/focus)

3. **Admin deletes item**
   - ✅ Item removed from Admin list
   - ✅ Item removed from Menu page (on refresh/focus)
   - ✅ Item removed from Order page (on refresh/focus)
   - ⚠️  Old orders keep the `menu_item_id` (shows as deleted in order details)

4. **Admin toggles availability**
   - ✅ Status changes in Admin
   - ✅ Menu page filters `is_available=true`
   - ✅ Order page filters `is_available=true`

## 🔮 FUTURE IMPROVEMENTS

1. **Real-time Updates** - WebSocket for instant propagation
2. **Soft Delete** - Mark items as deleted instead of removing
3. **Version History** - Track menu item changes
4. **Cache Invalidation** - Clear cache when menu changes
5. **Optimistic Updates** - Update UI before server confirms
