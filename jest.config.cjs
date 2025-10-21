// This file must be named jest.config.cjs for CommonJS syntax to work with 'type': 'module' in package.json
module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  verbose: true
};
