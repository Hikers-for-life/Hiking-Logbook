# Strategy Roadmap
This document aligns our vision, process, and delivery for the Hiking Logbook. It covers project structure, goals & alignment, and development roadmap.

> **Note**: For detailed methodology information, see [Project Methodology](../methodology/methodology.md)

## 1. Project Structure
Our structure is designed to support **clarity, scalability, collaboration, and maintainability**.
---

###  `frontend/`

- Contains the **React.js frontend application**.
- All user-facing code lives here (UI components, routing, styling, state management).
- Separated from backend to:
  - Keep the UI codebase lightweight and modular.
  - Allow frontend developers to work independently.
  - Enable deployment to Firebase Hosting without including backend logic.

---

###  `backend/`

- Contains the **Firebase backend application** (Cloud Functions, server logic, API endpoints).
- Responsible for:
  - Authentication & security (via Firebase Auth).
  - Storing data (via Firestore).
  - Providing REST APIs consumed by the frontend.
- Separation from frontend ensures:
  - Clear distinction between **client-side** and **server-side** logic.
  - Easier maintenance and scaling.
  - Supports future microservices-oriented design.

---

###  `docs/`

- Dedicated space for **project documentation**.
- Includes:
  - A README with a table of content of all the documents in the docs file.
  - All the project documents.
- Separating documentation ensures it doesn’t clutter code folders and makes it easy for new contributors to onboard.

---

###  Benefits of This Structure

1. **Clarity** → Clear separation of concerns (frontend, backend, docs, tests).  
2. **Scalability** → Each part can grow independently .  
3. **Collaboration** → Different team members can work in parallel without conflicts.  
4. **Maintainability** → Easier debugging and refactoring since responsibilities are separated.  
5. **CI/CD Friendly** → Branch rules and pipelines can run targeted checks (lint, tests, coverage) for each part.
6. This structure is flexible enough to support future growth.

---

This project structure follows **modern full-stack best practices** and aligns with the **Agile workflow and CI/CD pipelines** used by the team.

## 2. Goals

- Deliver a fully functional Hiking Logbook web application.  
- Enable users to plan, track, and share their hiking experiences seamlessly.  
- Provide reliable integrations (Firebase backend, Google Maps/GPS, Weather API).  
- Ensure smooth user experience through analytics, achievements, and personalization.  
- Support social features to build a hiking community.  

---

## 3. Project Alignment

The project aligns with:
- **End-User Needs**: Provides adventure planning, social sharing, and personal growth tools.  
- **Technology Choices**: React.js frontend with Firebase backend ensures scalability and real-time capabilities.  
- **Agile Values**: Focuses on working software, responding to change, and customer collaboration. 

 Scope & Key Features

 Plan Your Adventures – schedule hikes, view weather, set start times & itineraries.

 Connect with Friends – invite friends, share hikes, activity feed.

 Track Achievements – goals, badges, milestones, streaks.

 Capture Memories – photos, notes, detailed logs.

 GPS Integration – live route tracking, waypoints, map navigation.

 Progress Analytics – charts for distance, elevation, duration, trends.

 User Profile – history, badges, preferences, privacy.

 Start Your Journey – central CTA to plan/log/track a hike.

---

## 4. Development Roadmap

### Phase 1: Core Setup
- Initialize repository and project structure.  
- Set up CI/CD pipeline. 
- Create Firebase Account.
- Integrate code quality tools.
- Create a documentation site (GitHub Pages). 
- Implement Firebase authentication. 
- Set up GitHub Projects for workplanning.
- Define initial backlog and Agile workflow.
- Implement authentication (sign-up, login). 
*Milestone*: Users can register and log in successfully.

### Phase 2: Core Features
- Implement hike logging (location, distance, elevation, notes).  
- Add ability to view past hikes in a list view.  
- Weather API integration.
- Build “Start Your Journey” button → directs to hike creation page.
- Create basic User Profile management. 
*Milestone*: A user can log hikes, view them, and update their profile. 

### Phase 3: Social Features
- Friend connections and shared hikes.  
- Achievement and badges system.  
*Milestone*: A user can receieve awards for hikes completed.

### Phase 4: Advanced Features
- GPS integration for live tracking.  
- Progress analytics with visualization.  
- Memory capture (photos, notes).
- Add ability to edit or delete hikes. 
*Milestone*: A user can see their hiking progress visually. 

### Phase 5: Testing & Deployment
- Unit tests, integration tests, and CI pipeline coverage.  
- Final refinements based on feedback.  
- Deployment to production.
*Milestone*: The app is stable, tested, and ready for release.  

---






