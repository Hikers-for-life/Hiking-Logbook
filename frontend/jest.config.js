/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // Allow inline mocks to work, bypassing the CRA firebase $1.js mapping
    "^firebase/(.*)$": "<rootDir>/__mocks__/firebase/$1.js",
  },
};
