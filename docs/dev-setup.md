# Developer Setup – Backend Tools

This document explains the development tools set up in the `/backend` folder to help ensure consistent code quality and clean formatting across the team.

---

## Tools Installed

- **ESLint**: Linter that detects errors, bugs, and bad coding practices
- **Prettier**: Formatter that ensures consistent code style
- **Node.js / npm**: For managing dependencies and scripts

---

## How to Get Started

### 1. Install dependencies

After cloning the repo, open your terminal and run:

```bash
cd backend
npm install
```

### 2. Available Development Commands

Once dependencies are installed, you can use the following npm scripts:

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

- **`.eslintrc.js`**: ESLint configuration for code linting rules
- **`.prettierrc`**: Prettier configuration for code formatting rules
- **`package.json`**: Contains all npm scripts and dependencies

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

1. **Dependencies not found:** Run `npm install` again
2. **ESLint configuration errors:** Check that `.eslintrc.js` exists and is valid
3. **Prettier configuration errors:** Check that `.prettierrc` exists and is valid
4. **Permission errors:** Ensure you have write permissions in the backend directory

**Common Issues:**
- If ESLint reports many errors after setup, run `npm run lint:fix` to automatically fix most issues
- If Prettier formatting seems incorrect, check the `.prettierrc` configuration file
