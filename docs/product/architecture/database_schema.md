# Database Schema (Sprint 1)

This document defines the database structure for Sprint 1 of the Hiking Logbook application, focusing on **basic user profile storage** using Firebase **Firestore (NoSQL)**. We have extended the database schema introduced in Sprint 1 by adding support for the Logbook feature. Sprint 1 focused only on user profiles, while Sprint 2 introduces structured data for hikes and logbook entries.

---

## Collections & Fields

### `users` collection (from Sprint 1)

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
### hikes collection (new for Sprint 2)

Each document represents a logged hike.

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| title       | String   | Short name/title of the hike          |
| location    | String   | Place or trail name                   |
| date        | Date     | When the hike took place              |
| distance    | Number   | Distance covered (in kilometers)      |
| duration    | Number   | Duration of the hike (in hours/minutes|
| notes       | String   | optional notes of the hike            |
| userId      | String   | Reference to users.uid who logged the hike|
| createdAt   | Date     | Timestamp when entry was created      |
| updatedAt   | Date     | Last update timestamp                 |
| difficulty  | String   | Easy / Moderate / Hard                |
| status      | String   | In Progress / Completed               |
| Weather     | Number   | Climate                               |

### trails collection (future-ready)

Each document represents a reusable trail entry that users can log against.

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| name        | String   | Trail name                            |
| location    | String   | General location of the trail         |
| description | String   | Optional description                  |
| difficulty  | String   | Easy / Moderate / Hard                |
| distance    | Number   | Trail length in kilometers            |
| createdAt   | Date     | Timestamp                             |

### achievements collection (future-ready)

achievements system for users.

| Field       | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| userId      | String   | Reference to users.uid                |
| badge       | String   | Name of achievement/badge             |
| description | String   | What the badge means                  |
| earnedAt    | Date     | Timestamp when badge was awarded      |

##### Choice Justification
We are using **Firebase Firestore (NoSQL)** as our database because:

1. **Scalability** – Firestore automatically scales with app usage, supporting thousands of concurrent users.

2. **Real-time Sync** – Logbook entries update in real-time across devices, which is ideal for multi-device hikers.

3. **Ease of Integration** – Firebase integrates seamlessly with authentication, hosting, and cloud functions.

4. **Flexible Schema** – Firestore’s NoSQL structure is well-suited for variable, user-generated logbook data.

5. **Security Rules** – Firestore provides fine-grained access control (e.g., users can only view/edit their own hikes).

This makes Firestore the best fit for our Hiking Logbook, balancing **performance, cost, and developer velocity.**



