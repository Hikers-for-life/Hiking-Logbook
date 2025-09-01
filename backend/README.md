# Hiking Logbook Backend

## What's Set Up

### **Firestore Structure**
- `users` collection with subcollections
- `users/{userId}/hikes` for storing hike data
- Existing data structure preserved

### **Hike Schema** (`src/models/logbookSchema.js`)
- **Basic info**: title, location, route, difficulty, weather
- **Timing**: start/end times, duration, dates
- **GPS tracking**: waypoints, coordinates, route maps
- **Physical metrics**: distance, elevation
- **Status**: active, paused, completed, draft

### **Database Functions** (`src/config/database.js`)
- `addHike()` - Add new hike with field mapping
- `getUserHikes()` - Get hikes with filtering
- `startHike()` - Begin GPS tracking
- `addWaypoint()` - Add GPS waypoints
- `completeHike()` - Finish hike tracking
- `getUserHikeStats()` - Calculate statistics

## Available Scripts

```bash
# Check Firestore structure
npm run check-firestore

# Check existing hike field structure
npm run check-hike-structure
```

## Next Steps

1. **Update your routes** to use `dbUtils.addHike()` instead of local state
2. **Test with existing data** - the functions handle field mapping automatically
3. **Add GPS tracking** to your active hikes
4. **Enjoy your comprehensive hiking logbook!**

## Key Features

- **Field mapping**: Works with existing data structure
- **GPS support**: Waypoints, coordinates, route tracking
- **Filtering**: Search by status, difficulty, date
- **Statistics**: Total hikes, distance, elevation breakdowns
- **Backward compatible**: No data migration needed
