module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "tsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["<rootDir>/test/**/*.test.(ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  setupFilesAfterEnv: ["./setupTest.ts", "./setupDOM.ts"],
};
