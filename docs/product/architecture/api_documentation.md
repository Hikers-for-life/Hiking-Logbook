# API Documentation

This document provides comprehensive documentation for the Hiking Logbook internal API endpoints.

## Overview

The Hiking Logbook API is a RESTful service built with Express.js and Node.js that provides:

- User authentication and authorization
- Hike logging with GPS tracking
- Goal and achievement management
- Social features (friends, activity feed)
- Gear management
- Route exploration
- Public API for external developers

**Base URL:**
- Development: `http://localhost:3001`
- Production: `https://your-api-domain.onrender.com`

---

## Authentication

All protected endpoints require a valid Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

### Getting a Token

Tokens are obtained through Firebase Authentication:

```javascript
// Frontend example
const token = await user.getIdToken();
```

---

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/signup`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "displayName": "John Doe",
    "token": "firebase_id_token"
  }
}
```

#### POST `/api/auth/login`

Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uid": "abc123xyz",
    "token": "firebase_id_token"
  }
}
```

#### POST `/api/auth/verify`

Verify token validity.

**Request:**
```json
{
  "token": "firebase_id_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "valid": true,
  "uid": "abc123xyz"
}
```

---

### Users (`/api/users`)

#### GET `/api/users/profile`

Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "displayName": "John Doe",
    "bio": "Weekend hiker",
    "photoURL": "https://example.com/photo.jpg",
    "location": {
      "latitude": -33.9249,
      "longitude": 18.4241
    },
    "stats": {
      "totalHikes": 25,
      "totalDistance": 150.5,
      "totalDuration": 1200
    }
  }
}
```

#### PUT `/api/users/profile`

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "displayName": "John Smith",
  "bio": "Mountain enthusiast",
  "photoURL": "https://example.com/new-photo.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### Hikes (`/api/hikes`)

#### GET `/api/hikes`

Get all hikes for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): filter by status (completed, active)
- `limit` (optional): number of results
- `offset` (optional): pagination offset

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "hike_001",
      "userId": "abc123xyz",
      "title": "Table Mountain Hike",
      "location": "Cape Town, South Africa",
      "distance": "12.5 km",
      "elevation": "800 ft",
      "duration": "3h 45m",
      "difficulty": "Moderate",
      "status": "completed",
      "date": "2024-01-15",
      "waypoints": [...],
      "accomplishments": [...],
      "weather": "Sunny, 22°C",
      "notes": "Beautiful views!",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### POST `/api/hikes`

Create a new hike (for past hikes).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Morning Trail Run",
  "location": "Lion's Head",
  "distance": "5.2 km",
  "elevation": "300 ft",
  "duration": "1h 30m",
  "difficulty": "Easy",
  "date": "2024-01-10",
  "weather": "Clear",
  "notes": "Great morning workout"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Hike created successfully",
  "data": {
    "id": "hike_002",
    "title": "Morning Trail Run"
  }
}
```

#### GET `/api/hikes/:id`

Get specific hike details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "hike_001",
    "title": "Table Mountain Hike",
    "waypoints": [
      {
        "id": "wp_001",
        "latitude": -33.9249,
        "longitude": 18.4241,
        "altitude": 1085,
        "timestamp": "2024-01-15T10:30:00Z",
        "distance": 2.5
      }
    ],
    "accomplishments": [
      {
        "id": "acc_001",
        "text": "Reached the summit!",
        "distance": 5.2,
        "timestamp": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

#### PUT `/api/hikes/:id`

Update hike details.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Updated Title",
  "notes": "Added more details"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hike updated successfully"
}
```

#### DELETE `/api/hikes/:id`

Delete a hike.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Hike deleted successfully"
}
```

#### POST `/api/hikes/start`

Start an active hike with GPS tracking.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Live Hike",
  "location": "Starting Point",
  "difficulty": "Moderate"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "hike_003",
    "status": "active",
    "startTime": "2024-01-20T08:00:00Z"
  }
}
```

#### POST `/api/hikes/:id/complete`

Complete an active hike.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "endTime": "2024-01-20T11:30:00Z",
  "distance": "8.5 km",
  "elevation": "600 ft",
  "duration": "3h 30m",
  "waypoints": [...],
  "accomplishments": [...]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hike completed successfully"
}
```

---

### Goals (`/api/goals`)

#### GET `/api/goals`

Get all goals for current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal_001",
      "userId": "abc123xyz",
      "type": "distance",
      "target": 100,
      "current": 75.5,
      "unit": "km",
      "status": "active",
      "deadline": "2024-12-31T23:59:59Z"
    }
  ]
}
```

#### POST `/api/goals`

Create a new goal.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "type": "distance",
  "target": 100,
  "unit": "km",
  "deadline": "2024-12-31"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "goal_002",
    "type": "distance",
    "target": 100
  }
}
```

---

### Friends (`/api/friends`)

#### GET `/api/friends`

Get user's friends list.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "friend_001",
      "userId": "xyz789",
      "displayName": "Jane Smith",
      "photoURL": "https://example.com/jane.jpg",
      "totalHikes": 30,
      "status": "accepted"
    }
  ]
}
```

#### POST `/api/friends/request`

Send friend request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "recipientId": "xyz789"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Friend request sent"
}
```

#### PUT `/api/friends/:id/accept`

Accept friend request.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Friend request accepted"
}
```

---

### Feed (`/api/feed`)

#### GET `/api/feed`

Get activity feed.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_001",
      "userId": "xyz789",
      "userName": "Jane Smith",
      "type": "hike_completed",
      "data": {
        "hikeTitle": "Mountain Trail",
        "distance": "10.5 km"
      },
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### Gear (`/api/gear`)

