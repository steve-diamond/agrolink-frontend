# API Specification

## Overview
The frontend communicates with a RESTful backend API (Node.js/Express, Mongoose).

## Main Endpoints
- `/api/auth/*` - Authentication
- `/api/orders/*` - Order management
- `/api/products/*` - Product catalog
- `/api/wallet/*` - Wallet and payments
- `/api/warehouse/*` - Warehouse management

## Request/Response Format
- JSON for all requests and responses
- Auth via JWT in headers

## Example
```http
GET /api/products
Authorization: Bearer <token>
```
