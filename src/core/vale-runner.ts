import { ValeOutput, ValeRunnerResult, ValeRuntimeConfig } from "types";
import { parseValeOutput } from "./vale-parser";
import { spawnProcessWithOutput } from "utils/utils";
import { valeLintExitHandler } from "utils/vale-utils";

export class ValeRunner {
	private runtimeSettings: ValeRuntimeConfig;

	constructor(settings: ValeRuntimeConfig) {
		this.runtimeSettings = settings;
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
		const valeProcess = {
			command: this.runtimeSettings.valeBinary,
			args: [
				"--output=JSON",
				`--config=${this.runtimeSettings.valeConfig}`,
				filePath,
			],
			timeoutMs: this.runtimeSettings.timeoutMs,
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
