import { ValeIssue, ValeOutput } from "types";
import { parseValeOutput } from "./vale-parser";
import { spawnProcessWithOutput } from "utils/process-utils";
import { valeLintExitHandler } from "utils/vale-utils";
import type ValePlugin from "main";

/** Represents the results of running the linter with a ValeRunner */
interface ValeRunnerResult {
	success: boolean;
	issues: ValeIssue[];
	error?: string;
}

/** Runs Vale linting on files using the configured Vale binary and settings. */
export class ValeRunner {
	private plugin: ValePlugin;
	constructor(plugin: ValePlugin) {
		this.plugin = plugin;
	}

	async lintFile(filePath: string): Promise<ValeRunnerResult> {
		try {
			const output = await this.executeVale(filePath);
			const issues = parseValeOutput(output);
			return { success: true, issues };
		} catch (error) {
			console.error(`Error linting file ${filePath}:`, error);
			return {
				success: false,
				issues: [],
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	private async executeVale(filePath: string): Promise<ValeOutput> {
		const settings = this.plugin.settings;
		const valeProcess = {
			command: settings.valeBinaryPath,
			args: [
				"--output=JSON",
				`--config=${settings.valeConfigPathAbsolute}`,
				filePath,
			],
			timeoutMs: settings.valeProcessTimeoutMs,
			onClose: valeLintExitHandler,
		};

		const output = await spawnProcessWithOutput(valeProcess);
		try {
			return JSON.parse(output) as ValeOutput;
		} catch (parseError) {
			throw new Error(
				`Failed to parse Vale output: ${parseError instanceof Error ? parseError.message : String(parseError)}\n\nRaw output:\n${output}`,
			);
		}
	}
}
