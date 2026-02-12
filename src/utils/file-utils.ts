import * as path from "path";
import * as fs from "fs";
import process from "process";
import { Notice, Platform, Vault } from "obsidian";
import { spawn } from "child_process";

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

export async function openExternalFilesystemObject(
	path: string,
	vault: Vault,
): Promise<void> {
	const absolutePath = ensureAbsolutePath(path, vault);
	try {
		const exists = await vault.adapter.exists(absolutePath);
		if (!exists) {
			new Notice(`File not found: ${absolutePath}`);
			return;
		}

		const stats = await vault.adapter.stat(absolutePath);
		if (!stats) {
			new Notice(`Unable to access file: ${absolutePath}`);
			return;
		}

		if (Platform.isMacOS) {
			spawn("open", [absolutePath]);
		} else if (Platform.isWin) {
			let command = stats.type === "folder" ? "explorer" : "start";
			spawn(command, [absolutePath], { shell: true });
		} else if (Platform.isLinux) {
			spawn("xdg-open", [absolutePath]);
		} else {
			new Notice("Unsupported platform for opening filesystem objects.");
			return;
		}

		new Notice(`Opening: ${absolutePath}`);
	} catch (error) {
		new Notice(
			`Failed to open: ${absolutePath}\nError: ${
				error instanceof Error ? error.message : String(error)
			}`,
			8000,
		);
	}
}
