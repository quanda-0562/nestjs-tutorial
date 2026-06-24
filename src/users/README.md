# Users Module - Authentication

## Overview
This module provides user authentication functionality with JWT token support and multi-language error messages using i18n.

## Features
- User login with email and password
- JWT token generation
- Password hashing with bcrypt
- Request validation with class-validator
- Multi-language error messages (English & Vietnamese)
- Comprehensive unit and e2e tests

## Endpoints

### POST /api/users/login
Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "user": {
    "email": "jake@jake.jake",
    "password": "jakejake12"
  }
}
```

**Response (201 Created):**
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
- `400 Bad Request`: Missing or invalid required fields (e.g., short password, invalid email format)
- `401 Unauthorized`: Invalid email or password

## Multi-Language Support (i18n)

Error messages are automatically translated based on the `language` header:
- `language: en` - English
- `language: vi` - Vietnamese (Tiếng Việt)

### Supported Error Messages
```
auth.emailAndPasswordRequired - Email and password are required
auth.invalidEmailOrPassword - Invalid email or password
auth.invalidEmail - Email must be a valid email address
auth.passwordTooShort - Password must be at least 8 characters
auth.unauthorized - Unauthorized
```

### Example with Language Header
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -H "language: vi" \
  -d '{
    "user": {
      "email": "jake@jake.jake",
      "password": "wrongpassword"
    }
  }'
```

Response (Vietnamese):
```json
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không hợp lệ",
  "error": "Unauthorized"
}
```

## Test Credentials
Default test user is pre-created:
- Email: `jake@jake.jake`
- Password: `jakejake12`

## Usage Example

### cURL
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -H "language: en" \
  -d '{
    "user": {
      "email": "jake@jake.jake",
      "password": "jakejake12"
    }
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'language': 'en'  // or 'vi' for Vietnamese
  },
  body: JSON.stringify({
    user: {
      email: 'jake@jake.jake',
      password: 'jakejake12'
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
