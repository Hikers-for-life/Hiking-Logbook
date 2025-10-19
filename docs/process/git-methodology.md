# 📘 Hiking Logbook – Git Methodology Documentation

This document defines the **Git workflow, commit conventions, and version control standards** for the Hiking Logbook project.  
It serves as the **"Git How We Work" manual** for all contributors.

> ⚠️ **Note:**  
> These Git standards are **living rules** and may evolve as the project grows.  
> Updates will be tracked through Git commits.

---

## 1. Commit Conventions

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

## 2. Git Methodology


We are using Gitflow branching model which contains:
- **Main branch** = Production-ready code (protected).  
- **Dev branch** = Integration branch for ongoing work.  
- **Feature branches** = `feature/short-description` (merged via PR).  
- **Hotfix branches** = `hotfix/short-description`.  //Is going to be added as we move with this project


## 3. Branch Rules & CI Pipeline

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

## 4. Developer Git Workflow

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
  - GitLens (for better Git integration)

---

## Purpose

These Git standards ensure that:
- Code changes are **tracked and traceable**.  
- Collaboration is **smooth and efficient**.  
- The project maintains **clean commit history**.  
- The project remains **scalable and professional**.

