# Developer Setup – Code Maintenance Tools

This document explains the development tools set up in both `/backend` and `/frontend` folders to help ensure consistent code quality and clean formatting across the team.

---

## Project Structure

```
Hiking-Logbook/
├── backend/           # Node.js backend application
│   ├── package.json   # Backend dependencies and scripts
│   └── eslint.config.js
├── frontend/          # React frontend application
│   ├── package.json   # Frontend dependencies and scripts
│   └── eslint.config.js
├── docs/             # Project documentation
│   └── dev-setup.md  # Development setup (this file)
└── README.md         # Main project documentation
```

---

## Tools Installed

Both backend and frontend use the same code quality tools:

- **ESLint**: Linter that detects errors, bugs, and bad coding practices
- **Prettier**: Formatter that ensures consistent code style
- **Node.js / npm**: For managing dependencies and scripts

---

## How to Get Started

### 1. Install dependencies

After cloning the repo, install dependencies for both parts:

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Available Development Commands

Both backend and frontend have the same npm scripts for code quality:

#### Code Quality Commands

```bash
# Check for linting issues
npm run lint

# Automatically fix linting issues where possible
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is properly formatted (useful for CI/CD)
npm run format:check
```

**Note:** Run these commands from within the respective directories (`backend/` or `frontend/`).

#### Workflow Recommendations

**Before committing code:**
1. Run `npm run lint` to check for code issues
2. Run `npm run lint:fix` to automatically fix any fixable issues
3. Run `npm run format` to ensure consistent code formatting
4. Run `npm run lint` again to ensure all issues are resolved

**For CI/CD pipelines:**
- Use `npm run lint` to check for linting errors
- Use `npm run format:check` to verify code formatting

---

## Configuration Files

### Backend Configuration
- **`backend/eslint.config.js`**: ESLint configuration for Node.js/JavaScript
- **`backend/.prettierrc`**: Prettier configuration for code formatting rules
- **`backend/package.json`**: Contains all npm scripts and dependencies

### Frontend Configuration
- **`frontend/eslint.config.js`**: ESLint configuration for React/JavaScript
- **`frontend/.prettierrc`**: Prettier configuration for code formatting rules
- **`frontend/package.json`**: Contains all npm scripts and dependencies

---

## IDE Integration

For the best development experience, we recommend:

1. **VS Code Extensions:**
   - ESLint extension
   - Prettier extension
   - Enable "Format on Save" in VS Code settings

2. **Configure your editor to:**
   - Show ESLint errors/warnings in real-time
   - Format code automatically on save using Prettier
   - Use the project's ESLint and Prettier configurations

---

## Troubleshooting

**If you encounter issues:**

1. **Dependencies not found:** Run `npm install` again in the respective directory
2. **ESLint configuration errors:** Check that `eslint.config.js` exists and is valid
3. **Prettier configuration errors:** Check that `.prettierrc` exists and is valid
4. **Permission errors:** Ensure you have write permissions in the respective directory

**Common Issues:**
- If ESLint reports many errors after setup, run `npm run lint:fix` to automatically fix most issues
- If Prettier formatting seems incorrect, check the `.prettierrc` configuration file

---

## Full-Stack Development

If you're working on both backend and frontend:

1. **Setup both parts:** Follow the installation steps above
2. **Running both simultaneously:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start  # or your backend start command
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

**CI/CD Integration:**
For both backend and frontend, ensure your CI/CD pipeline includes:
- Backend: `npm run lint` and `npm run format:check`
- Frontend: `npm run lint` and `npm run format:check`
