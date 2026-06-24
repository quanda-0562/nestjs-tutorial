# Users Module - Authentication

## Overview
This module provides user authentication functionality with JWT token support.

## Features
- User login with email and password
- JWT token generation
- Password hashing with bcrypt
- Request validation with class-validator

## Endpoints

### POST /api/users/login
Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "user": {
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "jake@jake.jake",
    "username": "Jake",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid required fields
- `401 Unauthorized`: Invalid email or password

## Test Credentials
Default test user is pre-created:
- Email: `jake@jake.jake`
- Password: `jakejake`

## Usage Example

### cURL
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "jake@jake.jake",
      "password": "jakejake"
    }
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: {
      email: 'jake@jake.jake',
      password: 'jakejake'
    }
  })
});

const data = await response.json();
console.log(data.user.token); // Use this token for authenticated requests
```

## Configuration
JWT secret is configurable via environment variable:
```
JWT_SECRET=your-secret-key-change-in-production
```

Default token expiration: 24 hours

## Files Structure
- `dto/` - Data Transfer Objects for request/response validation
  - `login.dto.ts` - Login request DTO
  - `user.dto.ts` - User response DTO
- `entities/` - Entity definitions
  - `user.entity.ts` - User entity
- `users.service.ts` - Business logic
- `users.controller.ts` - Route handlers
- `users.module.ts` - Module configuration

## Future Enhancements
- Replace in-memory storage with database (PostgreSQL, MongoDB, etc.)
- Add JWT refresh tokens
- Add user registration endpoint
- Add password reset functionality
- Add email verification
- Add role-based access control (RBAC)
