import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default tseslint.config(
	...tseslint.configs.recommendedTypeChecked,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parserOptions: { project: "./tsconfig.json" },
		},
		plugins: {
			obsidianmd,
		},
		rules: {
			...obsidianmd.configs.recommended,
			"obsidianmd/sample-names": "off",
			// loadData() returns any by design in Obsidian's API
			"@typescript-eslint/no-unsafe-assignment": "off",
		},
	},
	{
		ignores: ["**/*.js", "**/*.mjs", "tests/**", "node_modules/**"],
	},
);
