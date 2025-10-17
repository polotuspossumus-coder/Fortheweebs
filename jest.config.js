export default {
  testEnvironment: 'jsdom',
  verbose: true,
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^api/(.*)$': '<rootDir>/api/$1',
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^middleware/(.*)$': '<rootDir>/middleware/$1',
    '^server/(.*)$': '<rootDir>/server/$1',
    '^public/(.*)$': '<rootDir>/public/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
