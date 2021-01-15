module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testRegex: "/tests/.*\\.(test|spec)\\.tsx?$",
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect",
    "./tests/setup.ts"
  ]
};