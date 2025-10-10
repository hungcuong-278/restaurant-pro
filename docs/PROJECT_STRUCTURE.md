# Project Structure - Restaurant Pro

## Overview
```
restaurant-pro/
├── .github/              # GitHub configurations
│   ├── workflows/        # CI/CD pipelines
│   └── ISSUE_TEMPLATE/   # Issue templates
│
├── backend/              # Node.js Express Backend
│   ├── src/              # Source code
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   │
│   ├── database/         # SQLite database files
│   │   ├── dev.sqlite    # Development database
│   │   └── dev.sqlite3   # Alternative database file
│   │
│   ├── migrations/       # Database migrations
│   │   ├── 001_create_core_tables.ts
│   │   ├── 002_create_menu_reservations.ts
│   │   ├── 003_create_orders_payments.ts
│   │   └── ...
│   │
│   ├── seeds/            # Database seeders
│   │   ├── 00_create_test_users.ts
│   │   ├── 01_seed_initial_data.ts
│   │   ├── 02_seed_tables.ts
│   │   └── 04_seed_menu_final.ts
│   │
│   ├── tests/            # Test files (✨ NEW)
│   │   ├── test-auth.ts
│   │   ├── test-menu.ts
│   │   ├── test-integration-complete.js
│   │   └── ... (30+ test files)
│   │
│   ├── scripts/          # Utility scripts (✨ NEW)
│   │   ├── check-db.ts
│   │   ├── verify-database-schema.ts
│   │   ├── start-server.bat
│   │   └── ... (20+ scripts)
│   │
│   ├── postman/          # Postman collections
│   │
│   ├── .env              # Environment variables
│   ├── knexfile.ts       # Knex.js configuration
│   ├── package.json      # Node.js dependencies
│   └── tsconfig.json     # TypeScript configuration
│
├── frontend/             # React TypeScript Frontend
│   ├── public/           # Static assets
│   │
│   └── src/              # Source code
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── hooks/        # Custom React hooks
│       ├── store/        # Redux store and slices
│       │   ├── slices/   # Redux slices
│       │   │   ├── authSlice.ts
│       │   │   ├── menuSlice.ts
│       │   │   ├── orderSlice.ts (✨ NEW)
│       │   │   ├── reservationSlice.ts
│       │   │   └── tableSlice.ts
│       │   ├── hooks.ts  # Redux typed hooks (✨ NEW)
│       │   └── store.ts  # Store configuration
│       │
│       ├── services/     # API service functions
│       ├── types/        # TypeScript type definitions
│       ├── utils/        # Utility functions
│       ├── package.json  # Frontend dependencies
│       └── tsconfig.json # Frontend TS config
│
├── docs/                 # Documentation (✨ ORGANIZED)
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   ├── FINAL_FIX_COMPLETE.md (✨ MOVED)
│   ├── TABLE_API_FIX_SUMMARY.md (✨ MOVED)
│   └── ... (30+ documentation files)
│
├── scripts/              # Root-level scripts (✨ NEW)
│   └── monitor-servers.bat
│
├── tools/                # Development tools
│
├── .gitignore            # Git ignore rules
├── docker-compose.yml    # Docker configuration
├── LICENSE               # Project license
├── README.md             # Main documentation
└── QUICK_START.md        # Quick start guide
```

## Key Changes (✨ Recent Cleanup)

### 1. Organized Test Files
- **Before**: 30+ test files scattered in `backend/` root
- **After**: All tests in `backend/tests/` with README
- **Impact**: Easier to find and run tests

### 2. Centralized Scripts
- **Before**: 20+ utility scripts in `backend/` root
- **After**: All scripts in `backend/scripts/` with README
- **Impact**: Clean root directory, organized utilities

### 3. Database Files
- **Before**: `dev.sqlite` in backend root
- **After**: All database files in `backend/database/`
- **Impact**: Proper data organization

### 4. Documentation
- **Before**: Doc files mixed in project root
- **After**: All docs in `docs/` directory
- **Impact**: Single source of truth for docs

### 5. Removed Duplicates
- Deleted empty `database/` folder at root
- Removed unnecessary `node_modules/` at root
- **Impact**: Cleaner project structure

## File Counts by Directory

```
Root:           8 files (config only)
Backend:        6 config files
Backend/tests:  30+ test files
Backend/scripts: 20+ utility scripts
Backend/src:    100+ source files
Frontend/src:   150+ source files
Docs:           40+ documentation files
```

## Benefits of New Structure

1. **Clear Separation**: Tests, scripts, and source code are separated
2. **Easy Navigation**: Logical folder structure
3. **Maintainability**: Each folder has specific purpose
4. **Scalability**: Easy to add new files in right place
5. **Documentation**: README in each major folder

## Quick Reference

### Run Tests
```bash
cd backend
npx ts-node tests/test-auth.ts
```

### Use Scripts
```bash
cd backend
npx ts-node scripts/check-db.ts
```

### Start Servers
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## Notes
- All paths use forward slashes for cross-platform compatibility
- TypeScript files require `ts-node` or compilation
- Environment variables must be set before running
- See individual README files in each directory for details
