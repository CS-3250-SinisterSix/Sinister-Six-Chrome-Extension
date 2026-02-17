export default {
  testEnvironment: "node",

  collectCoverage: true,

  collectCoverageFrom: [
    "src/themes.js"
  ],

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
