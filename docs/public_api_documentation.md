# Hiking Logbook Public API Documentation

## Overview

The Hiking Logbook Public API lets you access hiking data and statistics from our platform. You can use it to build apps, websites, or other projects that need hiking information.

## Getting Started

- **Base URL**: `https://hiking-logbook-hezw.onrender.com` (Production) | `http://localhost:3001` (Development)
- **API Version**: 1.0.0
- **Documentation**: [Interactive Swagger UI](/api-docs)
- **Authentication**: API Key (for write operations)

## Available Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|--------------|
| `GET` | `/api/public/health` | Check if the API is working |
| `GET` | `/api/public/stats` | Global hiking statistics across all users|
| `GET` | `/api/public/badges` | See available achievement badges |
| `GET` | `/api/public/locations` | Get popular hiking locations |

### Protected Endpoints (API Key Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/public/hikes` | Submit hike data from external systems |
| `GET` | `/api/public/key-info` | Get information about your API key |

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

**Last Updated**: September 2024  
**API Version**: 1.0.0