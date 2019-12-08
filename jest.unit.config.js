module.exports = {
    "roots": [
        "<rootDir>/tests"
    ],
    testMatch: [
        "<rootDir>/tests/unit/**/*.+(spec|test).+(ts|tsx|js)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "setupFilesAfterEnv": ["jest-expect-message"]
}