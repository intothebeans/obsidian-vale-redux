import { spawn } from "child_process";
import { ValeOutput, ValeRunnerResult, ValeRuntimeConfig } from "types";
import { Buffer } from "buffer";
import { VALE_TIMEOUT_MS } from "utils/constants";
import { parseValeOutput } from "./vale-parser";

export class ValeRunner {
	private runtimeSettings: ValeRuntimeConfig;

	constructor(settings: ValeRuntimeConfig) {
		this.runtimeSettings = settings;
	}

	async lintFile(filePath: string): Promise<ValeRunnerResult> {
		console.debug(`Linting file: ${filePath}`);
		try {
			const output = await this.executeVale(filePath);
			const issues = parseValeOutput(output);
			return { success: true, issues };
		} catch (error) {
			return {
				success: false,
				issues: [],
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	private async executeVale(filePath: string): Promise<ValeOutput> {
		const { command, args } = this.buildValeCommand(filePath);
		return new Promise((resolve, reject) => {
			let stdout = "";
			let stderr = "";
			const process = spawn(command, args);

			process.stdout.on("data", (data: Buffer) => {
				stdout += data.toString();
			});

			process.stderr.on("data", (data: Buffer) => {
				stderr += data.toString();
			});

			process.on("close", (code) => {
				if (stdout.trim().length === 0) {
					if (stderr) {
						reject(new Error(`Vale error: ${stderr}`));
					} else {
						reject(
							new Error(
								`Vale process exited with code ${code} and no output.`,
							),
						);
					}
					return;
				}
				try {
					const output = JSON.parse(stdout) as ValeOutput;
					resolve(output);
				} catch (error) {
					reject(
						new Error(
							`Failed to parse Vale output: ${error instanceof Error ? error.message : String(error)}`,
						),
					);
				}
			});

			process.on("error", (err) => {
				reject(
					new Error(`Failed to start Vale process: ${err.message}`),
				);
			});

			const timeout = setTimeout(() => {
				process.kill();
				new Error("Vale process timed out.");
			}, VALE_TIMEOUT_MS);

			process.on("close", () => {
				clearTimeout(timeout);
			});
		});
	}

	private buildValeCommand(filePath: string): {
		command: string;
		args: string[];
	} {
		const binary = this.runtimeSettings.valeBinary;
		const args: string[] = ["--output=JSON"];

		if (this.runtimeSettings.valeConfig) {
			args.push(`--config=${this.runtimeSettings.valeConfig}`);
		}

		args.push(filePath);
		return { command: binary, args };
	}
}
