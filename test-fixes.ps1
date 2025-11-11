# Quick Test Script - Items, Auth, Menu Fix
# Run this to verify all fixes are working

Write-Host "`n=== TESTING ITEMS CONNECTION & AUTH FIX ===`n" -ForegroundColor Cyan

$restaurantId = '752a7c77-bfc5-4c3e-8a18-c66e6c3208b6'

# Test 1: Backend Health
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "http://localhost:5000/api"
    Write-Host "   ✅ Backend OK - Version: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend Error" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`n2. Testing Login (admin@restaurant.com)..." -ForegroundColor Yellow
try {
    $loginBody = @{email='admin@restaurant.com'; password='admin123'} | ConvertTo-Json
    $loginResult = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
    Write-Host "   ✅ Login Successful - Role: $($loginResult.data.user.role)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Login Failed" -ForegroundColor Red
}

# Test 3: Orders with Items
Write-Host "`n3. Testing Orders with Items..." -ForegroundColor Yellow
try {
    $orders = Invoke-RestMethod "http://localhost:5000/api/restaurants/$restaurantId/orders"
    $totalOrders = $orders.data.Length
    $orderWithItems = $orders.data[0]
    $itemCount = $orderWithItems.items.Length
    
    Write-Host "   ✅ Found $totalOrders orders" -ForegroundColor Green
    Write-Host "   ✅ Order $($orderWithItems.order_number) has $itemCount items:" -ForegroundColor Green
    
    $orderWithItems.items | ForEach-Object {
        Write-Host "      - $($_.item_name) x$($_.quantity)" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Orders Error" -ForegroundColor Red
}

# Test 4: Menu Items
Write-Host "`n4. Testing Menu Items..." -ForegroundColor Yellow
try {
    $menu = Invoke-RestMethod "http://localhost:5000/api/menu/items?restaurant_id=$restaurantId&limit=100"
    $itemCount = $menu.data.items.Length
    Write-Host "   ✅ Found $itemCount menu items" -ForegroundColor Green
    
    # Group by category
    $categories = $menu.data.items | Group-Object category_name
    Write-Host "   📊 Categories:" -ForegroundColor Cyan
    $categories | ForEach-Object {
        Write-Host "      - $($_.Name): $($_.Count) items" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Menu Error" -ForegroundColor Red
}

# Test 5: Tables
Write-Host "`n5. Testing Tables..." -ForegroundColor Yellow
try {
    $tables = Invoke-RestMethod "http://localhost:5000/api/restaurants/$restaurantId/tables"
    Write-Host "   ✅ Found $($tables.data.Length) tables" -ForegroundColor Green
    $tables.data | ForEach-Object {
        Write-Host "      - $($_.number): $($_.location)" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Tables Error" -ForegroundColor Red
}

Write-Host "`n=== ALL TESTS COMPLETE ===`n" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend URL:  http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "`nTest Accounts:" -ForegroundColor Yellow
Write-Host "  Admin: admin@restaurant.com / admin123" -ForegroundColor White
Write-Host "  Chef:  chef@restaurant.com / chef123" -ForegroundColor White
Write-Host ""
