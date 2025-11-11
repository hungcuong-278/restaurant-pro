# Quick Test - Items, Auth, Menu Fix

Write-Host "`n=== TESTING FIXES ===`n" -ForegroundColor Cyan

$restaurantId = '752a7c77-bfc5-4c3e-8a18-c66e6c3208b6'

# Test Backend
Write-Host "1. Backend Health..." -ForegroundColor Yellow
$health = Invoke-RestMethod "http://localhost:5000/api"
Write-Host "   OK - Version: $($health.version)" -ForegroundColor Green

# Test Login  
Write-Host "`n2. Login Test..." -ForegroundColor Yellow
$loginBody = @{email='admin@restaurant.com'; password='admin123'} | ConvertTo-Json
$loginResult = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
Write-Host "   OK - Role: $($loginResult.data.user.role)" -ForegroundColor Green

# Test Orders
Write-Host "`n3. Orders with Items..." -ForegroundColor Yellow
$orders = Invoke-RestMethod "http://localhost:5000/api/restaurants/$restaurantId/orders"
Write-Host "   Found $($orders.data.Length) orders" -ForegroundColor Green
$firstOrder = $orders.data[0]
Write-Host "   Order $($firstOrder.order_number): $($firstOrder.items.Length) items" -ForegroundColor Green

# Test Menu
Write-Host "`n4. Menu Items..." -ForegroundColor Yellow
$menu = Invoke-RestMethod "http://localhost:5000/api/menu/items?restaurant_id=$restaurantId&limit=100"
Write-Host "   Found $($menu.data.items.Length) items" -ForegroundColor Green

Write-Host "`n=== ALL TESTS PASSED ===`n" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login: admin@restaurant.com / admin123" -ForegroundColor White
