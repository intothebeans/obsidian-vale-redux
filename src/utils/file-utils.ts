import * as path from "path";
import { Notice, Platform, Vault } from "obsidian";
import { spawn } from "child_process";
import { access, stat } from "fs/promises";
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

interface PlatformCommand {
	command: string;
	args: string[];
	useShell?: boolean;
}

function getPlatformOpenCommand(
	filePath: string,
	isDirectory: boolean,
): PlatformCommand | null {
	if (Platform.isMacOS) {
		return { command: "open", args: [filePath] };
	}

	if (Platform.isWin) {
		const command = isDirectory ? "explorer" : "start";
		return { command, args: [filePath], useShell: true };
	}

	if (Platform.isLinux) {
		return { command: "xdg-open", args: [filePath] };
	}

	return null;
}

export async function openExternalFilesystemObject(
	path: string,
	vault: Vault,
): Promise<void> {
	const absolutePath = ensureAbsolutePath(path, vault);

	try {
		await access(absolutePath);
		const stats = await stat(absolutePath);

		const platformCommand = getPlatformOpenCommand(
			absolutePath,
			stats.isDirectory(),
		);

		if (!platformCommand) {
			notifyError(`Unsupported platform: ${release()}`);
			return;
		}

		spawn(platformCommand.command, platformCommand.args, {
			shell: platformCommand.useShell,
		});

		new Notice(`Opening: ${absolutePath}`);
	} catch (error) {
		notifyError(
			`Failed to open: ${absolutePath}\nError: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
