import { spawn } from "child_process";
import { Buffer } from "buffer";
import { Notice } from "obsidian";

export async function spawnProcessWithOutput(
	command: string,
	args: string[],
): Promise<string> {
	const process = spawn(command, args);
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
			if (returnCode === 0) {
				resolve(stdout);
			} else {
				const msg = `Vale exited with code ${returnCode}: ${stderr}`;
				notifyError("process failed!", 8000, msg);
				reject(new Error(msg));
			}
		});
		process.on("error", (err) => {
			console.error("Error spawning process:", err);
			reject(err);
		});
		setTimeout(() => {
			process.kill();
			console.error("Process timed out");
			reject(new Error("Process timed out"));
		}, 5000);
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
