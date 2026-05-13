# Backend Tests

This directory contains all test files for the backend application.

## Test Categories

### Unit Tests
- `test-auth.ts` - Authentication system tests
- `test-menu.ts` - Menu API tests
- `test-menu-api.js` - Menu endpoints validation
- `test-order-api.js` - Order endpoints tests
- `test-payment-api.js` - Payment processing tests
- `test-table-endpoints.js` - Table management tests

### Integration Tests
- `test-integration-complete.js` - Full integration test suite
- `test-integration-streamlined.js` - Streamlined integration tests
- `test-integration.bat` - Integration test runner script

### Database Tests
- `test-database.js` - Database connection and operations
- `test-db-direct.js` - Direct database queries
- `test-orders-tables-complete.ts` - Orders and tables schema tests

### API Tests
- `test-all-endpoints.js` - All API endpoints validation
- `test-api-quick.js` - Quick API smoke tests
- `test-http-request.js` - HTTP request handling

### Performance Tests
- `test-100-orders.js` - Bulk order creation test
- `test-100-simple.js` - Simple performance benchmark

### Service Tests
- `test-service-direct.js` - Direct service layer tests
- `test-service-import.js` - Service import validation
- `test-controller-direct.js` - Controller layer tests

### Specialized Tests
- `test-european-menu-order.js` - European menu format tests
- `test-european-order.js` - European order flow
- `test-error-handling.js` - Error handling validation
- `test-comprehensive-validation.js` - Full system validation
- `test-payment-system.bat` - Payment system test runner

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx ts-node tests/test-auth.ts

# Run integration tests
tests/test-integration.bat
```

## Test Results
- `TEST_RESULTS_SUMMARY.md` - Summary of test execution results
