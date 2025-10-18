# Project Management Methodology

## Overview

We have chosen **Scrum (Agile-based)** as our project management methodology. Agile allows us to work iteratively, adapt to changing requirements, and deliver value to users continuously. This is particularly important for our Hiking Logbook project, where user feedback and evolving features will shape the product.

## Why Agile (Scrum)?

- Encourages collaboration within the team and with stakeholders.
- Allows us to deliver functional increments of the product after each sprint.
- Provides flexibility to adjust scope and priorities based on feedback.
- Focuses on user needs through user stories and acceptance criteria.
- Reduces risks by identifying and addressing challenges early.

## Implementation of Scrum

### Sprint Schedule
- **Sprint 1**: August 19th - Project setup and initial designs
- **Sprint 2**: September 2nd - First features implementation
- **Sprint 3**: September 29th - Final features implementation
- **Sprint 4**: October 19th - Complete website and bug-free delivery

### Ceremonies

#### Sprint Planning
- We meet at the start of each sprint to set a Sprint Goal
- Select backlog items that align with capacity and priority
- Break down user stories into tasks
- Assign tasks to team members on GitHub Projects

#### Daily Standups
- We hold our meetings on WhatsApp to track progress, plans, and blockers
- We capture proof of meetings

#### Sprint Review
- Demo completed features to client
- Collect feedback and adjust the Product Backlog priorities

#### Sprint Retrospective
- We meet at the end of each sprint to reflect on what went well
- Identify what can improve
- Agree on actionable improvements for the next sprint

#### Backlog Refinement
- Session to clarify, split, and estimate upcoming user stories
- Prioritize certain backlog items over others

### Roles

#### Scrum Master
- **Ntokozo Skosana**: Facilitates the scrum process

#### Development Team
- **Risuna Ntimana**
- **Naledi Mogomotsi**
- **Stelly Jane**
- **Annah Mlimi**
- **Ntokozo Skosana**

All team members are responsible for delivering features.

## User Stories and Acceptance Tests

### Sprint 1 User Stories

#### User Story 1: User Registration (SignUp)
- **As a** new user **I want** to create an account with my email and password
- **So that** I can access the Hiking Logbook system securely.

**User Acceptance Test**
- **Given** I am a new user **When** I provide a valid email and password in the sign-up form **Then** my account should be created successfully And I should see a confirmation message.

#### User Story 2: User Login
- **As a** registered user **I want** to log in using my email and password **So that** I can access my personal Hiking Logbook dashboard.

**User Acceptance Test**
- **Given** I already have a registered account **When** I enter a valid email and password in the login form **Then** I should be logged in successfully And redirected to my dashboard.

#### Documentation Setup
- **As a** developer or team member **I want** project documentation to be available **So that** I can understand the setup, features, and contribution process.

**User Acceptance Test**
- **Given** I am a new team member or contributor **When** I open the documentation in the repo **Then** I should find clear setup instructions, feature explanations, and contribution guidelines.

### Sprint 2 User Stories

#### Database Schema
- **As a** developer **I want** a well-structured database schema **So that** the Hiking Logbook can store and manage data efficiently.

**User Acceptance Test**
- **Given** the schema is defined **When** I run the migration or initialize the database **Then** tables and relationships should be created successfully And data should persist across operations.

#### Frontend Design
- **As a** user **I want** a visually appealing and user-friendly interface **So that** I can easily navigate and use the Hiking Logbook system.

**User Acceptance Test**
- **Given** I open the Hiking Logbook in a browser **When** I land on the homepage or dashboard **Then** the design should be responsive, clear, and easy to use.

#### Hiking Logbook API
- **As a** user **I want** to add and view my hiking logs **So that** I can keep track of my hiking activities.

**User Acceptance Test**
- **Given** I am logged in **When** I create a new hiking log via the API **Then** the log should be saved to the database And retrievable when I request my hiking history.

#### Weather API
- **As a** hiker **I want** to see the weather forecast for my hikes **So that** I can plan safely before going hiking.

**User Acceptance Test**
- **Given** I search or select a hiking location **When** the weather API is called **Then** I should see the current weather and forecast for that location.

#### Filter And Search
- **As a** user **I want** to search and filter my hiking logs **So that** I can quickly find specific hikes based on date, location, or conditions.

**User Acceptance Test**
- **Given** I have multiple hiking logs **When** I apply a filter or search by keyword **Then** only the matching hikes should be displayed.

## Development Roadmap

### Phase 1: Core Setup
- Initialize repository and project structure
- Set up CI/CD pipeline
- Create Firebase Account
- Integrate code quality tools
- Create a documentation site (GitHub Pages)
- Implement Firebase authentication
- Set up GitHub Projects for workplanning
- Define initial backlog and Agile workflow
- Implement authentication (sign-up, login)

**Milestone**: Users can register and log in successfully.

### Phase 2: Core Features
- Implement hike logging (location, distance, elevation, notes)
- Add ability to view past hikes in a list view
- Weather API integration
- Build "Start Your Journey" button → directs to hike creation page
- Create basic User Profile management

**Milestone**: A user can log hikes, view them, and update their profile.

### Phase 3: Social Features
- Friend connections and shared hikes
- Achievement and badges system

**Milestone**: A user can receive awards for hikes completed.

### Phase 4: Advanced Features
- GPS integration for live tracking
- Progress analytics with visualization
- Memory capture (photos, notes)
- Add ability to edit or delete hikes

**Milestone**: A user can see their hiking progress visually.

### Phase 5: Testing & Deployment
- Unit tests, integration tests, and CI pipeline coverage
- Final refinements based on feedback
- Deployment to production

**Milestone**: The app is stable, tested, and ready for release.

## Project Alignment

The project aligns with:
- **End-User Needs**: Provides adventure planning, social sharing, and personal growth tools
- **Technology Choices**: React.js frontend with Firebase backend ensures scalability and real-time capabilities
- **Agile Values**: Focuses on working software, responding to change, and customer collaboration

## Scope & Key Features

- **Plan Your Adventures** – schedule hikes, view weather, set start times & itineraries
- **Connect with Friends** – invite friends, share hikes, activity feed
- **Track Achievements** – goals, badges, milestones, streaks
- **Capture Memories** – photos, notes, detailed logs
- **GPS Integration** – live route tracking, waypoints, map navigation
- **Progress Analytics** – charts for distance, elevation, duration, trends
- **User Profile** – history, badges, preferences, privacy
- **Start Your Journey** – central CTA to plan/log/track a hike
