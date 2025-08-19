module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.js'],
  moduleNameMapper: {
    '^firebase/(.*)$': '<rootDir>/frontend/src/mocks/firebase/$1.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/frontend/src/mocks/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)',
  ],
  collectCoverageFrom: [
    'frontend/src/**/*.{js,jsx}',
    '!frontend/src/index.js',
    '!frontend/src/reportWebVitals.js',
    '!frontend/src/setupTests.js',
    '!frontend/src/mocks/**',
    '!frontend/src/tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/frontend/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/frontend/src/**/*.{test,spec}.{js,jsx}',
  ],
  moduleDirectories: ['node_modules', 'frontend/src'],
  roots: ['<rootDir>/frontend/src'],
};
