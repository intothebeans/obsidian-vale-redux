import { defineConfig } from "vitest/config";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths()],
	resolve: {
		alias: {
			obsidian: path.resolve(__dirname, "tests/__mocks__/obsidian.ts"),
		},
	},
});
