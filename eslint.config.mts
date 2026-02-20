import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import prettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import { globalIgnores } from "eslint/config";
import { fileURLToPath } from "url";
import { dirname } from "path";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						"eslint.config.js",
						"manifest.json",
						"vitest.config.ts",
					],
				},
				tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
				extraFileExtensions: [".json"],
			},
		},
	},
	// @ts-ignore
	...obsidianmd.configs.recommended,
	prettier,
	globalIgnores([
		"node_modules",
		"coverage",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
		"styles.css",
	]),
);
