import { readFile } from "fs/promises";
import { ValeConfig } from "types";
import { notifyError } from "utils/error-utils";
import { parseValeIni } from "./vale-ini-parser";

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
