# Restaurant Pro - Order Management API - Postman Collection

## 📦 Overview

This Postman collection provides comprehensive testing for the **Order Management & Payment System** (Week 7 Phase 1) of Restaurant Pro.

## 🚀 Quick Start

### 1. Import Collection

1. Open Postman
2. Click "Import" button
3. Select `Restaurant-Pro-Order-API.postman_collection.json`
4. Collection will appear in your sidebar

### 2. Configure Variables

The collection includes pre-configured variables:

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `baseUrl` | `http://localhost:5000/api` | API base URL |
| `restaurantId` | `e4e7bcd3-3b50-47ba-8abc-3597170677bb` | Test restaurant ID |
| `tableId` | `e1250430-deee-48d9-b721-386309092e67` | Test table ID |
| `menuItemId1` | `db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7` | Beef Tenderloin |
| `menuItemId2` | `268b5422-1074-46e3-8b39-0e9058f316bf` | Grilled Salmon |
| `orderId` | *(auto-set)* | Created order ID |
| `orderItemId` | *(auto-set)* | Created order item ID |

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Server should be running on `http://localhost:5000`

### 4. Run Tests

**Option A: Run Entire Collection**
- Click "Run" button next to collection name
- Click "Run Restaurant Pro - Order Management API"
- View results

**Option B: Run Individual Requests**
- Expand folders
- Click on any request
- Click "Send" button

## 📋 Test Scenarios

### Order Management (9 requests)

1. **Create Order** - POST
   - Creates new order with multiple items
   - Tests: Status 201, totals calculation, order number generation
   - Auto-saves `orderId` and `orderItemId` for subsequent tests

2. **Get All Orders** - GET
   - Retrieves orders list with pagination
   - Tests: Status 200, pagination structure
   - Query params: `status`, `page`, `limit`

3. **Get Single Order** - GET
   - Retrieves specific order with full details
   - Tests: Status 200, items array present

4. **Update Order Status** - PATCH
   - Changes order status (pending → confirmed)
   - Tests: Status 200, status updated, timestamp set

5. **Add Item to Order** - POST
   - Adds new item to existing order
   - Tests: Status 201, item count increased

6. **Update Order Item** - PATCH
   - Updates item quantity and instructions
   - Tests: Status 200

7. **Update Order (Discount & Tip)** - PATCH
   - Applies discount and tip to order
   - Tests: Status 200, amounts updated, totals recalculated

8. **Remove Item from Order** - DELETE
   - Removes item from order
   - Tests: Status 200

9. **Cancel Order** - POST
   - Cancels order
   - Tests: Status 200, status=cancelled

### Error Handling Tests (3 requests)

1. **Invalid Table ID**
   - Tests: Status 404, error code NOT_FOUND

2. **Invalid Menu Item ID**
   - Tests: Status 404

3. **Missing Required Fields**
   - Tests: Status 400

## ✅ Automated Tests

Each request includes automated tests using Postman's test scripts:

- **Status Code Validation**: Ensures correct HTTP status
- **Response Structure**: Validates JSON response format
- **Data Integrity**: Checks calculated values (tax, totals)
- **Auto Variable Setting**: Saves IDs for subsequent requests

## 📊 Test Results

After running the collection, you'll see:

- **Total Tests**: 30+ automated assertions
- **Pass/Fail Status**: Green ✅ for passed, Red ❌ for failed
- **Response Time**: Performance metrics
- **Response Data**: Full JSON responses

## 🔄 Test Flow

The requests are designed to run in sequence:

```
1. Create Order
   ↓ (saves orderId, orderItemId)
2. Get All Orders
   ↓
3. Get Single Order
   ↓
4. Update Status → confirmed
   ↓
5. Add Item
   ↓
6. Update Item
   ↓
7. Update Order (discount/tip)
   ↓
8. Remove Item
   ↓
9. Cancel Order
```

## 🛠️ Customization

### Update Variables

1. Click collection name
2. Go to "Variables" tab
3. Update "Current Value" column
4. Click "Save"

### Modify Requests

1. Select any request
2. Update body, headers, or params
3. Click "Save"

## 📝 Sample Request Body

**Create Order:**
```json
{
  "order_type": "dine_in",
  "table_id": "{{tableId}}",
  "customer_notes": "No onions please",
  "kitchen_notes": "Rush order",
  "items": [
    {
      "menu_item_id": "{{menuItemId1}}",
      "quantity": 2,
      "special_instructions": "Extra spicy"
    },
    {
      "menu_item_id": "{{menuItemId2}}",
      "quantity": 1
    }
  ]
}
```

## ✨ Features Tested

- ✅ Order creation with multiple items
- ✅ Order number generation (ORD-YYYYMMDD-XXX)
- ✅ Tax calculation (8.5%)
- ✅ Status transitions
- ✅ Item management (add/update/remove)
- ✅ Discount & tip application
- ✅ Total recalculation
- ✅ Order cancellation
- ✅ Error handling (404, 400, 422)
- ✅ Pagination
- ✅ Filtering

## 🐛 Troubleshooting

**Issue**: Requests fail with "Could not get response"
- **Solution**: Ensure backend server is running on port 5000

**Issue**: Tests fail with "orderId is not defined"
- **Solution**: Run "Create Order" request first to set the variable

**Issue**: 404 Not Found errors
- **Solution**: Check that restaurant_id, table_id, and menu_item_ids exist in database

**Issue**: Database errors
- **Solution**: Run migrations: `npm run migrate`

## 📈 Success Criteria

All tests pass when:
- ✅ Backend server running
- ✅ Database migrated
- ✅ Menu items available (`is_available = true`)
- ✅ Test restaurant and table exist
- ✅ All 9 order management requests succeed
- ✅ All 3 error handling tests return expected errors

## 🎯 Next Steps

After Phase 1 testing complete:
- Move to Phase 2: Payment Backend
- Add payment endpoints to collection
- Test payment processing flows
- Add integration tests

## 📞 Support

For issues or questions:
- Check backend logs: `npm run dev` output
- Review WEEK_7_DETAILED_PLAN.md
- See WEEK_7_PHASE_1_PROGRESS.md for current status

---

**Week 7 - Phase 1** ✅  
**Status**: Backend Testing Complete  
**Next**: Phase 2 - Payment Backend
