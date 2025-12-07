# E-commerce Backend API

A comprehensive Node.js/Express backend API for an e-commerce platform with order management, discount code generation, and product catalog features.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Business Logic](#business-logic)
- [Testing](#testing)
- [Environment Variables](#environment-variables)

## Features

- **Product Management**: Browse and retrieve products from FakeStore API
- **Order Processing**: Place orders with automatic order number tracking
- **Discount System**: Automatic discount generation for every 5th order (5, 10, 15...)
- **Admin Dashboard**: Generate and manage discount codes
- **Order History**: Fetch all orders sorted by creation date
- **Stock Management**: Track and validate product inventory
- **Comprehensive Testing**: 84 tests with 100% coverage for all routes

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **External API**: FakeStore API for product data
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Development**: Nodemon for auto-reload

## Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   ├── models/
│   │   ├── Product.js            # Product schema
│   │   ├── Order.js              # Order schema
│   │   └── DiscountCode.js       # Discount code schema
│   ├── routes/
│   │   ├── products.js           # Product API endpoints
│   │   ├── orders.js             # Order/Checkout API endpoints
│   │   ├── admin.js              # Admin API endpoints
│   │   └── productListDatabase.js # Database seeding utility
│   └── server.js                 # Main server file
├── tests/
│   ├── products.test.js          # Product API tests (9 tests)
│   ├── orders.test.js            # Order API tests (20 tests)
│   ├── admin.test.js             # Admin API tests (33 tests)
│   ├── productListDatabase.test.js # Seeding tests (22 tests)
│   ├── README.md                 # Testing documentation
│   ├── ORDERS_TESTS_SUMMARY.md   # Orders test details
│   └── ADMIN_TESTS_SUMMARY.md    # Admin test details
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository:

```bash
cd ecommerce-backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
nodemon server.js
```

4. The server will start on `http://localhost:5000`

### Database Seeding

The database automatically seeds with products from FakeStore API on first run:

- Fetches 20 products from `https://fakestoreapi.com/products`
- Adds random stock (10-60 units) to each product
- Only seeds if database is empty (idempotent)

## API Documentation

### Base URL

```
http://localhost:5000
```

### Endpoints

#### 1. Products API

**GET /api/products**

- Returns all products
- Response: `{ success: true, data: [products] }`

**GET /api/products/:id**

- Returns a single product by productId
- Response: `{ success: true, data: product }`
- Error: `404` if product not found

#### 2. Checkout/Orders API

**POST /api/checkout/checkIsCouponValid**

- Checks if next order qualifies for discount
- Response:
  ```json
  {
    "success": true,
    "message": "Coupon is valid"
  }
  ```

**POST /api/checkout/placeOrder**

- Place a new order
- Request Body:
  ```json
  {
    "userId": "user123",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 100
      }
    ],
    "totalItems": 2,
    "totalAmount": 200,
    "discountCode": "DISCOUNT5" // optional
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "orderNumber": 1,
    "totalAmount": 200,
    "discountAmount": 20,
    "finalAmount": 180
  }
  ```
- Validates:
  - Product existence and stock availability
  - Discount code validity and usage
  - Order number matching for discount codes
- Auto-generates discount code for next qualifying order (5, 10, 15...)

**GET /api/checkout/fetchAllOrder**

- Fetch all orders (sorted by newest first)
- Response:
  ```json
  {
    "success": true,
    "message": "Orders fetched successfully",
    "body": [orders]
  }
  ```

#### 3. Admin API

**POST /api/admin/generate-discount**

- Generate discount code for specific order number
- Request Body:
  ```json
  {
    "orderNumber": 5
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Discount code generated successfully for order #5",
    "discountCode": {
      "code": "DISCOUNT5",
      "percentage": 10,
      "generatedForOrder": 5,
      "isUsed": false,
      "createdAt": "2025-12-07T06:18:00.000Z"
    }
  }
  ```
- Validations:
  - Order number must be positive integer
  - Order number must qualify (multiple of 5)
  - Prevents duplicate discount codes

## Database Models

### Product Schema

```javascript
{
  productId: Number,        // Unique ID from FakeStore API
  title: String,            // Product name
  price: Number,            // Product price
  description: String,      // Product description
  category: String,         // Product category (indexed)
  image: String,            // Product image URL
  rating: {
    rate: Number,           // Average rating (0-5)
    count: Number           // Number of ratings
  },
  stock: Number,            // Available quantity
  timestamps: true          // createdAt, updatedAt
}
```

### Order Schema

```javascript
{
  orderNumber: Number,      // Auto-incrementing order number
  userId: String,           // User identifier
  items: [{
    productId: Number,
    quantity: Number,
    price: Number,
    subTotal: Number
  }],
  totalItems: Number,       // Total quantity
  totalAmount: Number,      // Amount before discount
  discountCode: String,     // Applied discount code
  discountAmount: Number,   // Discount value
  finalAmount: Number,      // Amount after discount
  timestamps: true
}
```

### DiscountCode Schema

```javascript
{
  code: String,             // Discount code (e.g., "DISCOUNT5")
  percentage: Number,       // Discount percentage (10%)
  isUsed: Boolean,          // Usage status
  generatedForOrder: Number, // Target order number
  usedBy: String,           // User who used it (null if unused)
  timestamps: true
}
```

## Business Logic

### Discount System

The platform implements an automatic discount system:

1. **Qualifying Orders**: Every 5th order qualifies for discount (5, 10, 15, 20...)
2. **Auto-Generation**: When order #4 is placed, discount code for order #5 is auto-generated
3. **Manual Generation**: Admin can pre-generate codes for qualifying orders like 5, 10, 15,...
4. **Code Format**: `DISCOUNT{orderNumber}` (e.g., "DISCOUNT5")
5. **Discount Value**: 10% off total order amount
6. **Order-Specific**: Discount codes can only be used on their designated order number
7. **One-Time Use**: Each code can only be used once

### Order Flow

```
1. User places order
   ↓
2. Validate products and stock
   ↓
3. Check discount code (if provided)
   - Verify code exists
   - Check not already used
   - Validate order number match
   ↓
4. Calculate final amount
   ↓
5. Create order in database
   ↓
6. Update product stock
   ↓
7. Mark discount code as used
   ↓
8. Auto-generate next qualifying discount (if applicable)
```

## Testing

The project includes comprehensive test coverage with 84 tests across 4 test suites.

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/products.test.js
```

### Test Coverage

```
Test Suites: 4 passed, 4 total
Tests:       84 passed, 84 total

Coverage:
  - products.js: 100%
  - orders.js: 100%
  - admin.js: 100%
  - productListDatabase.js: 100%
  - All Models: 100%
  - Overall: 85%+
```

### Test Files

- **products.test.js** (9 tests): Product retrieval and validation
- **orders.test.js** (20 tests): Order placement, discount validation, order history
- **admin.test.js** (33 tests): Discount code generation with comprehensive validation
- **productListDatabase.test.js** (22 tests): Database seeding, error handling, idempotency

For detailed test documentation, see [tests/README.md](tests/README.md).

## Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid input, missing required fields
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Database errors, unexpected failures

Example error response:

```json
{
  "success": false,
  "error": "Product not found"
}
```

## Development

### Available Scripts

```bash
# Start server with nodemon (auto-reload on changes)
npm run dev

# Start production server
npm start

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Adding New Endpoints

1. Create route file in `src/routes/`
2. Define route handlers with error handling
3. Add route to `server.js`
4. Create corresponding test file in `tests/`
5. Update this README with endpoint documentation

## API Examples

### Place Order with Discount

```bash
curl -X POST http://localhost:5000/api/checkout/placeOrder \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 100
      }
    ],
    "totalItems": 2,
    "totalAmount": 200,
    "discountCode": "DISCOUNT5"
  }'
```

### Generate Discount Code

```bash
curl -X POST http://localhost:5000/api/admin/generate-discount \
  -H "Content-Type: application/json" \
  -d '{"orderNumber": 10}'
```

### Get All Products

```bash
curl http://localhost:5000/api/products
```

Built with ❤️ using Node.js and Express
