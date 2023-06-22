/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const nextJest = require('next/jest');

// See: https://nextjs.org/docs/testing#jest-and-react-testing-library
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // add our setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // add support for alias' to work, since we use baseUrl in tsconfig.json
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  // test any .test file in any `__tests__` directory, ignore cypress .spec files
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+test.[jt]s?(x)'],
  moduleNameMapper: {
    'd3-time-format': '<rootDir>/node_modules/d3-time-format/dist/d3-time-format.min.js',
    'd3-time': '<rootDir>/node_modules/d3-time/dist/d3-time.min.js',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
