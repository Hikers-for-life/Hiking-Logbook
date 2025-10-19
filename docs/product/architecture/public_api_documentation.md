# Hiking Logbook Public API Documentation

## Overview

The Hiking Logbook Public API provides hiking data and statistics to external developers and systems. This API enables third-party applications to integrate hiking community data without building their own database.

## Purpose and Value Proposition

### What Makes This API Public-Facing

Unlike our internal app (which users access directly through the web interface), this Public API provides value to:

1. **External Developers** - Build hiking-related apps using our community data
2. **Fitness Platforms** - Integrate hiking statistics into broader fitness tracking systems
3. **Tourism Websites** - Display popular hiking locations and trends
4. **Research Projects** - Access anonymized hiking data for analysis
5. **Third-Party Devices** - GPS watches, fitness trackers can submit hike data to our platform

### Key Differentiator from Internal App

Our **internal app** (frontend) is for hikers to log and track their own personal hikes. The **public API** allows external systems to:
- Access aggregated community data (not available in the user-facing app)
- Submit hikes from external sources (GPS devices, other apps)
- Build completely different applications using our hiking database
- Integrate hiking data into non-hiking platforms

## Getting Started

- **Base URL**: `https://hiking-logbook-hezw.onrender.com` (Production) | `http://localhost:3001` (Development)
- **API Version**: 1.0.0
- **Documentation**: [Interactive Swagger UI](https://hiking-logbook-hezw.onrender.com/api-docs)
- **Authentication**: API Key (for write operations)

## Available Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description | External Use Case |
|--------|----------|--------------|-------------------|
| `GET` | `/api/public/health` | Check if the API is working | API monitoring, uptime checks |
| `GET` | `/api/public/stats` | Global hiking statistics across all users| Tourism sites showing hiking trends |
| `GET` | `/api/public/badges` | See available achievement badges | Gamification systems, external apps |
| `GET` | `/api/public/locations` | Get popular hiking locations | Travel apps, recommendation engines |

### Protected Endpoints (API Key Required)

| Method | Endpoint | Description | External Use Case |
|--------|----------|-------------|-------------------|
| `POST` | `/api/public/hikes` | Submit hike data from external systems | GPS watches, fitness trackers, other hiking apps |
| `GET` | `/api/public/key-info` | Get information about your API key | API usage monitoring, debugging |

## Unique Value for External Developers

### What the Public API Provides That the Internal App Does NOT:

#### 1. Popular Locations Endpoint (`/api/public/locations`)
**What it does differently:**
- **Internal App**: Users only see their OWN logged hikes and can manually enter location names
- **Public API**: Provides aggregated data showing which locations are MOST POPULAR across ALL users
- **External Use**: Tourism websites can display trending hiking spots, travel apps can recommend popular trails based on community activity

**Why it's unique:** The internal app doesn't have a "popular locations" feature - users can't see what locations other hikers are visiting most. This data is ONLY accessible via the public API.

#### 2. Global Statistics Endpoint (`/api/public/stats`)
**What it does differently:**
- **Internal App**: Users see their OWN personal statistics (total hikes, distance, etc.)
- **Public API**: Provides COMMUNITY-WIDE statistics (total users, total hikes across everyone, global trends)
- **External Use**: Fitness platforms can show "Join X hikers who've logged Y km", news sites can report hiking trends

**Why it's unique:** Individual users in the app cannot see global community statistics - they only see their personal dashboard. Public API exposes this aggregated data.

#### 3. Badge/Achievement Definitions (`/api/public/badges`)
**What it does differently:**
- **Internal App**: Users see which badges THEY have earned based on their activity
- **Public API**: Provides the complete list of ALL possible badges and requirements (metadata)
- **External Use**: Other hiking apps can implement the same achievement system, gamification platforms can integrate our badge framework

**Why it's unique:** While users see their earned badges, they don't get structured metadata about ALL possible achievements. External developers need this to build compatible systems.

#### 4. External Hike Submission (`/api/public/hikes`)
**What it does differently:**
- **Internal App**: Users log hikes through the web interface manually or via GPS tracking
- **Public API**: Allows AUTOMATED submissions from external devices/systems without user login
- **External Use**: GPS watches can auto-sync hikes, other fitness apps can send their hiking data to our platform, IoT devices can submit trail data

**Why it's unique:** This is a completely different data ingestion path - it's for machine-to-machine communication, not human users. External systems can contribute to our hiking database without requiring users to manually re-enter data.

## Authentication

Most endpoints don't need authentication. Only when you want to submit hike data do you need an API key.

**Test API Keys:**
- **Full Access**: `demo-key-12345` (can read and submit data)
- **Read Only**: `readonly-key-67890` (can only read data)

**How to use API Keys:**
Add this header to your request:
```
X-API-Key: demo-key-12345
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Data Submission

### Submit Hike Data

**Endpoint:** `POST /api/public/hikes`

**Headers you need:**
- `Content-Type: application/json`
- `X-API-Key: demo-key-12345`

**Required information:**
- `externalUserId` (string): Your user ID
- `title` (string): Name of the hike
- `location` (string): Where the hike happened

**Optional information:**
- `distance` (number): Distance in kilometers
- `elevation` (number): Elevation gain in meters
- `difficulty` (string): Easy, Moderate, or Hard
- `date` (string): When the hike happened
- `duration` (number): How long it took (hours)
- `weather` (string): Weather conditions
- `notes` (string): Any extra notes

**Example Request:**
```json
{
  "externalUserId": "user123",
  "title": "Morning Mountain Trail",
  "location": "Table Mountain, Cape Town",
  "distance": 12.5,
  "elevation": 800,
  "difficulty": "Moderate",
  "date": "2024-01-15T08:00:00Z",
  "duration": 4.5,
  "weather": "Sunny, 22°C",
  "notes": "Beautiful views at the summit!"
}
```

## Testing the API

### Using Postman
1. Open Postman
2. Create a new request
3. Set the URL to `http://localhost:3001/api/public/health`
4. Click Send
5. You should get a success response!

### Using curl (Command Line)
```bash
curl http://localhost:3001/api/public/health
```

## Common Error Codes

| Code | What it means |
|------|---------------|
| `200` | Success |
| `201` | Created (successful data submission) |
| `400` | Bad Request (missing or invalid data) |
| `401` | Unauthorized (missing or wrong API key) |
| `403` | Forbidden (API key doesn't have permission) |
| `404` | Not Found (wrong URL) |
| `500` | Server Error (something went wrong on our end) |

## Data Privacy

- External hike submissions are stored separately from user data
- Submitted data may be reviewed before inclusion in public statistics
- No personal information is exposed in public endpoints
- All data is anonymized in global statistics


## Need Help?

- **Production**: Check the [Interactive Swagger UI](https://hiking-logbook-hezw.onrender.com/api-docs) for detailed testing
- **Development**: Check the [Interactive Swagger UI](http://localhost:3001/api-docs) for local testing
- All endpoints have examples you can try
- Start with the health endpoint to make sure everything is working

---

**Last Updated**: October 2025  
**API Version**: 1.0.0
