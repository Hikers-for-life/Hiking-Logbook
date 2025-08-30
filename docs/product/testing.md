# Testing Strategy - Hiking Logbook
This document describes the testing approach for the Hiking Logbook Project, covering test plan, methodologies, and how test results are recorded.

##  Test Plan

The goal of our testing strategy is to ensure that all components of the Hiking Logbook application (frontend and backend) work correctly, reliably, and as expected. Our test plan covers:

- **Unit Testing**: Testing individual functions, components, and services in isolation.
- **Integration Testing**: Ensuring different modules (frontend ↔ backend) interact correctly.
- **End-to-End Testing**: Simulating user workflows in the full application.
- **User Acceptance Testing (UAT)**: Verifying the app against user stories and acceptance criteria.

**Test Objectives:**
1. Ensure reliability and correctness of backend APIs and frontend components.
2. Catch bugs early through automated unit and integration tests.
3. Verify that all core features (signup, login, hike tracking, profile management) function as expected.
4. Ensure performance, reliability, and usability meet expectations.

**Responsibilities**
- **Backend team** → Write and maintain Jest tests for API routes and business logic.
- **Frontend team** → Write and maintain React Testing Library tests for UI components and user interactions.
- **All developers** → Ensure new code includes adequate test coverage before merging to main.
- Each developer writes unit tests for their components.
- Integration tests are performed during feature merging.
- QA/peer reviews handle user acceptance testing.

---

##  Testing Approach

1. ### Unit Testing
**Backend:**
  - **Framework**: Jest
  - **Scope:**
    - Test controllers and services in isolation.
    - Tests cover individual functions (e.g., authentication, data validation).
    - Run with:
       cd backend
       npm run test

**Frontend:**
  - **Framework**: Jest + React Testing Library.
  - **Scope:**
    - Test React components in isolation (e.g., `Signup.js`, `Home.js`).
    - Validate rendering, form inputs, and button actions.
    - Ensure state updates correctly on user input.
    - Run with:
       cd frontend
       npm run test
  
2. ### Integration Testing
**Backend:**
 - Test API endpoints with Jest.
 - Verify database interactions and response correctness.

**Frontend:**
 - Simulate user flows with React Testing Library + @testing-library/user-event.
 - Example: clicking the Start Your Journey button should navigate to signup/login page.

3. ### Test Coverage
Test Coverage
 - Backend: npm run test:coverage generates a coverage report.
 - Frontend: Coverage enabled with --coverage.
Goal: ≥ **80% coverage** on both backend and frontend.

4. Continuous Integration
All PRs must pass:
 - npm run lint
 - npm run format:check
 - npm test

---

## Test Records
We will maintain a Test Records Log in this document to track test results. Each test cycle will include test case ID, description, status, and remarks.
