# Backend Scripts

This directory contains utility scripts for development, testing, and maintenance.

## Script Categories

### Database Scripts
- `check-db.js` / `check-db.ts` - Check database connection and status
- `check-data.js` - Verify database data integrity
- `check-schema.js` - Validate database schema
- `check-users-schema.ts` - Check users table schema
- `check-menu-schema.ts` - Check menu tables schema
- `check-orders-schema.js` - Check orders tables schema
- `check-admin.ts` - Verify admin account exists
- `verify-database-schema.ts` - Full schema verification
- `verify-order-fix.js` - Verify order fixes

### API Testing Scripts
- `debug-api.js` - Debug API endpoints
- `debug-database.js` - Debug database queries
- `quick-menu-test.js` - Quick menu API test
- `quick-test-order.js` - Quick order creation test

### Data Management
- `get-test-data.js` - Retrieve test data
- `update-menu-available.ts` - Update menu item availability

### Server Scripts
- `start-server.bat` - Start development server
- `start-server-with-log.bat` - Start server with logging
- `test-integration.bat` - Run integration tests
- `test-payment-system.bat` - Test payment system

## Usage

### Check Database
```bash
npx ts-node scripts/check-db.ts
```

### Verify Schema
```bash
npx ts-node scripts/verify-database-schema.ts
```

### Check Admin Account
```bash
npx ts-node scripts/check-admin.ts
```

### Start Server
```bash
scripts\start-server.bat
```

## Notes
- TypeScript scripts require `ts-node` to be installed
- Some scripts may require environment variables to be set
- Check individual script comments for specific usage instructions
