# Login Credentials

## Fixed: October 14, 2025

Password hashes in database were incorrect causing login failures.
All passwords have been regenerated and updated.

## Available Accounts

### Admin Account
- **Email**: `admin@restaurant.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Name**: Restaurant Admin

### Manager/Chef Account
- **Email**: `chef@restaurant.com`
- **Password**: `chef123`
- **Role**: `manager`
- **Name**: Head Chef

## Notes

- All passwords are hashed using bcrypt with 10 rounds
- Password hashes stored in `users.password_hash` column
- Login API endpoint: `POST /api/auth/login`
- Returns JWT token valid for 1 hour

## Testing Login

```bash
# Test admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'

# Test chef login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chef@restaurant.com","password":"chef123"}'
```

## Frontend Login

1. Navigate to: http://localhost:3000/login
2. Enter credentials from above
3. Token automatically saved to localStorage
4. All API calls include Bearer token automatically
