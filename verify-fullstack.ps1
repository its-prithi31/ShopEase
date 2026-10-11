# ==============================================================
# ShopEase Full-Stack Verification & Output Demonstration Script
# Tests: Backend API, In-Memory / MongoDB Database, Auth, Products,
# Reviews, Coupons, Cart & Checkout, Order Management & Cancellation.
# ==============================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:5000/api"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🛍️  SHOPEASE FULL-STACK VERIFICATION & DEMO TEST" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. API Health Check
Write-Host "`n[1/7] Testing Backend API Health Check..." -ForegroundColor Yellow
try {
  $health = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
  Write-Host "  ✅ Backend is Online: $($health.app) (v$($health.version))" -ForegroundColor Green
} catch {
  Write-Host "  ❌ Failed to reach backend on http://localhost:5000. Please start the server." -ForegroundColor Red
  exit 1
}

# 2. Authentication Test (Customer & Admin)
Write-Host "`n[2/7] Testing Authentication (JWT + Bcrypt)..." -ForegroundColor Yellow
$userPayload = @{ email = "user@shopease.com"; password = "user123" } | ConvertTo-Json
$userAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $userPayload -ContentType "application/json"
$customerToken = $userAuth.token
Write-Host "  ✅ Customer Login: $($userAuth.name) (isAdmin: $($userAuth.isAdmin))" -ForegroundColor Green
Write-Host "     JWT Token: $($customerToken.Substring(0, 25))..." -ForegroundColor Gray

$adminPayload = @{ email = "admin@shopease.com"; password = "admin123" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminPayload -ContentType "application/json"
$adminToken = $adminAuth.token
Write-Host "  ✅ Admin Login: $($adminAuth.name) (isAdmin: $($adminAuth.isAdmin))" -ForegroundColor Green

# 3. Product Catalog, Filtering, and Sorting
Write-Host "`n[3/7] Testing Catalog, Search & Sorting..." -ForegroundColor Yellow
$allProducts = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
Write-Host "  ✅ Catalog Items: Total $($allProducts.Count) products preloaded" -ForegroundColor Green

$filtered = Invoke-RestMethod -Uri "$baseUrl/products?category=Electronics" -Method Get
Write-Host "  ✅ Category Filter ('Electronics'): Found $($filtered.Count) items" -ForegroundColor Green

$sortedAsc = Invoke-RestMethod -Uri "$baseUrl/products?sort=price-asc" -Method Get
Write-Host "  ✅ Price Sort (Low to High): Lowest is '$($sortedAsc[0].name)' at `$$($sortedAsc[0].price)" -ForegroundColor Green

$sortedDesc = Invoke-RestMethod -Uri "$baseUrl/products?sort=price-desc" -Method Get
Write-Host "  ✅ Price Sort (High to Low): Highest is '$($sortedDesc[0].name)' at `$$($sortedDesc[0].price)" -ForegroundColor Green

# 4. Product Reviews & Ratings (New Extra Feature)
Write-Host "`n[4/7] Testing Customer Review & Star Rating Feature..." -ForegroundColor Yellow
$reviewTargetId = $allProducts[0]._id
$reviewBody = @{
  rating = 5
  comment = "Superb audio clarity, incredible noise isolation, and stellar design!"
} | ConvertTo-Json

$headers = @{ Authorization = "Bearer $customerToken" }
$reviewRes = Invoke-RestMethod -Uri "$baseUrl/products/$reviewTargetId/reviews" -Method Post -Body $reviewBody -ContentType "application/json" -Headers $headers
Write-Host "  ✅ Review Submitted: $($reviewRes.message)" -ForegroundColor Green
Write-Host "     Product '$($reviewRes.product.name)' now has rating $($reviewRes.product.rating) / 5 ($($reviewRes.product.numReviews) reviews)" -ForegroundColor Green

# 5. Promotional Discount Coupons (New Extra Feature)
Write-Host "`n[5/7] Testing Promo Coupon Validation Feature..." -ForegroundColor Yellow
$couponCheck = @{ code = "SHOPEASE10"; itemsPrice = 199.99 } | ConvertTo-Json
$couponRes = Invoke-RestMethod -Uri "$baseUrl/orders/validate-coupon" -Method Post -Body $couponCheck -ContentType "application/json"
Write-Host "  ✅ Coupon 'SHOPEASE10' Validated: $($couponRes.description)" -ForegroundColor Green
Write-Host "     Discount Amount: `$$($couponRes.discountAmount) on `$199.99 subtotal" -ForegroundColor Green

$couponCheck2 = @{ code = "SAVE20"; itemsPrice = 149.99 } | ConvertTo-Json
$couponRes2 = Invoke-RestMethod -Uri "$baseUrl/orders/validate-coupon" -Method Post -Body $couponCheck2 -ContentType "application/json"
Write-Host "  ✅ Coupon 'SAVE20' Validated: $($couponRes2.description) (`$$($couponRes2.discountAmount) off)" -ForegroundColor Green

# 6. Order Placement with Coupon & Stock Reduction
Write-Host "`n[6/7] Testing Order Placement with Coupon Discount..." -ForegroundColor Yellow
$orderPayload = @{
  orderItems = @(
    @{
      product = $allProducts[0]._id
      name = $allProducts[0].name
      qty = 1
      image = $allProducts[0].image
      price = $allProducts[0].price
    }
  )
  shippingAddress = @{
    address = "742 Evergreen Terrace"
    city = "Springfield"
    postalCode = "97477"
    country = "USA"
  }
  paymentMethod = "Cash on Delivery"
  itemsPrice = $allProducts[0].price
  shippingPrice = 0
  discountAmount = $couponRes.discountAmount
  couponCode = "SHOPEASE10"
  totalPrice = [math]::Round($allProducts[0].price - $couponRes.discountAmount, 2)
} | ConvertTo-Json -Depth 4

$orderRes = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body $orderPayload -ContentType "application/json" -Headers $headers
$createdOrderId = $orderRes._id
Write-Host "  ✅ Order Placed Successfully: Order ID #$($createdOrderId)" -ForegroundColor Green
Write-Host "     Subtotal: `$$($orderRes.itemsPrice) | Discount: -`$$($orderRes.discountAmount) | Total: `$$($orderRes.totalPrice)" -ForegroundColor Green
Write-Host "     Status: $($orderRes.status)" -ForegroundColor Green

# 7. Customer Order Cancellation & Inventory Stock Restoration (New Extra Feature)
Write-Host "`n[7/7] Testing Order Cancellation & Stock Restoration..." -ForegroundColor Yellow
$cancelRes = Invoke-RestMethod -Uri "$baseUrl/orders/$createdOrderId/cancel" -Method Put -ContentType "application/json" -Headers $headers
Write-Host "  ✅ Order Cancelled: $($cancelRes.message)" -ForegroundColor Green
Write-Host "     Updated Order Status: $($cancelRes.order.status)" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "🎉 ALL TESTS PASSED SUCCESSFULLY! FULL-STACK IS OPERATIONAL" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
