# Database Schema

## Overview

The backend uses MongoDB with Mongoose models. Key collections:

- Users
- Products
- Orders
- Wallets
- Warehouses

## Users

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: 'farmer' | 'buyer' | 'driver' | 'admin' | 'agent',
  approved: Boolean,
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Products (Produce)

```js
{
  _id: ObjectId,
  farmerId: ObjectId, // reference to Users
  name: String,
  description: String,
  images: [String],
  price: Number,
  quantity: Number,
  status: 'available' | 'sold' | 'pending',
  createdAt: Date,
  updatedAt: Date
}
```

## Orders

```js
{
  _id: ObjectId,
  buyerId: ObjectId, // reference to Users
  farmerId: ObjectId, // reference to Users
  productId: ObjectId, // reference to Products
  quantity: Number,
  totalPrice: Number,
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled',
  driverId: ObjectId, // reference to Users
  deliveryAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Loans

```js
{
  _id: ObjectId,
  farmerId: ObjectId, // reference to Users
  amount: Number,
  status: 'pending' | 'approved' | 'rejected' | 'repaid',
  documents: [String],
  appliedAt: Date,
  updatedAt: Date
}
```

## Wallets

```js
{
  _id: ObjectId,
  userId: ObjectId, // reference to Users
  balance: Number,
  transactions: [
    {
      type: 'credit' | 'debit',
      amount: Number,
      description: String,
      date: Date
    }
  ]
}
```

## Logistics (Deliveries)

```js
{
  _id: ObjectId,
  orderId: ObjectId, // reference to Orders
  driverId: ObjectId, // reference to Users
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered',
  pickupTime: Date,
  deliveryTime: Date
}
```

## Onboarding (Agents)

```js
{
  _id: ObjectId,
  agentId: ObjectId, // reference to Users
  farmerId: ObjectId, // reference to Users
  status: 'pending' | 'verified' | 'rejected',
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```
