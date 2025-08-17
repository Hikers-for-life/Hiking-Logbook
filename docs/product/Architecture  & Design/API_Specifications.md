# API Specification

This document provides a comprehensive specification for the Hiking Logbook API endpoints, request/response formats, and authentication mechanisms.

## Overview

The Hiking Logbook API is a RESTful service built with Express.js that provides:

- **User Authentication** - Signup, login, and token verification
- **User Management** - Basic profile CRUD operations
- **Firebase Integration** - Secure authentication and data storage
- **JWT Token Management** - Stateless authentication

## Sprint 1 Scope

**Current Implementation Focus:**

- User authentication (signup/login/logout)
- Basic user profile creation and storage
- JWT token verification
- Simple profile retrieval and update

---

## Authentication

### JWT Token Format

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Token Structure

```javascript
{
  "uid": "user_firebase_uid",
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## API Endpoints

### Base URL

```
Development: http://localhost:3000
Production: https://your-api-domain.com
```

---

## Sprint 1: Authentication Endpoints

### POST /auth/signup

Creates a new user account and basic profile.

**Request:**

```javascript
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response (Success - 201):**

```javascript
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "firebase_generated_uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "token": "jwt_token_here"
  }
}
```

**Response (Error - 400):**

```javascript
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Email is required",
    "Password must be at least 8 characters"
  ]
}
```

**Response (Error - 409):**

```javascript
{
  "success": false,
  "error": "User already exists"
}
```

**Validation Rules:**

- Email must be valid format
- Password must be at least 8 characters
- Display name must be 2-50 characters
- Email must be unique

### POST /auth/login

Authenticates existing user and returns JWT token.

**Request:**

```javascript
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success - 200):**

```javascript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "firebase_generated_uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "token": "jwt_token_here"
  }
}
```

**Response (Error - 401):**

```javascript
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Response (Error - 404):**

```javascript
{
  "success": false,
  "error": "User not found"
}
```

### POST /auth/verify

Verifies JWT token validity.

**Request:**

```javascript
{
  "token": "jwt_token_here"
}
```

**Response (Success - 200):**

```javascript
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "uid": "firebase_generated_uid",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

**Response (Error - 401):**

```javascript
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### POST /auth/logout

Logs out user (client-side token removal).

**Request:**

```javascript
// No body required, just valid JWT token in header
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**

```javascript
{
  "success": true,
  "message": "Logout successful"
}
```

**Response (Error - 401):**

```javascript
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

## Sprint 1: Basic User Profile Endpoints

### GET /users/profile

Retrieves the current user's basic profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**

```javascript
{
  "success": true,
  "data": {
    "uid": "firebase_generated_uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "bio": "Hiking enthusiast from Colorado",
    "photoURL": "https://example.com/photo.jpg",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

**Response (Error - 401):**

```javascript
{
  "success": false,
  "error": "Unauthorized - Invalid or missing token"
}
```

### PUT /users/profile

Updates the current user's basic profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```javascript
{
  "displayName": "John Smith",
  "bio": "Updated bio information",
  "photoURL": "https://example.com/new-photo.jpg"
}
```

**Response (Success - 200):**

```javascript
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "uid": "firebase_generated_uid",
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

**Response (Error - 400):**

```javascript
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Display name must be between 2 and 50 characters"
  ]
}
```

---

## Sprint 1: Technical Implementation

### JWT Configuration

- **Algorithm**: HS256
- **Secret**: Firebase Admin SDK private key
- **Expiration**: 24 hours from creation
- **Refresh**: Not implemented in Sprint 1

### Basic Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

---

## Sprint 1: Basic Error Handling

### Standard Error Response Format

```javascript
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"],
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### HTTP Status Codes (Sprint 1)

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **404**: Not Found
- **409**: Conflict (resource already exists)
- **500**: Internal Server Error

### Common Error Messages (Sprint 1)

```javascript
// Authentication Errors
"Invalid credentials";
"User not found";
"User already exists";
"Invalid or expired token";
"Unauthorized - Invalid or missing token";

// Validation Errors
"Email is required";
"Password must be at least 8 characters";
"Display name must be between 2 and 50 characters";

// Server Errors
"Internal server error";
"Database connection failed";
```

---

## Sprint 1: Basic Testing

### Test with curl

```bash
# Test signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Support

### Getting Help

1. Check this specification document
2. Review the [Development API Setup](../Development_Guides/Dev_API_Setup.md) guide
3. Check the [Running Locally](../Development_Guides/Running_Locally.md) troubleshooting section
4. Contact the development team

---

_This API specification focuses on Sprint 1 implementation. For additional features, check the main [README](../README.md)._
