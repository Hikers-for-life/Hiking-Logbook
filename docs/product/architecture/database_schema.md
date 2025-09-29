# Hiking Logbook Database Schema

This document defines the evolving database structure for the Hiking Logbook application.  

We are using **Firebase Firestore (NoSQL)** to store data. The schema has been developed incrementally across sprints:  

- **Sprint 1** → User profiles  
- **Sprint 2** → Hikes (Logbook entries) & Trails  
- **Sprint 3** → Goals, Achievements, Activity Feed, and Stats  

---

## Sprint 1 — User Profiles

The first sprint focused on basic **user profile storage**.  

### `users` collection  

Each document ID = user `uid`.  

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| uid         | String   | Firebase UID                          |
| email       | String   | User’s email                          |
| displayName | String   | Name shown on profile                 |
| bio         | String   | Short user description (optional)     |
| photoURL    | String   | Profile picture (optional)            |
| location    | geopoint | GPS coordinates (latitude, longitude) |
| createdAt   | Date     | Timestamp of account creation         |

---

## Sprint 2 — Hikes & Logbook

In Sprint 2 we extended the schema to support the **Logbook feature**, where users can track their hikes.  

### `hikes` collection  

Each document represents a logged hike.  

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| title       | String   | Short name/title of the hike          |
| location    | String   | Place or trail name                   |
| date        | Date     | When the hike took place              |
| distance    | Number   | Distance covered (in kilometers)      |
| duration    | Number   | Duration of the hike (in minutes)     |
| notes       | String   | Optional notes of the hike            |
| userId      | String   | Reference to users.uid who logged the hike |
| createdAt   | Date     | Timestamp when entry was created      |
| updatedAt   | Date     | Last update timestamp                 |
| difficulty  | String   | Easy / Moderate / Hard                |
| status      | String   | In Progress / Completed / Paused      |
| weather     | String   | Weather description (e.g., Sunny, Rainy) |
| elevation   | Number   | Elevation gain (meters, optional)     |
| isPinned    | Boolean  | Whether the hike is pinned by the user |

---

### `trails` collection (future-ready)  

Each document represents a reusable trail entry that users can log against.  

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| name        | String   | Trail name                            |
| location    | String   | General location of the trail         |
| description | String   | Optional description                  |
| difficulty  | String   | Easy / Moderate / Hard                |
| distance    | Number   | Trail length in kilometers            |
| createdAt   | Date     | Timestamp                             |

---

## Sprint 3 — Goals, Achievements & Activity

Sprint 3 introduces **gamification, planning, and social features**.  

### `goals` collection  

Stores user-defined hiking goals (distance, hikes, streaks).  

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| userId      | String   | Reference to users.uid                |
| title       | String   | Goal title (e.g., "100 km in June")   |
| type        | String   | Goal type: Distance / Duration / Streak / HikeCount |
| targetValue | Number   | Target number (e.g., 100 km, 10 hikes)|
| progress    | Number   | Current progress towards goal         |
| status      | String   | Active / Completed / Archived         |
| createdAt   | Date     | Timestamp when goal was set           |

---

### `achievements` collection  

Achievements system for users.  

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| userId      | String   | Reference to users.uid                |
| badge       | String   | Name of achievement/badge             |
| description | String   | What the badge means                  |
| earnedAt    | Date     | Timestamp when badge was awarded      |
| hikeId      | String   | (Optional) Reference to hikes.id      |

---

### `activity_feed` collection  

Represents the social feed of hikes, pins, and achievements.  

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| userId      | String   | Reference to users.uid                |
| type        | String   | Event type: "hike_completed", "goal_completed", "achievement_unlocked", "pinned_hike" |
| hikeId      | String   | (Optional) Reference to hikes.id      |
| goalId      | String   | (Optional) Reference to goals.id      |
| createdAt   | Date     | Timestamp of activity                 |

---

### `stats` (virtual/derived collection — optional)  

This collection is **computed**, not directly stored (can be cached if needed). It summarizes progress for achievements and the dashboard.  

| Field          | Type   | Description                       |
| -------------- | ------ | --------------------------------- |
| userId         | String | Reference to users.uid            |
| totalHikes     | Number | Total hikes completed             |
| totalDistance  | Number | Total km hiked                    |
| totalDuration  | Number | Total minutes hiked               |
| streak         | Number | Current active streak (days)      |
| monthlyHistory | Array  | List of hikes per month (for charts) |

---

## Choice Justification  

We are using **Firebase Firestore (NoSQL)** because:  

1. **Scalability** – Firestore automatically scales with app usage, supporting thousands of concurrent users.  
2. **Real-time Sync** – Logbook entries update in real-time across devices, ideal for multi-device hikers.  
3. **Ease of Integration** – Firebase integrates seamlessly with authentication, hosting, and cloud functions.  
4. **Flexible Schema** – Firestore’s NoSQL structure is well-suited for variable, user-generated logbook data.  
5. **Security Rules** – Firestore provides fine-grained access control (e.g., users can only view/edit their own hikes).  

This makes Firestore the best fit for our Hiking Logbook, balancing **performance, cost, and developer velocity.**  
