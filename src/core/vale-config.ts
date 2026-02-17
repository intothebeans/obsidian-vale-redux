import { copyFile, readFile } from "fs/promises";
import { ValeConfig } from "types";
import { notifyError } from "utils/error-utils";
import { parseValeIni } from "./vale-ini-parser";
import ValePlugin from "main";
import path from "path";

export async function getExistingConfigOptions(
	configPath: string,
): Promise<ValeConfig | undefined> {
	const configContent = await readFile(configPath, "utf-8").catch((err) => {
		notifyError(
			`Failed to read Vale config file: ${err instanceof Error ? err.message : String(err)}`,
		);
		return undefined;
	});
	if (!configContent) {
		return undefined;
	}

	try {
		const parsedConfig = parseValeIni(configContent);
		return parsedConfig;
	} catch (err) {
		notifyError(
			`Failed to parse Vale config file: ${err instanceof Error ? err.message : String(err)}`,
		);
		return undefined;
	}
}

export async function backupExistingConfig(plugin: ValePlugin): Promise<void> {
	const settings = plugin.settings;
	const configPath = settings.valeConfigPathAbsolute;
	const backupName = generateBackupName(configPath);
	let backupDir = settings.valeConfigBackupDir;
	if (backupDir === "") {
		backupDir =
			await plugin.app.fileManager.getAvailablePathForAttachment(
				backupName,
			);
		if (!backupDir) {
			notifyError("Couldn't determine the default attachment directory");
			return;
		}
	}
	try {
		await copyFile(configPath, path.join(backupDir, backupName));
	} catch (error) {
		notifyError(
			"Error creating backup!",
			8000,
			error instanceof Error ? error.message : String(error),
		);
	}
}

function generateBackupName(configPath: string): string {
	const pathParts = path.parse(configPath);
	const fileName = pathParts.name;
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	return `${fileName}_backup_${timestamp}${pathParts.ext}`;
}
