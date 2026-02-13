import { Notice } from "obsidian";
import { ValePluginSettings, ValeProcess } from "types";
import { notifyError } from "./error-utils";
import { spawnProcessWithOutput } from "./process-utils";

/**
 * Standard exit code checker - only returnCode 0 is success.
 * Use this for Vale commands that should always succeed (like --version, ls-config).
 */
export function returnCodeFail(
	returnCode: number,
	_stdout: string,
	stderr: string,
): {
	status: boolean;
	message: string;
} {
	if (returnCode === 0) {
		return { status: true, message: "Vale connection successful" };
	} else {
		return {
			status: false,
			message: `Vale process exited with code ${returnCode}${stderr ? `\n${stderr}` : ""}`,
		};
	}
}

/**
 * Vale linting exit code checker - allows non-zero exit codes if stdout has content.
 * Vale returns exit code 1 when it finds linting issues, but this is not a failure.
 * Only treat it as a failure if there's no stdout (meaning Vale couldn't run).
 */
export function valeLintExitHandler(
	returnCode: number,
	stdout: string,
	stderr: string,
): {
	status: boolean;
	message: string;
} {
	if (stdout.trim().length === 0) {
		return {
			status: false,
			message: `Vale exited with code ${returnCode}${stderr ? `: ${stderr}` : " (no output)"}`,
		};
	}
	return { status: true, message: "Vale executed successfully" };
}
export async function testValeConnection(
	settings: ValePluginSettings,
): Promise<boolean> {
	const valeProcess: ValeProcess = {
		command: settings.valeBinaryPath,
		args: ["--version"],
		timeoutMs: settings.valeProcessTimeoutMs,
		onClose: returnCodeFail,
	};
	const notice = new Notice("Testing vale connection...", 0);

	try {
		const stdout = await spawnProcessWithOutput(valeProcess);
		notice.hide();
		new Notice(`✓ Vale connected successfully!\n${stdout.trim()}`);
		return true;
	} catch (error) {
		notice.hide();
		notifyError(
			`Vale connection failed\n\nPlease ensure Vale is installed and the binary path is correct.`,
			8000,
			`${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}
