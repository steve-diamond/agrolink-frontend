# API Endpoints (Microservice-aligned)

## User Service

- POST   /api/user/register
- POST   /api/user/login
- GET    /api/user/profile
- PUT    /api/user/role

## Farmer Service

- GET    /api/farmer/dashboard
- POST   /api/farmer/crop
- GET    /api/farmer/crops
- POST   /api/farmer/harvest
- GET    /api/farmer/harvests

## Marketplace Service

- GET    /api/marketplace/products
- POST   /api/marketplace/product
- POST   /api/marketplace/order
- GET    /api/marketplace/orders
- POST   /api/marketplace/review

## Payment Service

- POST   /api/payment/paystack
- POST   /api/payment/flutterwave
- GET    /api/payment/wallet
- GET    /api/payment/transactions

## Loan Service

- POST   /api/loan/apply
- GET    /api/loan/status
- PUT    /api/loan/approve
- PUT    /api/loan/repay

## Logistics Service

- POST   /api/logistics/request
- GET    /api/logistics/track
- PUT    /api/logistics/assign-driver

## Warehouse Service

- POST   /api/warehouse/book
- GET    /api/warehouse/inventory

## Notification Service

- POST   /api/notification/send
- GET    /api/notification/list

## Analytics Service

- GET    /api/analytics/sales
- GET    /api/analytics/farmer-performance
