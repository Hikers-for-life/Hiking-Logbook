/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Allow inline mocks to work, bypassing the CRA firebase $1.js mapping
    '^firebase/(.*)$': '<rootDir>/__mocks__/firebase/$1.js',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/pages/',
    '<rootDir>/src/contexts/AuthContext.jsx',
    '<rootDir>/src/components/RouteExplorer.jsx',
    '<rootDir>/src/components/ProgressCharts.jsx',
    '<rootDir>/src/components/logbook-section.jsx',
    '<rootDir>/src/components/ui/users.js',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/mocks/**', // ⬅️ ignore all mocks
    '!src/tests/**', // exclude sample/demo code under src/tests from coverage
    '!src/components/ui/users.js', // exclude server/router stub accidentally in frontend
    // Exclude large integration-heavy views to focus coverage on units for now
    '!src/pages/**',
    '!src/contexts/AuthContext.jsx',
    '!src/pages/Achievements.jsx',
    '!src/pages/Friends.jsx',
    '!src/pages/Logbook.jsx',
    '!src/pages/HikePlanner.jsx',
    '!src/components/RouteExplorer.jsx',
    '!src/components/ProgressCharts.jsx',
    '!src/components/logbook-section.jsx',
    '!src/components/ui/profile-view.jsx',
    '!src/components/ui/view-friend-profile.jsx',
    '!src/components/ui/navigation.jsx',
  ],
};
