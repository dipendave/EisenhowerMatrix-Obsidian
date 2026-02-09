import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	testMatch: "**/*.spec.ts",
	projects: [
		{
			name: "iphone-16-pro",
			use: {
				browserName: "chromium",
				viewport: { width: 393, height: 852 },
				isMobile: true,
			},
		},
		{
			name: "iphone-se",
			use: {
				browserName: "chromium",
				viewport: { width: 375, height: 667 },
				isMobile: true,
			},
		},
	],
});
