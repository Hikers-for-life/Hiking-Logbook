# Hiking Logbook Testing Documentation

This document outlines the **testing approach, tools, user stories, and acceptance tests** for the Hiking Logbook application.  
Testing ensures the app is reliable, secure, and production-ready.

---

## Testing Strategy

We use a **layered testing strategy**:

1. **Unit Testing**
   - Tests individual functions, components, and utilities.
   - Ensures business logic works in isolation (e.g., hike distance calculation).

2. **Integration Testing**
   - Verifies communication between backend routes, frontend components, and the database.
   - Example: creating a hike and verifying it appears in the logbook.

3. **End-to-End (E2E) Testing**
   - Simulates real user workflows across frontend + backend.
   - Example: User starts a hike → hike is saved in Firestore → hike shows in the logbook.

4. **User Acceptance Tests**
   - write user stories at the beginning of the sprint and test using User Acceptance tests towards the end of the sprint.

---

## Tools & Frameworks

| Tool / Framework         | Purpose                                |
| ------------------------- | -------------------------------------- |
| **Jest**                  | Unit testing for backend logic and React components |
| **React Testing Library** | Testing React components in isolation  |
| **Firebase Emulator Suite** | Local testing of Firestore, Auth, and Functions |
| **Postman / curl**        | Testing API endpoints                  |
| **ESLint + Prettier**     | Code quality & linting                 |
| **GitHub Actions (CI/CD)** | Running automated tests on every push |

---

## Example Test Cases

### 1. Backend API Tests

| Endpoint             | Test Case                                         | Expected Result                   |
| -------------------- | ------------------------------------------------ | --------------------------------- |
| `POST /api/hikes`    | Create a new hike with valid data                | Returns `201 Created` with hike ID |
| `GET /api/hikes`     | Fetch all hikes for logged-in user               | Returns list of hikes             |
| `PATCH /api/hikes/:id/pin` | Pin a hike                                 | Returns `success: true` and hike updated |
| `GET /api/stats`     | Retrieve stats for user                          | Returns total hikes, distance, streak |

---

### 2. Frontend Component Tests

| Component            | Test Case                                    | Expected Result                      |
| -------------------- | -------------------------------------------- | ------------------------------------ |
| `LogbookPage`        | Render hikes from API                        | Hike cards are displayed correctly   |
| `ProgressCharts`     | Load progress stats                          | Line and bar charts render with data |
| `PinnedHikes`        | Pin/unpin hike buttons                       | UI updates without reload            |
| `HikePlannerForm`    | Form validation with missing fields           | Error messages are shown             |

---

## User Stories & Acceptance Tests

### Story 1 – Log a new hike  
**As a user**, I want to log my completed hike so that I can keep a history of my outdoor activities.  

**Acceptance Test:**  
- Given the user is logged in  
- When they enter hike details (title, distance, date) and click **Save**  
- Then the hike is stored in the database and appears in the logbook immediately  

---

### Story 2 – View my progress  
**As a user**, I want to view statistics and charts of my hikes so that I can track my progress over time.  

**Acceptance Test:**  
- Given the user has logged hikes in the past  
- When they open the **Stats & Charts** page  
- Then a line graph of hikes over time and a bar chart of distances are displayed  

---

### Story 3 – Pin favorite hikes  
**As a user**, I want to pin my favorite hikes so that I can easily access them later.  

**Acceptance Test:**  
- Given the user has logged at least one hike  
- When they click the **Pin** icon  
- Then the hike appears under the **Pinned Hikes** section and remains pinned after refresh  

---

### Story 4 – Plan a future hike  
**As a user**, I want to add planned hikes with dates and difficulty levels so that I can prepare in advance.  

**Acceptance Test:**  
- Given the user is logged in  
- When they submit a planned hike through the **Hike Planner Form**  
- Then the hike is saved and displayed under **Upcoming Hikes**  

---

### Story 5 – Secure personal data  
**As a user**, I want my hikes to remain private so that only I can see my progress.  

**Acceptance Test:**  
- Given two users are logged in separately  
- When User A views their hikes  
- Then User B’s hikes are **not accessible** and a **permission denied** error is returned if attempted  

---

## How to Run Tests

1. **Run backend tests**
   ```bash
   cd backend
   npm test

2. **Run frontend tests**
   ```bash
   cd frontend
   npm test
