# Database Documentation

This document defines the complete database structure for the Hiking Logbook application.

## Overview

The Hiking Logbook uses **Firebase Firestore (NoSQL)** to store all application data. The database supports:

- User authentication and profiles
- Hike logging with GPS tracking
- Goal and achievement tracking
- Social features (friends, activity feed)
- Gear checklist management
- Planned hikes

---

## Collections

### 1. `users/`

Stores user profile information and preferences.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | String | Firebase Auth UID (document ID) |
| `email` | String | User's email address |
| `displayName` | String | User's display name |
| `bio` | String | User biography (optional) |
| `photoURL` | String | Profile picture URL (optional) |
| `location` | GeoPoint | User's location (lat, lng) |
| `preferences` | Object | User preferences (difficulty, terrain) |
| `stats` | Object | User statistics (totalHikes, totalDistance, etc.) |
| `gearChecklist` | Array | User's gear checklist items |
| `createdAt` | Timestamp | Account creation date |
| `updatedAt` | Timestamp | Last profile update |

**Example:**
```json
{
  "uid": "abc123xyz",
  "email": "hiker@example.com",
  "displayName": "John Doe",
  "bio": "Weekend hiker from Cape Town",
  "location": { "latitude": -33.9249, "longitude": 18.4241 },
  "preferences": {
    "difficulty": "Moderate",
    "terrain": "Mountain"
  },
  "stats": {
    "totalHikes": 25,
    "totalDistance": 150.5,
    "totalDuration": 1200
  },
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Gear Checklist Structure:**
```json
{
  "item": "Hiking Boots",
  "checked": false
}
```

**Default Gear Checklist:**
```json
[
  { "item": "Hiking Boots", "checked": false },
  { "item": "Water (3L)", "checked": false },
  { "item": "Trail Snacks", "checked": false },
  { "item": "First Aid Kit", "checked": false }
]
```

---

### 2. `hikes/`

Stores completed hike records with GPS data.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique hike identifier (document ID) |
| `userId` | String | Owner user ID |
| `title` | String | Hike title |
| `location` | String | Hike location |
| `distance` | String | Distance in km (e.g., "12.5 km") |
| `elevation` | String | Elevation gain (e.g., "800 ft") |
| `duration` | String | Duration (e.g., "3h 45m") |
| `difficulty` | String | Easy, Moderate, or Hard |
| `status` | String | completed, active, or paused |
| `date` | String/Timestamp | Hike date |
| `startTime` | Timestamp | Start time |
| `endTime` | Timestamp | End time |
| `waypoints` | Array | GPS waypoints (see structure below) |
| `accomplishments` | Array | Achievements during hike (see structure below) |
| `weather` | String | Weather conditions |
| `notes` | String | User notes |
| `isPinned` | Boolean | Whether hike is pinned |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last update |

**Waypoint Structure:**
```json
{
  "id": "wp_001",
  "latitude": -33.9249,
  "longitude": 18.4241,
  "altitude": 1085,
  "timestamp": "2024-01-15T10:30:00Z",
  "distance": 2.5,
  "notes": "Beautiful viewpoint"
}
```

**Accomplishment Structure:**
```json
{
  "id": "acc_001",
  "text": "Reached the summit!",
  "distance": 5.2,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

### 3. `plannedHikes/`

Stores future hike plans.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique planned hike ID |
| `userId` | String | Owner user ID |
| `title` | String | Planned hike title |
| `location` | String | Planned location |
| `plannedDate` | Timestamp | Intended hike date |
| `estimatedDistance` | Number | Estimated distance in km |
| `difficulty` | String | Expected difficulty |
| `notes` | String | Planning notes |
| `createdAt` | Timestamp | Creation timestamp |

---

### 4. `goals/`

Stores user-defined hiking goals.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique goal ID |
| `userId` | String | Owner user ID |
| `type` | String | distance, elevation, consistency, or hike_count |
| `target` | Number | Target value |
| `current` | Number | Current progress |
| `unit` | String | km, ft, days, or hikes |
| `deadline` | Timestamp | Goal deadline |
| `status` | String | active, completed, or failed |
| `createdAt` | Timestamp | Creation timestamp |

**Example:**
```json
{
  "id": "goal_001",
  "userId": "abc123xyz",
  "type": "distance",
  "target": 100,
  "current": 75.5,
  "unit": "km",
  "deadline": "2024-12-31T23:59:59Z",
  "status": "active"
}
```

---

### 5. `friends/`

Stores friendship connections between users.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique friendship ID |
| `requesterId` | String | User who sent request |
| `recipientId` | String | User who received request |
| `status` | String | pending, accepted, or declined |
| `createdAt` | Timestamp | Request timestamp |

---

### 6. `activities/`

Stores activity feed entries.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique activity ID |
| `userId` | String | User who performed activity |
| `type` | String | hike_completed, goal_achieved, badge_earned |
| `data` | Object | Activity-specific data |
| `visibility` | String | public, friends, or private |
| `createdAt` | Timestamp | Activity timestamp |

---

### 7. `externalHikes/`

Stores hikes submitted via public API.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique external hike ID |
| `externalUserId` | String | External system user ID |
| `source` | String | Source system (gps_watch, app_name) |
| `hikeData` | Object | Complete hike data |
| `processed` | Boolean | Processing status |
| `createdAt` | Timestamp | Submission timestamp |

---

## Security Rules

Firebase Firestore security rules ensure data protection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can manage their own hikes
    match /hikes/{hikeId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Similar rules for goals, plannedHikes, gear
    
    // Activities readable by friends
    match /activities/{activityId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isFriend(request.auth.uid, resource.data.userId));
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Indexes

Required composite indexes for efficient queries:

1. **hikes** - `(userId ASC, date DESC)`
2. **hikes** - `(userId ASC, status ASC, date DESC)`
3. **goals** - `(userId ASC, status ASC)`
4. **friends** - `(requesterId ASC, status ASC)`
5. **activities** - `(userId ASC, createdAt DESC)`

---

## Why Firebase Firestore?

1. **Real-time synchronization** - Instant updates across devices
2. **Scalability** - Automatic scaling with user growth
3. **Offline support** - Data persistence without internet
4. **Security** - Fine-grained access control with security rules
5. **Integration** - Seamless Firebase Auth integration
6. **NoSQL flexibility** - Schema-less structure for variable data

---

_For setup instructions, see [Database Setup Guide](developer_guides/database_setup.md)_
