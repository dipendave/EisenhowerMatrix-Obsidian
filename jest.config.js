/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/tests/**/*.test.ts"],
	moduleNameMapper: {
		"^obsidian$": "<rootDir>/tests/__mocks__/obsidian.ts",
	},
	transform: {
		"^.+\\.ts$": ["ts-jest", { tsconfig: { esModuleInterop: true } }],
	},
};
