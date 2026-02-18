import { copyFile, readFile, writeFile } from "fs/promises";
import { ValeConfig } from "types";
import { notifyError } from "utils/error-utils";
import { parseValeIni } from "./ini/parser";
import { serializeValeConfig } from "./ini/writer";
import ValePlugin from "main";
import path from "path";
import { ensureAbsolutePath } from "utils/file-utils";

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
/** @throws file system errors */
export async function backupExistingConfig(plugin: ValePlugin): Promise<void> {
	let outputPath: string;
	const settings = plugin.settings;
	const configPath = settings.valeConfigPathAbsolute;
	const backupName = generateBackupName(configPath);
	if (settings.valeConfigBackupDir !== "") {
		outputPath = path.join(settings.valeConfigBackupDir, backupName);
	} else {
		const attachmentPath =
			await plugin.app.fileManager.getAvailablePathForAttachment(
				backupName,
			);
		if (!attachmentPath) {
			throw new Error(
				"Failed to determine backup directory for Vale config. Please set a backup directory in the plugin settings.",
			);
		}
		outputPath = ensureAbsolutePath(attachmentPath, plugin.app.vault);
	}
	await copyFile(configPath, outputPath);
}

/** @throws file system errors */
export async function writeConfigToFile(
	configPath: string,
	config: ValeConfig,
): Promise<void> {
	const content = serializeValeConfig(config);
	await writeFile(configPath, content, "utf-8");
}

function generateBackupName(configPath: string): string {
	const pathParts = path.parse(configPath);
	const fileName = pathParts.name;
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	return `${fileName}_backup_${timestamp}${pathParts.ext}`;
}
