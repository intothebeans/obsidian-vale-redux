/* eslint-disable obsidianmd/ui/sentence-case */
import { Notice } from "obsidian";
import { ValeConfig, ValeConfigErrorOutput, ValeConfigFull } from "types";
import { notifyError, spawnProcessWithOutput } from "./utils";

export async function testValeConnection(
	valeBinaryPath: string,
): Promise<boolean> {
	const binaryPath = valeBinaryPath;
	const notice = new Notice("Testing Vale connection...", 0);
	try {
		const stdout = await spawnProcessWithOutput(binaryPath, ["--version"]);
		notice.hide();
		new Notice(`✓ Vale connected successfully!\n${stdout.trim()}`);
		return true;
	} catch (error) {
		notice.hide();
		notifyError(
			`✗ Vale connection failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure Vale is installed and the binary path is correct.`,
		);
		return false;
	}
}

export async function getValeStylesPath(
	binaryPath: string,
	configPath: string,
): Promise<string> {
		const cmdOutput = await spawnProcessWithOutput(binaryPath, [
			"ls-dirs",
			"--output=JSON",
			`--config=${configPath}`,
		]);
		const outputJson = JSON.parse(cmdOutput) as {
			StylesPath?: string;
			".vale.ini"?: string;
		};
		if (outputJson && outputJson.StylesPath) {
			return outputJson.StylesPath;
		} else if (outputJson && configPath && outputJson[".vale.ini"]) {
			return outputJson[".vale.ini"];
		} else {
			throw new Error("Styles path not found in Vale output");
	}
}

export async function getExistingConfigOptions(
	valeBinaryPath: string,
	configPath: string,
): Promise<void | ValeConfig> {
	try {
		const cmdOutput = await spawnProcessWithOutput(valeBinaryPath, [
			"ls-config",
			"--config",
			configPath,
		]);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const outputJson = JSON.parse(cmdOutput);
		if (isValeError(outputJson)) {
			notifyError(
				`Vale configuration error: ${outputJson.Text} (Line ${outputJson.Line} in ${outputJson.Path})`,
			);
			return;
		}
		return outputJson as ValeConfig;
	} catch (error) {
		notifyError(
			`Failed to get Vale config options: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValeError(response: any): response is ValeConfigErrorOutput {
	return "Code" in response && "Text" in response;
}
