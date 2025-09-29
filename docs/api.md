# Hiking Logbook API Documentation

This document describes the REST API endpoints for the Hiking Logbook Web App.  
All endpoints are prefixed with:


Authentication is handled using **JWT tokens**.  
Include the header in protected routes:  
`Authorization: Bearer <JWT_TOKEN>`

---

## Endpoints

### 1. Auth
| Method | Endpoint       | Description               |
| ------ | -------------- | ------------------------- |
| POST   | /auth/login    | Log in and receive a token |
| POST   | /auth/logout   | Log out the user          |
| POST   | /auth/register | Register a new user       |

---

### 2. Users
| Method | Endpoint     | Description              |
| ------ | ------------ | ------------------------ |
| GET    | /users/me    | Get current user profile |
| PUT    | /users/me    | Update user profile      |

---

### 3. Hikes
| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| GET    | /hikes                 | Get all hikes for logged-in user     |
| GET    | /hikes/:id             | Get a single hike                    |
| POST   | /hikes                 | Create a new hike                    |
| PUT    | /hikes/:id             | Update hike details                  |
| DELETE | /hikes/:id             | Delete a hike                        |
| PATCH  | /hikes/:id/pin         | Pin a hike                           |
| PATCH  | /hikes/:id/unpin       | Unpin a hike                         |
| POST   | /hikes/start           | Start tracking a hike                |
| POST   | /hikes/:id/complete    | Mark a hike as completed             |
| POST   | /hikes/:id/waypoint    | Add GPS waypoint to an active hike   |

---

### 4. Goals
| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | /goals       | Get all user goals   |
| POST   | /goals       | Create a new goal    |
| PUT    | /goals/:id   | Update a goal        |
| DELETE | /goals/:id   | Delete a goal        |

---

### 5. Stats & Progress
| Method | Endpoint                  | Description                                                         |
| ------ | ------------------------- | ------------------------------------------------------------------- |
| GET    | /hikes/stats/overview     | Get statistics summary: total hikes, distance, duration, streak, breakdowns |
| GET    | /hikes/progress           | Get monthly hike counts and streak history for charts               |

---

### 6. Planner
| Method | Endpoint        | Description                   |
| ------ | --------------- | ----------------------------- |
| GET    | /planner        | Get all planned hikes         |
| POST   | /planner        | Create a new planned hike     |
| PUT    | /planner/:id    | Update a planned hike         |
| DELETE | /planner/:id    | Delete a planned hike         |

---

## Example Requests

### Create Hike
```bash
curl -X POST http://localhost:3001/api/hikes \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Trail",
    "location": "Green Valley",
    "distance": "5 km",
    "weather": "Sunny",
    "notes": "Felt great!"
  }'

### Get stat
```bash
curl -X GET http://localhost:3001/api/hikes/stats/overview \
  -H "Authorization: Bearer <JWT_TOKEN>"
### Response (Example)
```bash
{
  "success": true,
  "data": {
    "totalHikes": 12,
    "totalDistance": 96.2,
    "totalDuration": 2400,
    "streak": 4,
    "byDifficulty": { "Easy": 5, "Moderate": 4, "Hard": 3 },
    "byStatus": { "completed": 10, "active": 1, "paused": 1 }
  }
}
### Pin a Hike
```bash
curl -X PATCH http://localhost:3001/api/hikes/123/pin \
  -H "Authorization: Bearer <JWT_TOKEN>"
### Response
```bash 
{ "message": "Hike pinned successfully" }
### Plan a Hike 
```bash
curl -X POST http://localhost:3001/api/planner \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
