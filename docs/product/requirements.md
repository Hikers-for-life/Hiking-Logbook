# Hiking Logbook – Functional & Non-Functional Requirements

> ⚠️ **Note**:  
> This document is a **living document**. Requirements may evolve as the project progresses and new feedback or constraints are introduced. All updates will be versioned and traceable via Git history.  

---

## 1. Functional Requirements

### 1.1 User Authentication & Profiles
- Users shall be able to create an account using email/password or a third-party provider (e.g., Google).  
- Users shall be able to log in and log out securely.  
- Each user profile shall contain name, email, profile picture, and friend list.  

### 1.2 Logbook Management
- Users shall be able to **add hikes** with details including:  
  - Route name  
  - Location  
  - Difficulty level  
  - Weather conditions  
  - Start and end date/time  
  - Duration  
  - Elevation gain  
  - GPS waypoints  
- Users shall be able to **edit** hikes (e.g., notes, details, attached media).  
- Users shall be able to **delete** hikes.  
- Users shall be able to **view their personal logbook** with all recorded hikes.  
- Users shall be able to **filter/search hikes** by date, difficulty, or location.  
- Users shall be able to upload **photos** associated with hikes.  

### 1.3 Hike Planning
- Users shall be able to create planned hikes with details including route, date/time, and invite list.  
- Users shall be able to view planned hikes on a dedicated planner page.  
- Users shall be able to edit or cancel planned hikes.  
- Users shall be able to invite friends to join planned hikes.  
- The system shall fetch real-time **weather forecasts** for planned hikes.  
- The system shall auto-log a hike as completed once the scheduled hike is finished (with option to adjust details).  

### 1.4 Friends & Social Features
- Users shall be able to **search for friends** by username or email.  
- Users shall be able to send and accept/reject friend requests.  
- Users shall be able to view a list of friends.  
- Users shall be able to view friends’ recent hikes and achievements in an **Activity Feed**.  
- Users shall be able to comment or react (like/celebrate) on friends’ hikes.  

### 1.5 Achievements & Goals
- Users shall be able to create custom goals (e.g., distance hiked, number of hikes, elevation gain).  
- The system shall automatically calculate progress toward goals based on logbook data.  
- Users shall be able to **pin hikes** to achievements.  
- Achievements and progress shall be displayed visually using charts/graphs.  

### 1.6 APIs & Integrations
- The system shall integrate with:  
  - **Google Maps API** (or Leaflet) for displaying routes and maps.  
  - **OpenWeather API** for weather conditions and forecasts.  
  - **Geolocation API** for tracking user location during hikes.  
- Internal APIs shall include:  
  - **Logbook API** – CRUD for hikes.  
  - **Friends API** – Manage friend relationships.  
  - **Achievements API** – Manage and compute user achievements.  
  - **Planning API** – Manage planned hikes and invites.  

---

## 2. Non-Functional Requirements

### 2.1 Performance
- The system shall load primary UI pages (logbook, planner, feed) within **2 seconds** under normal network conditions.  
- Database queries (e.g., retrieving hikes) shall return results within **500ms** for up to 10,000 records.  

### 2.2 Scalability
- The system shall support at least **1,000 concurrent users** without degradation in performance.  
- Firebase backend shall allow elastic scaling as user data grows.  

### 2.3 Security
- All authentication shall be handled using **secure methods (Firebase Auth)**.  
- All communication shall occur over **HTTPS**.  
- Users’ private data (e.g., notes, GPS waypoints) shall only be accessible to the owner and invited friends.  
- Input validation shall be enforced on both client and server side.  

### 2.4 Reliability & Availability
- The system shall provide **99% uptime** (leveraging Firebase Hosting SLA).  
- Offline mode shall allow users to log hikes, with automatic syncing once back online.  

### 2.5 Usability
- The UI shall be **responsive** and usable on desktop, tablet, and mobile.  
- Navigation shall be intuitive, with a maximum of **3 clicks** to reach any major feature.  
- Forms shall provide validation feedback (e.g., missing fields, incorrect format).  

### 2.6 Maintainability
- The system shall follow **clean code practices** (linting, Prettier).  
- All core features shall have unit and integration tests with at least **70% coverage**.  
- CI/CD pipeline shall automatically test and deploy changes.  

---

## 3. Hidden Requirements (Implied but Not Explicit in Brief)

- **Automatic Hike Logging**:  
  - If the user enables the **auto-log** option before starting a hike, the system shall automatically create a logbook entry upon completion of the hike. The log shall include key details such as route, time, distance, and weather, with the option for the user to edit or add notes afterward. 
- **Personalized Hike Recommendations:**:  
  - The system shall suggest hikes that match the user’s preferences and past activity. Recommendations shall be based on previously completed hikes (e.g., location, difficulty, distance) and user-indicated interests.  
- **Error Handling & Feedback**:  
  - The system shall provide clear error messages for failed actions (e.g., failed login, invalid hike data, API errors).  
- **Accessibility**:  
  - The UI shall follow **basic accessibility standards** (contrast, ARIA labels, keyboard navigation).  
- **Data Privacy & GDPR Compliance**:  
  - Users shall be able to delete their accounts and associated data permanently.  
- **Backups**:  
  - Firestore shall maintain redundancy and automated backups.  
- **Version Control Standards**:  
  - Code shall be managed through GitHub with feature branches, pull requests, and reviews.  
- **Documentation Maintenance**:  
  - All requirements, architecture changes, and test plans shall be kept up to date alongside code changes.  
- **Future Extensibility**:  
  - APIs and data models shall be designed with flexibility to support additional features (e.g., event-based hikes, leaderboards).  

---

## 4. Assumptions & Constraints
- Users require internet access for full functionality (except offline logging).  
- External APIs (Google Maps, OpenWeather) require valid API keys and are subject to their usage limits.  
- The project will be delivered within the academic semester timeline, using **agile sprints** for incremental delivery.  
