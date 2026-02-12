import { spawn } from "child_process";
import { ValeProcess } from "types";
import type { Buffer } from "node:buffer";

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
		const timeout = setTimeout(() => {
			process.kill();
			reject(new Error("Process timed out"));
		}, valeProcess.timeoutMs);

		process.on("close", (returnCode) => {
			clearTimeout(timeout);
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
			clearTimeout(timeout);
			reject(
				new Error(
					`Process failed with error: ${err.message}\n\nStderr: ${stderr}`,
				),
			);
		});
	});
}
