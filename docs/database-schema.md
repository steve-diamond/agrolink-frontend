# Database Schema

## Overview
The backend uses MongoDB with Mongoose models. Key collections:

- Users
- Products
- Orders
- Wallets
- Warehouses

## Example (User)
```js
{
  _id: ObjectId,
  name: String,
  email: String,
  role: String,
  approved: Boolean,
  ...
}
```
