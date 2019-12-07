module.exports = {
    "roots": [
        "<rootDir>/tests"
    ],
    testMatch: [
        "<rootDir>/tests/api/**/*.+(spec|test).+(ts|tsx|js)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "testEnvironment": "node", // Required to avoid CORS issues with localhost requests
    "setupFilesAfterEnv": ["jest-expect-message", './tests/api/jest-setup.api.js'],
    "maxConcurrency": 3
}