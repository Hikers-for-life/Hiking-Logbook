# Strategy Roadmap
This document aligns our vision, process, and delivery for the Hiking Logbook. It covers methodology, user stories with acceptance tests, goals & alignment, development roadmap, and our project structure.

## 1. Project Structure
Our structure is designed to support **clarity, scalability, collaboration, and maintainability**.
---

### 🖥️ `frontend/`

- Contains the **React.js frontend application**.
- All user-facing code lives here (UI components, routing, styling, state management).
- Separated from backend to:
  - Keep the UI codebase lightweight and modular.
  - Allow frontend developers to work independently.
  - Enable deployment to Firebase Hosting without including backend logic.

---

### ⚙️ `backend/`

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

### 📖 `docs/`

- Dedicated space for **project documentation**.
- Includes:
  - A README with a table of content of all the documents in the docs file.
  - All the project documents.
- Separating documentation ensures it doesn’t clutter code folders and makes it easy for new contributors to onboard.

---

### ✅ Benefits of This Structure

1. **Clarity** → Clear separation of concerns (frontend, backend, docs, tests).  
2. **Scalability** → Each part can grow independently .  
3. **Collaboration** → Different team members can work in parallel without conflicts.  
4. **Maintainability** → Easier debugging and refactoring since responsibilities are separated.  
5. **CI/CD Friendly** → Branch rules and pipelines can run targeted checks (lint, tests, coverage) for each part.
6. This structure is flexible enough to support future growth.

---

This project structure follows **modern full-stack best practices** and aligns with the **Agile workflow and CI/CD pipelines** used by the team.


## 2. Project Management Methodology

### Agile (Scrum-Based Approach)
We have chosen **Agile (Scrum-based)** as our project management methodology. Agile allows us to work iteratively, adapt to changing requirements, and deliver value to users continuously. This is particularly important for our Hiking Logbook project, where user feedback and evolving features will shape the product.

**Why Agile (Scrum)?**
- Encourages collaboration within the team and with stakeholders.
- Allows us to deliver functional increments of the product after each sprint.
- Provides flexibility to adjust scope and priorities based on feedback.
- Focuses on user needs through user stories and acceptance criteria.
- Reduces risks by identifying and addressing challenges early.

**How We Will Implement Scrum:**
- **Sprints**: The first sprint is on the 19th of August and we should deliver the project setup and initial designs, the second sprint is on the 2nd of September and we should deliver the first features being implemented, the third sprint is on the 29th of September and we should deliver the final features being implemented, and the forth sprint is on the 19th of October and our website should be complete by then and bug-free.
- **Ceremonies**:
  - *Sprint Planning*: We meet at the start of each sprint to set a Sprint Goal and select backlog items that align with capacity and priority and breakdown our user stories into tasks where each and everyone of us is assigned a task on github projects.
  - *Daily Standups*: We hold our meetings on WhatsApp to track progress, plans, and blockers. We capture proof of meetings.
  - *Sprint Review*: Demo completed features to client. We collect feedback and adjust the Product Backlog priorities.
  - *Sprint Retrospective*: We meet at the end of each sprint to reflect on what went well, what can improve, and agree on actionable improvements for the next sprint.
  - *Backlog Refinement*: We have a session to clarify, split, and estimate upcoming user stories and prioritise certain backlog items over others.
- **Roles**:
  - *Scrum Master*, Ntokozo Skosana: facilitates the scrum process.
  - *Development Team*, Risuna Ntimana, Naledi Mogomotsi, Stelly Jane, Annah Mlimi, Ntokozo Skosana: Responsible for delivering features.

---

## 3. User Stories and Acceptance Tests

### User Stories
1. **Plan Your Adventures**
   - As a hiker, I want to schedule hikes, check weather conditions, and create itineraries so that I can prepare better for my trips.
   
2. **Connect with Friends**
   - As a user, I want to invite friends and share hiking experiences so that hiking becomes more social and engaging.
   
3. **Track Achievements**
   - As a hiker, I want to set goals, earn badges, and track milestones so that I can stay motivated.
   
4. **Capture Memories**
   - As a user, I want to add photos, notes, and logs for my hikes so that I can document my journey.
   
5. **GPS Integration**
   - As a hiker, I want to track my route, save waypoints, and navigate trails confidently using GPS data.
   
6. **Progress Analytics**
   - As a user, I want to visualize statistics and improvements over time so that I can analyze my outdoor activities.
   
7. **User Profile**
   - As a user, I want to create and manage my profile so that my hikes and achievements are personalized.
   
8. **Start Your Journey Button**
   - As a user, I want a clear entry point to start a new hike so that I can begin quickly and easily.

---

### User Acceptance Tests

1. **Plan Your Adventures**
   - *Given* I am an authenticated user And I am on the Hike Planner page *When* I enter a route, date, start time, and difficulty And I request the weather for the selected date and location *Then* the system fetches and displays the forecast And the planned hike is saved with itinerary details.  
   - *Given* I have an existing planned hike *When* I update the start time and notes *Then* the changes are saved and visible on my planner.  
   - *Given* I have an existing planned hike *When* I delete the planned hike *Then* it no longer appears in my upcoming hikes list.  

2. **Connect with Friends**
   - *Given* I am an authenticated user And I have searched for a friend by email or username *When* I send a friend request *Then* the recipient sees a pending invitation. 
   - *Given* I am an authenticated user And I have searched for a friend by email or username *When* the recipient accepts the invitation *Then* we both appear in each other's friends list.
   - *Given* I have a completed hike *When* I set its visibility to "Friends" *Then* it appears in my friends' activity feeds.  

3. **Track Achievements**
   - *Given* I am on my Achievements page *When* I create a goal of 50 miles for the current month *Then* the goal is saved and visible in my goals list.  
   - *Given* badges are defined for distance milestones And my total distance reaches 100 miles
  *When* the system recalculates achievements *Then* I receive the "Century Hiker" badge.  

4. **Capture Memories**
   - *Given* I have a completed hike
  *When* I upload one or more photos and add a note *Then* the media and note are stored and displayed on the hike detail page.  
   - *Given* I am viewing a hike detail page *When* I edit the notes field *Then* the notes update without a page refresh.  

5. **GPS Integration**  

6. **Progress Analytics** 

7. **User Profile** 

8. **Start Your Journey Button** 

---

## 4. Goals

- Deliver a fully functional Hiking Logbook web application.  
- Enable users to plan, track, and share their hiking experiences seamlessly.  
- Provide reliable integrations (Firebase backend, Google Maps/GPS, Weather API).  
- Ensure smooth user experience through analytics, achievements, and personalization.  
- Support social features to build a hiking community.  

---

## 5. Project Alignment

The project aligns with:
- **End-User Needs**: Provides adventure planning, social sharing, and personal growth tools.  
- **Technology Choices**: React.js frontend with Firebase backend ensures scalability and real-time capabilities.  
- **Agile Values**: Focuses on working software, responding to change, and customer collaboration. 

🧱 Scope & Key Features

🗺️ Plan Your Adventures – schedule hikes, view weather, set start times & itineraries.

🤝 Connect with Friends – invite friends, share hikes, activity feed.

🏅 Track Achievements – goals, badges, milestones, streaks.

📸 Capture Memories – photos, notes, detailed logs.

📡 GPS Integration – live route tracking, waypoints, map navigation.

📊 Progress Analytics – charts for distance, elevation, duration, trends.

👤 User Profile – history, badges, preferences, privacy.

🚀 Start Your Journey – central CTA to plan/log/track a hike.

---

## 6. Development Roadmap

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

