import { copyFile, readFile, writeFile } from "fs/promises";
import { ValeConfig } from "types";
import { notifyError } from "utils/error-utils";
import { parseValeIni } from "./ini/parser";
import { serializeValeConfig } from "./ini/writer";
import type ValePlugin from "main";
import path from "path";
import { ensureAbsolutePath } from "utils/file-utils";
import { TFile } from "obsidian";
import { Notice } from "obsidian";

export async function getExistingConfigOptions(
	configPath: string,
): Promise<ValeConfig | void> {
	const configContent = await readFile(configPath, "utf-8").catch((err) => {
		notifyError(
			`Failed to read Vale config file: ${err instanceof Error ? err.message : String(err)}`,
		);
		return;
	});
	if (!configContent) {
		return;
	}

	try {
		const parsedConfig = parseValeIni(configContent);
		return parsedConfig;
	} catch (err) {
		notifyError(
			`Failed to parse Vale config file: ${err instanceof Error ? err.message : String(err)}`,
		);
		return;
	}
}

export async function backupExistingConfig(plugin: ValePlugin): Promise<void> {
	let outputPath: string;
	const settings = plugin.settings;
	const configPath = settings.valeConfigPathAbsolute;
	const backupObj = backupFileNameWithTimestamp(configPath);
	if (settings.valeConfigBackupDir !== "") {
		outputPath = path.join(settings.valeConfigBackupDir, backupObj.path);
	} else {
		const attachmentPath =
			await plugin.app.fileManager.getAvailablePathForAttachment(
				backupObj.path,
			);
		if (!attachmentPath) {
			throw new Error(
				"Failed to determine backup directory for Vale config. Please set a backup directory in the plugin settings.",
			);
		}

		outputPath = attachmentPath;
	}
	await copyFile(
		configPath,
		ensureAbsolutePath(outputPath, plugin.app.vault),
	);
	settings.backupPaths.push({ ts: backupObj.ts, path: outputPath });
	plugin.debounceSettingsSave();
}

export async function rotateBackups(plugin: ValePlugin): Promise<void> {
	const maxBackups = plugin.settings.valeConfigBackupsToKeep;
	const backups = plugin.settings.backupPaths;
	if (backups.length <= maxBackups) {
		return;
	}

	for (const backup of backups) {
		if (
			!backup.ts ||
			!backup.path ||
			backup.ts.trim() === "" ||
			backup.path.trim() === ""
		) {
			throw new Error(
				`Invalid backup entry: ${JSON.stringify(backup)}. Each backup must have a timestamp and path.`,
			);
		}
	}

	const parsed = backups.sort((a, b) => b.ts.localeCompare(a.ts)); // Newest first

	const toDelete = parsed.slice(maxBackups);
	for (const backup of toDelete) {
		const file = plugin.app.vault.getAbstractFileByPath(backup.path);
		if (file && file instanceof TFile) {
			new Notice(`Removing old Vale config backup: ${backup.path}`);
			await plugin.app.fileManager.trashFile(file);
		}
	}
	plugin.settings.backupPaths = parsed.filter((_, idx) => idx < maxBackups);
	plugin.debounceSettingsSave();
}

/** @throws file system errors */
export async function writeConfigToFile(
	configPath: string,
	config: ValeConfig,
): Promise<void> {
	const content = serializeValeConfig(config);
	await writeFile(configPath, content, "utf-8");
}

function backupFileNameWithTimestamp(configPath: string): {
	ts: string;
	path: string;
} {
	const timestamp = new Date().toISOString();
	return {
		ts: timestamp,
		path: `vale_config_backup_${timestamp.replace(/[:.]/g, "-")}`,
	};
}
