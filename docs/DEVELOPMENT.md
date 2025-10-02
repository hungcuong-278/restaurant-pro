# Development Guide

## Getting Started

This guide will help you set up the development environment for RestaurantPro.

## Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13
- Redis >= 6.0
- Git
- Code editor (VS Code recommended)

## Project Structure

```
restaurant-pro/
├── frontend/           # React TypeScript application
├── backend/           # Node.js Express application
├── database/          # Database scripts and migrations
├── docs/             # Documentation
├── docker/           # Docker configurations
└── .github/          # GitHub workflows and templates
```

## Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/restaurant-pro.git
cd restaurant-pro
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your local settings
```

3. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Start databases**
```bash
# Using Docker (recommended)
docker-compose up -d postgres redis

# Or start locally installed services
sudo systemctl start postgresql
sudo systemctl start redis
```

5. **Set up database**
```bash
cd backend
npm run migrate
npm run seed
```

## Development Workflow

### Backend Development

1. **Start the development server**
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000` with hot reloading enabled.

2. **Run tests**
```bash
npm test
npm run test:watch
npm run test:coverage
```

3. **Database operations**
```bash
# Create a new migration
npm run migration:create -- migration-name

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Seed database
npm run seed
```

### Frontend Development

1. **Start the development server**
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`.

2. **Build for production**
```bash
npm run build
```

3. **Run tests**
```bash
npm test
npm run test:coverage
```

## Code Style and Standards

### TypeScript Configuration

Both frontend and backend use TypeScript with strict type checking enabled.

### ESLint and Prettier

Code formatting and linting are enforced:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Commit Standards

We use Conventional Commits:

```
feat: add new reservation system
fix: resolve payment processing bug
docs: update API documentation
style: format code with prettier
refactor: restructure user service
test: add unit tests for menu controller
chore: update dependencies
```

## Database Development

### Schema Design

The database schema includes:

- **users** - User accounts and authentication
- **restaurants** - Restaurant information
- **tables** - Table management
- **menu_items** - Menu and pricing
- **reservations** - Table reservations
- **orders** - Order processing
- **payments** - Payment records

### Migration Guidelines

1. **Create descriptive migration names**
2. **Always provide rollback methods**
3. **Test migrations on sample data**
4. **Update seeds after schema changes**

Example migration:
```javascript
exports.up = function(knex) {
  return knex.schema.createTable('menu_items', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 8, 2).notNullable();
    table.string('category').notNullable();
    table.string('image_url');
    table.boolean('available').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('menu_items');
};
```

## API Development

### Route Structure

```
/api/v1/
├── auth/          # Authentication endpoints
├── users/         # User management
├── restaurants/   # Restaurant data
├── tables/        # Table management
├── menu/          # Menu operations
├── reservations/  # Reservation system
├── orders/        # Order processing
└── analytics/     # Reporting and analytics
```

### Controller Pattern

```javascript
// controllers/menuController.js
export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuService.getAll(req.query);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### Middleware

- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Validation**: Request data validation
- **Logging**: Request/response logging
- **Rate Limiting**: API rate limiting

## Frontend Development

### Component Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── store/         # Redux store and slices
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global styles and themes
```

### State Management

Using Redux Toolkit for state management:

```javascript
// store/slices/menuSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async (params) => {
    const response = await menuAPI.getItems(params);
    return response.data;
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      });
  }
});
```

### Component Guidelines

1. **Use TypeScript interfaces for props**
2. **Implement error boundaries**
3. **Follow accessibility standards**
4. **Use React.memo for optimization**
5. **Implement proper loading states**

## Testing

### Backend Testing

```javascript
// tests/controllers/menu.test.js
import request from 'supertest';
import app from '../../src/app';

describe('Menu API', () => {
  test('GET /api/menu should return menu items', async () => {
    const response = await request(app)
      .get('/api/menu')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Frontend Testing

```javascript
// components/__tests__/MenuCard.test.tsx
import { render, screen } from '@testing-library/react';
import MenuCard from '../MenuCard';

test('renders menu item correctly', () => {
  const menuItem = {
    id: 1,
    name: 'Test Dish',
    price: 15.99,
    description: 'Test description'
  };
  
  render(<MenuCard item={menuItem} />);
  
  expect(screen.getByText('Test Dish')).toBeInTheDocument();
  expect(screen.getByText('$15.99')).toBeInTheDocument();
});
```

## Docker Development

### Development Environment

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up postgres redis

# View logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend npm run migrate
```

### Building Images

```bash
# Build backend image
docker build -t restaurant-pro-backend ./backend

# Build frontend image
docker build -t restaurant-pro-frontend ./frontend
```

## Debugging

### Backend Debugging

1. **VS Code Debug Configuration**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/index.ts",
  "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

2. **Database Debugging**
```javascript
// Enable query logging
const db = knex({
  client: 'postgresql',
  debug: true, // Enable SQL logging
  connection: process.env.DATABASE_URL
});
```

### Frontend Debugging

1. **React Developer Tools**
2. **Redux DevTools Extension**
3. **Chrome DevTools**

## Performance Optimization

### Backend Optimization

1. **Database Query Optimization**
   - Use proper indexes
   - Implement query result caching
   - Use connection pooling

2. **API Response Optimization**
   - Implement pagination
   - Use compression middleware
   - Cache frequent responses

### Frontend Optimization

1. **Bundle Optimization**
   - Code splitting
   - Tree shaking
   - Lazy loading

2. **Performance Monitoring**
   - Lighthouse audits
   - Web Vitals monitoring
   - Performance profiling

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql postgresql://user:password@localhost:5432/database
```

2. **Redis Connection Issues**
```bash
# Check Redis status
redis-cli ping

# View Redis logs
redis-cli monitor
```

3. **Port Conflicts**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## Contributing

1. **Create a feature branch**
```bash
git checkout -b feature/new-feature
```

2. **Make changes and test**
```bash
npm test
npm run lint
```

3. **Commit with conventional format**
```bash
git commit -m "feat: add new reservation feature"
```

4. **Push and create PR**
```bash
git push origin feature/new-feature
```

## Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)