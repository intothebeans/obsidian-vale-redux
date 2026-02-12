import { ValeConfig } from "types";
import { notifyError } from "utils/error-utils";
import { spawnProcessWithOutput } from "utils/process-utils";
import { returnCodeFail } from "utils/vale-utils";

interface ValeConfigErrorOutput {
	Line: number;
	Path: string;
	Text: string;
	Code: string;
	Span: number;
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
