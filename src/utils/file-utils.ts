import * as path from "path";
import { Vault } from "obsidian";
/**
 * Ensures that a path is absolute. If the path is relative, it will be
 * resolved relative to the vault's base path.
 */
export function ensureAbsolutePath(inputPath: string, vault: Vault): string {
	if (!inputPath || inputPath.trim() === "") {
		return "";
	}

	if (path.isAbsolute(inputPath)) {
		return inputPath;
	}

	const basePath = getVaultBasePath(vault);
	return path.join(basePath, inputPath);
}

export function getVaultBasePath(vault: Vault): string {
	const adapter = vault.adapter as {
		basePath?: string;
		getBasePath?: () => string;
	};
	if (adapter.basePath) {
		return adapter.basePath;
	} else if (adapter.getBasePath) {
		return adapter.getBasePath();
	} else {
		throw new Error("Unable to determine vault base path.");
	}
}
