# API Testing Documentation

## Overview
This directory contains unit tests for the E-commerce Backend API endpoints.

## Technologies Used
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing Express APIs
- **MongoDB Memory Server**: In-memory MongoDB instance for testing

## Test Files
- `products.test.js`: Tests for Products API endpoints

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
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Coverage:    100% for products.js
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
- Add tests for Orders API
- Add tests for Admin API
- Add tests for Discount Code API
- Add integration tests
- Add API authentication tests
