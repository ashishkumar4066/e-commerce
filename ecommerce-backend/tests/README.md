# API Testing Documentation

## Overview

This directory contains unit tests for the E-commerce Backend API endpoints.

## Technologies Used

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing Express APIs
- **MongoDB Memory Server**: In-memory MongoDB instance for testing

## Test Files

- `products.test.js`: Tests for Products API endpoints (9 tests)
- `orders.test.js`: Tests for Orders/Checkout API endpoints (20 tests)
- `admin.test.js`: Tests for Admin API endpoints (33 tests)
- `productListDatabase.test.js`: Tests for database seeding utility (22 tests)

## Running Tests

### Run all tests with coverage

```bash
npm test
```

### Run tests in watch mode

```bash
npm test:watch
```

## Products API Tests

### Test Coverage

The `products.test.js` file covers:

#### 1. GET /api/products

- ✅ Returns empty array when no products exist
- ✅ Returns all products when products exist
- ✅ Handles database errors gracefully

#### 2. GET /api/products/:id

- ✅ Returns a product when valid ID is provided
- ✅ Returns 404 when product is not found
- ✅ Returns 500 when invalid ID format is provided
- ✅ Handles database errors gracefully

#### 3. Product Model Validation

- ✅ Validates required fields
- ✅ Creates product with all valid fields

### Test Results

```
Tests:       9 passed, 9 total
Coverage:    100% for products.js
```

## Orders API Tests

### Test Coverage

The `orders.test.js` file covers:

#### 1. POST /api/checkout/checkIsCouponValid

- ✅ Returns valid when next order qualifies for discount (5th, 10th, 15th...)
- ✅ Returns invalid when next order does not qualify for discount
- ✅ Returns valid when no orders exist (first order qualifies)
- ✅ Handles database errors gracefully

#### 2. POST /api/checkout/placeOrder

- ✅ Successfully places an order without discount code
- ✅ Returns 400 when userId is missing
- ✅ Returns 404 when product does not exist
- ✅ Returns 400 when insufficient stock
- ✅ Applies valid discount code successfully
- ✅ Returns 400 when discount code is invalid
- ✅ Returns 400 when discount code has already been used
- ✅ Returns 400 when discount code is for different order number
- ✅ Auto-generates discount code for next qualifying order
- ✅ Does not create duplicate discount code if it already exists
- ✅ Increments order number correctly
- ✅ Handles database errors gracefully

#### 3. GET /api/checkout/fetchAllOrder

- ✅ Returns empty array when no orders exist
- ✅ Returns all orders sorted by creation date (newest first)
- ✅ Returns orders with all fields
- ✅ Handles database errors gracefully

### Test Results

```
Tests:       20 passed, 20 total
Coverage:    100% for orders.js
```

## Admin API Tests

### Test Coverage

The `admin.test.js` file covers:

#### POST /api/admin/generate-discount

**Validation Tests (5 tests):**

- ✅ Returns 400 when orderNumber is missing
- ✅ Returns 400 when orderNumber is not an integer
- ✅ Returns 400 when orderNumber is zero
- ✅ Returns 400 when orderNumber is negative
- ✅ Returns 400 when orderNumber is a string

**Qualifying Order Tests (7 tests):**

- ✅ Returns 400 when order number does not qualify (orders #1, #3, #7)
- ✅ Accepts qualifying order numbers (5, 10, 15, 100)
- ✅ Provides next qualifying order number hint

**Successful Discount Generation (3 tests):**

- ✅ Generates discount code successfully
- ✅ Creates discount code in database
- ✅ Generates unique codes for different order numbers

**Existing Discount Code Tests (3 tests):**

- ✅ Handles when discount code already exists and is unused
- ✅ Handles when discount code already exists and has been used
- ✅ Prevents duplicate discount code creation

**Error Handling (4 tests):**

- ✅ Handles database errors gracefully
- ✅ Handles unexpected input types (null, array, object)

**Edge Cases (4 tests):**

- ✅ Handles very large qualifying order numbers
- ✅ Calculates next qualifying order correctly

**Business Logic Validation (5 tests):**

- ✅ Generates discount with exactly 10% percentage
- ✅ Sets isUsed to false initially
- ✅ Sets usedBy to null initially
- ✅ Follows naming convention DISCOUNT{orderNumber}
- ✅ Stores createdAt timestamp

**Multiple Order Scenarios (2 tests):**

- ✅ Generates codes for multiple sequential qualifying orders
- ✅ Maintains separate state for each discount code

### Test Results

```
Tests:       33 passed, 33 total
Coverage:    100% for admin.js
```

## Product List Database Seeding Tests

### Test Coverage

The `productListDatabase.test.js` file covers:

#### 1. Database Seeding Logic (5 tests)

- ✅ Fetches products from FakeStore API and seeds database when empty
- ✅ Does not seed database if products already exist
- ✅ Adds random stock to each product (between 10-60)
- ✅ Preserves all product fields from API
- ✅ Seeds multiple products correctly

#### 2. Error Handling (4 tests)

- ✅ Handles API errors gracefully
- ✅ Handles network timeout errors
- ✅ Handles malformed API response
- ✅ Handles database insertion errors

#### 3. Data Transformation (4 tests)

- ✅ Maps API product structure to database schema
- ✅ Handles products with different categories
- ✅ Handles products with decimal prices
- ✅ Handles products with rating decimals

#### 4. API Integration (2 tests)

- ✅ Calls FakeStore API with correct URL
- ✅ Does not make API call if database is already seeded

#### 5. Edge Cases (5 tests)

- ✅ Handles empty API response
- ✅ Handles single product from API
- ✅ Handles very large product count from API
- ✅ Handles products with long titles and descriptions
- ✅ Handles products with special characters in title

#### 6. Idempotency (2 tests)

- ✅ Is idempotent - calling multiple times does not duplicate data
- ✅ Checks database count before seeding each time

### Test Results

```
Tests:       22 passed, 22 total
Coverage:    100% for productListDatabase.js
```

## Overall Test Results

```
Test Suites: 4 passed, 4 total
Tests:       84 passed, 84 total
Coverage:
  - products.js: 100%
  - orders.js: 100%
  - admin.js: 100%
  - productListDatabase.js: 100%
  - All Models: 100%
  - Overall: 85%+ (all routes covered)
```

## Test Structure

Each test file follows this structure:

1. **Setup**: Connect to in-memory MongoDB before all tests
2. **Cleanup**: Clear database after each test
3. **Teardown**: Disconnect and stop MongoDB after all tests
4. **Test Cases**: Organized by endpoint with descriptive test names

## Coverage Report

The test suite generates a coverage report in the `coverage/` directory. To view the HTML report:

```bash
# After running tests
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

## Best Practices

- Use in-memory database for fast, isolated tests
- Clean up test data after each test
- Test both success and error scenarios
- Test edge cases (invalid inputs, missing data, etc.)
- Maintain descriptive test names

## Adding New Tests

To add tests for a new API endpoint:

1. Create a new test file in `tests/` directory (e.g., `orders.test.js`)
2. Follow the existing structure from `products.test.js`
3. Import necessary dependencies and models
4. Set up database connections and cleanup
5. Write test cases for all endpoints and scenarios
6. Run `npm test` to verify
