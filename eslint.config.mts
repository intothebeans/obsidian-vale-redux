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
					allowDefaultProject: ["eslint.config.js", "manifest.json"],
				},
				tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
				extraFileExtensions: [".json"],
			},
		},
	},
	// @ts-ignore
	...(obsidianmd.configs.recommended as any),
	prettier,
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
