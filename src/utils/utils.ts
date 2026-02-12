import { spawn } from "child_process";
import { Buffer } from "buffer";
import { Notice } from "obsidian";
import { ValeProcess } from "types";

export async function spawnProcessWithOutput(
	valeProcess: ValeProcess,
): Promise<string> {
	const process = spawn(valeProcess.command, valeProcess.args);
	let stdout = "";
	let stderr = "";
	process.stdout.on("data", (data: Buffer) => {
		stdout += data.toString();
	});
	process.stderr.on("data", (data: Buffer) => {
		stderr += data.toString();
	});

	return new Promise<string>((resolve, reject) => {
		process.on("close", (returnCode) => {
			const procStatus = valeProcess.onClose(
				returnCode as number,
				stdout,
				stderr,
			);
			if (procStatus.status) {
				resolve(stdout);
			} else {
				reject(new Error(procStatus.message));
			}
		});
		process.on("error", (err) => {
			reject(
				new Error(
					`Process failed with error: ${err.message}\n\nStderr: ${stderr}`,
				),
			);
		});
		setTimeout(() => {
			process.kill();
			if (stdout) {
				resolve(stdout);
			} else {
				reject(new Error("Process timed out"));
			}
		}, valeProcess.timeoutMs);
	});
}

// TODO: update error messaging between the console and notices
export function notifyError(
	message: string,
	duration: number = 8000,
	devMessage?: string,
): void {
	console.error(
		`Error: ${message}`,
		devMessage ? `\nDetails: ${devMessage}` : "",
	);
	new Notice(`⚠️ Vale Error:\n${message}`, duration);
}
