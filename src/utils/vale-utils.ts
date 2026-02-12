/* eslint-disable obsidianmd/ui/sentence-case */
import { Notice } from "obsidian";
import { ValeConfig, ValeConfigErrorOutput } from "types";
import { notifyError, spawnProcessWithOutput } from "./utils";

/**
 * Standard exit code checker - only returnCode 0 is success.
 * Use this for Vale commands that should always succeed (like --version, ls-config).
 */
function returnCodeFail(
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
	valeBinaryPath: string,
): Promise<boolean> {
	const notice = new Notice("Testing Vale connection...", 0);
	const valeProcess = {
		command: valeBinaryPath,
		args: ["--version"],
		timeoutMs: 5000,
		onClose: returnCodeFail,
	};
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

export async function getValeStylesPath(
	binaryPath: string,
	configPath: string,
): Promise<string> {
	const valeProcess = {
		command: binaryPath,
		args: ["ls-dirs", "--output=JSON", `--config=${configPath}`],
		timeoutMs: 5000,
		onClose: returnCodeFail,
	};
	const cmdOutput = await spawnProcessWithOutput(valeProcess);
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
): Promise<ValeConfig | undefined> {
	try {
		const valeProcess = {
			command: valeBinaryPath,
			args: ["ls-config", "--output=JSON", `--config=${configPath}`],
			timeoutMs: 5000,
			onClose: returnCodeFail,
		};
		const cmdOutput = await spawnProcessWithOutput(valeProcess);

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
		return undefined;
	}
}

function isValeError(response: unknown): response is ValeConfigErrorOutput {
	return (
		typeof response === "object" &&
		response !== null &&
		"Code" in response &&
		"Text" in response
	);
}
