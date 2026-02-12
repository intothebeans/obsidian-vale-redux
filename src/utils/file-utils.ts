import * as path from "path";
import { Notice, Platform, Vault } from "obsidian";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { stat } from "fs/promises";
import { notifyError } from "./utils";
import { release } from "os";

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
		const exists = existsSync(absolutePath);
		if (!exists) {
			new Notice(`File not found: ${absolutePath}`);
			return;
		}

		const stats = await stat(absolutePath);
		if (!stats) {
			new Notice(`Unable to access file: ${absolutePath}`);
			return;
		}

		if (Platform.isMacOS) {
			spawn("open", [absolutePath]);
		} else if (Platform.isWin) {
			let command = stats.isDirectory() ? "explorer" : "start";
			spawn(command, [absolutePath], { shell: true });
		} else if (Platform.isLinux) {
			spawn("xdg-open", [absolutePath]);
		} else {
			notifyError(`Unsupported platform: ${release()}`);
			return;
		}

		new Notice(`Opening: ${absolutePath}`);
	} catch (error) {
		notifyError(
			`Failed to open: ${absolutePath}\nError: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
