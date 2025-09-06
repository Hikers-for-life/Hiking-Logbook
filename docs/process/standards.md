# 📘 Hiking Logbook – Standards Documentation

This document defines the **rules, conventions, and quality standards** to ensure the Hiking Logbook project remains consistent, maintainable, and professional.  
It serves as the **“How We Work” manual** for all contributors.

> ⚠️ **Note:**  
> These standards are **living rules** and may evolve as the project grows.  
> Updates will be tracked through Git commits.

---

## 1. Coding Standards

### Language Style
- **JavaScript/React (Frontend)** → Follow [ESLint](https://eslint.org/) rules with Prettier formatting.  
- **Node.js/Firebase (Backend)** → Follow ESLint + Prettier for backend code.  
- Enforce **consistent semicolons**, **arrow functions**, and **const/let** usage.

### Naming Conventions
- **Variables & Functions:** `camelCase`  
- **Classes & Components:** `PascalCase`  
- **Files:** `kebab_case.js` (e.g., `user_service.js`)  
- **Constants:** `UPPER_CASE_SNAKE`  

### Error Handling & Logging
- Use **try/catch** in async functions.  
- Log errors with clear context.  
- Avoid exposing sensitive info in logs.

### Commenting & Documentation
- Use **JSDoc style comments** for functions and classes.  
- Inline comments only for complex logic.  
- Avoid redundant comments (code should be self-explanatory).

---

## 2. Commit Conventions

We follow [**Conventional Commits**](https://www.conventionalcommits.org/):  

| Type           | Example Commit Message |
|------------------      |-------------------------|
| `feat`         | `feat: add user login functionality`   |
| `fix`          | `fix: correct typo in dashboard`       |
| `docs`         | `docs: update API README`          |
| `test`         | `test: add unit tests for hike module` |
| `chore`        | `chore: update dependencies`    |
| `refactor`     | `refactor: simplify hike calculation logic` |

**Rules:**
- Use **imperative mood** (e.g., "add" not "added").  
- Keep commit messages **short & descriptive**.  
- Reference issue numbers if applicable: `fix: resolve login bug (#42)`  

---

## 3. Git Methodology


We are using Gitflow branching model which contains:
- **Main branch** = Production-ready code (protected).  
- **Dev branch** = Integration branch for ongoing work.  
- **Feature branches** = `feature/short-description` (merged via PR).  
- **Hotfix branches** = `hotfix/short-description`.  //Is going to be added as we move with this project


### Pull Requests (PRs)
- All PRs must:
  - Be reviewed by **at least 1 team member**.  
  - Pass CI/CD pipeline (lint, tests, coverage).  
  - Have a descriptive title and link to related issue(s).  

---

## 4. Testing Standards

- **Coverage Goal:** ≥ 80% for both frontend and backend.  
- **Tools:**  
  - Frontend → Jest + React Testing Library  
  - Backend → Jest for Firebase Functions  
- **Naming Convention:**  
  - Test files: `*.test.js`  
  - Group tests with `describe()`, use clear `it()` statements.  
- **CI/CD:** Builds fail if coverage drops below threshold.  

---

## 5. Documentation Standards

- All project docs live under `/docs/`.  
- Use **Markdown (`.md`)** for readability on GitHub.  
- File naming: lowercase with underscores (e.g., `architecture_design.md`).  
- Each doc must have:
  - **Title** at top.  
  - **Table of Contents** if >1 page.  
  - **Diagrams/screenshots** stored in `/docs/assets/`.  

### GitHub Pages
- Documentation is deployed via **GitHub Pages** from the `/docs` folder.  
- Updates must be included in pull requests.  

---

## 6. Branch Rules & CI Pipeline

### Main Branch
- Direct pushes **disabled**.  
- PRs **required** with **1+ approvals**.  
- CI pipeline must pass (lint, tests, coverage).  

### Dev Branch
- Direct pushes **allowed for small fixes**.  
- PR recommended for larger changes.  
- CI pipeline runs on every push and PR.  

### CI/CD Pipeline
- **Frontend:** Lint → Test → Coverage → Build  
- **Backend:** Lint → Test → Coverage  
- Coverage reports uploaded to **Codecov**.  
- Merge blocked if checks fail.  

---

## 7. Developer Setup

### Tools
- **ESLint** – Detects coding errors.  
- **Prettier** – Enforces formatting.  
- **Jest** – Testing framework.  
- **Node.js/npm** – Dependency management.  

### Workflow Before Commit
1. Run `npm run lint`  
2. Run `npm run lint:fix`  
3. Run `npm run format`  
4. Run tests with `npm test`  
5. Commit changes following **Conventional Commits**  

### IDE Setup
- Recommended editor: **VS Code**.  
- Extensions:  
  - ESLint  
  - Prettier  

  - Husky

---

##  Purpose


These standards ensure that:
- Code is **clean, consistent, and maintainable**.  
- Documentation is **structured and accessible**.  
- Collaboration is **smooth and efficient**.  
- The project remains **scalable and professional**.

