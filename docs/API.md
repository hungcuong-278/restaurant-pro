# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "staff" // admin, manager, staff, customer
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Menu Endpoints

### GET /menu
Get all menu items with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `available` (boolean): Filter by availability

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Grilled Chicken",
        "description": "Delicious grilled chicken with herbs",
        "price": 15.99,
        "category": "Main Course",
        "image": "uploads/chicken.jpg",
        "available": true,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST /menu
Create a new menu item. (Admin/Manager only)

**Request Body:**
```json
{
  "name": "New Dish",
  "description": "Description of the dish",
  "price": 12.99,
  "category": "Appetizer",
  "available": true
}
```

### PUT /menu/:id
Update a menu item. (Admin/Manager only)

### DELETE /menu/:id
Delete a menu item. (Admin/Manager only)

## Table Management

### GET /tables
Get all tables with their current status.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "number": "T001",
      "capacity": 4,
      "status": "available", // available, occupied, reserved, maintenance
      "location": "Main Hall",
      "currentReservation": null
    }
  ]
}
```

### POST /tables
Create a new table. (Admin/Manager only)

### PUT /tables/:id/status
Update table status.

**Request Body:**
```json
{
  "status": "occupied"
}
```

## Reservations

### GET /reservations
Get reservations with filters.

**Query Parameters:**
- `date` (string): Filter by date (YYYY-MM-DD)
- `status` (string): pending, confirmed, completed, cancelled
- `customer` (string): Customer name or email

### POST /reservations
Create a new reservation.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "partySize": 4,
  "reservationDate": "2025-01-15",
  "reservationTime": "19:00",
  "specialRequests": "Window seat preferred"
}
```

### PUT /reservations/:id/status
Update reservation status.

**Request Body:**
```json
{
  "status": "confirmed",
  "tableId": 1
}
```

## Orders (POS System)

### GET /orders
Get orders with filters.

**Query Parameters:**
- `tableId` (number): Filter by table
- `status` (string): pending, preparing, ready, completed, cancelled
- `date` (string): Filter by date

### POST /orders
Create a new order.

**Request Body:**
```json
{
  "tableId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "specialInstructions": "No onions"
    },
    {
      "menuItemId": 3,
      "quantity": 1
    }
  ],
  "customerNotes": "Birthday celebration"
}
```

### PUT /orders/:id/status
Update order status.

### POST /orders/:id/payment
Process payment for an order.

**Request Body:**
```json
{
  "paymentMethod": "card", // card, cash, online
  "amount": 45.99,
  "tip": 9.00,
  "stripePaymentIntentId": "pi_xxxxxxxxxxxx" // for card payments
}
```

## Analytics

### GET /analytics/revenue
Get revenue analytics.

**Query Parameters:**
- `period` (string): daily, weekly, monthly, yearly
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15420.50,
    "periodRevenue": [
      {
        "date": "2025-01-01",
        "revenue": 1250.00,
        "orders": 45
      }
    ],
    "averageOrderValue": 34.27,
    "totalOrders": 450
  }
}
```

### GET /analytics/popular-items
Get most popular menu items.

### GET /analytics/table-utilization
Get table utilization statistics.

## Staff Management

### GET /staff
Get all staff members. (Admin/Manager only)

### POST /staff
Create new staff member. (Admin only)

### GET /staff/:id/schedule
Get staff schedule.

### POST /staff/:id/schedule
Create/update staff schedule.

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API is rate limited to 100 requests per 15 minutes per IP address.

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset time