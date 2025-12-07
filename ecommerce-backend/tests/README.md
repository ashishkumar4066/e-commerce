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

## Overall Test Results
```
Test Suites: 2 passed, 2 total
Tests:       29 passed, 29 total
Coverage:
  - products.js: 100%
  - orders.js: 100%
  - All Models: 100%
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

## Future Enhancements
- ✅ ~~Add tests for Orders API~~ (Completed)
- Add tests for Admin API (`/api/admin/generate-discount`)
- Add integration tests
- Add API authentication tests
- Add performance/load tests