#### GET `/api/gear`

Get user's gear list.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "gear_001",
      "name": "Hiking Boots",
      "category": "Footwear",
      "weight": 1.2,
      "notes": "Waterproof, good grip"
    }
  ]
}
```

#### POST `/api/gear`

Add new gear item.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Backpack",
  "category": "Equipment",
  "weight": 0.8,
  "notes": "30L capacity"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "gear_002",
    "name": "Backpack"
  }
}
```

---

### Discover (`/api/discover`)

#### GET `/api/discover/popular`

Get popular hiking locations.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "location": "Table Mountain",
      "hikeCount": 156,
      "averageDistance": "12.3 km",
      "difficulty": "Moderate"
    }
  ]
}
```

---

### Planned Hikes (`/api/planned-hikes`)

#### GET `/api/planned-hikes`

Get planned hikes.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "planned_001",
      "title": "Weekend Hike",
      "location": "Kirstenbosch",
      "plannedDate": "2024-01-25",
      "estimatedDistance": 8.0,
      "difficulty": "Easy"
    }
  ]
}
```

---

### Chat (`/api/chat`)

#### GET `/api/chat/conversations`

Get all conversations for the current user ordered by last message time.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123xyz_xyz789abc",
      "participants": ["abc123xyz", "xyz789abc"],
      "otherUser": {
        "uid": "xyz789abc",
        "displayName": "Jane Smith",
        "email": "jane@example.com",
        "location": {"latitude": -33.9, "longitude": 18.4}
      },
      "lastMessage": "See you at the trailhead...",
      "lastMessageTime": "2024-02-01T09:30:00Z",
      "lastMessageSender": "abc123xyz"
    }
  ]
}
```

#### GET `/api/chat/conversation/:userId`

Get or create a one-on-one conversation with a specific user and return its metadata.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "abc123xyz_xyz789abc",
    "participants": ["abc123xyz", "xyz789abc"],
    "otherUser": { "uid": "xyz789abc", "displayName": "Jane Smith" },
    "lastMessage": "",
    "lastMessageTime": "2024-02-01T09:00:00Z"
  }
}
```

#### GET `/api/chat/messages/:conversationId`

Get the most recent messages for a conversation (default limit 50).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): number of recent messages to return

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_001",
      "senderId": "abc123xyz",
      "recipientId": "xyz789abc",
      "content": "Meet at 7am?",
      "createdAt": "2024-02-01T09:25:00Z",
      "read": false
    }
  ]
}
```

#### POST `/api/chat/send`

Send a message in a conversation.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "conversationId": "abc123xyz_xyz789abc",
  "recipientId": "xyz789abc",
  "content": "See you then!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "msg_002",
    "senderId": "abc123xyz",
    "recipientId": "xyz789abc",
    "content": "See you then!",
    "createdAt": "2024-02-01T09:31:00Z",
    "read": false
  }
}
```

#### PUT `/api/chat/mark-read/:conversationId`

Mark all unread messages addressed to the current user in the conversation as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "markedCount": 3 }
}
```

#### GET `/api/chat/unread-count`

Get the total number of unread messages across all conversations for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

---

### Hike Invitations (`/api/hike-invites`)

#### POST `/api/hike-invites/send`

Send a hike invitation to a friend.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "friendId": "xyz789abc",
  "hikeId": "hike_123",
  "hikeDetails": {
    "title": "Table Mountain Sunrise",
    "location": "Cape Town",
    "plannedDate": "2024-02-10T05:30:00Z"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "invite_001",
    "status": "pending"
  }
}
```

#### GET `/api/hike-invites/pending`

Get pending invitations for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "invite_001",
      "fromUserId": "abc123xyz",
      "toUserId": "xyz789abc",
      "hikeId": "hike_123",
      "hikeDetails": { "title": "Table Mountain Sunrise" },
      "status": "pending",
      "createdAt": "2024-02-01T09:15:00Z"
    }
  ]
}
```

#### GET `/api/hike-invites/pending/count`

Get the number of pending invitations for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "count": 2 }
}
```

#### POST `/api/hike-invites/:invitationId/accept`

Accept a hike invitation and add the hike to the recipient's planner.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "status": "accepted" },
  "message": "Invitation accepted and hike added to your planner"
}
```

#### POST `/api/hike-invites/:invitationId/reject`

Reject a hike invitation.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "status": "rejected" },
  "message": "Invitation rejected"
}
```

#### GET `/api/hike-invites/:invitationId`

Get a specific invitation by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "invite_001",
    "fromUserId": "abc123xyz",
    "toUserId": "xyz789abc",
    "status": "pending"
  }
}
```

#### GET `/api/hike-invites/sent/all`

Get invitations sent by the current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "invite_001", "toUserId": "xyz789abc", "status": "pending" }
  ]
}
```

#### DELETE `/api/hike-invites/:invitationId`

Cancel a pending invitation (sender only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "status": "cancelled" },
  "message": "Invitation cancelled"
}
```

---



## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional information"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## Rate Limiting

- **Authenticated requests**: 100 requests per minute
- **Public endpoints**: 20 requests per minute

---

---

## Related Documentation

- **Public API**: See [Public API Documentation](public_api_documentation.md) for external developer endpoints
- **Setup Guide**: See [API Setup Guide](developer_guides/api_setup.md) for development setup

---

_This document covers the internal API endpoints for authenticated users. For public API endpoints designed for external developers, see [Public API Documentation](public_api_documentation.md)._
