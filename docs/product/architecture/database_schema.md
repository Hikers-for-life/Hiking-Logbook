# Database Schema (Sprint 1)

This document defines the database structure for Sprint 1 of the Hiking Logbook application, focusing on **basic user profile storage** using Firebase **Firestore (NoSQL)**.

---

## Collections & Fields

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

For Sprint 1, only this collection is needed. More collections (hikes, planner, etc.) will be added in later sprints.
