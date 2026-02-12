/** Configuration settings for the Vale plugin. */
export interface ValePluginSettings {
	valeBinaryPath: string;
	valeConfigPath: string;
	excludedFiles: string[];
	showInlineAlerts: boolean;
	debounceMs: number;
	disabledFiles: string[];
	automaticChecking: boolean;
	valeProcessTimeoutMs: number;
}

/** Represents a Vale process configuration and execution interface. */
export interface ValeProcess {
	command: string;
	args: string[];
	timeoutMs?: number;
	onClose(
		returnCode: number,
		stdout: string,
		stderr: string,
	): { status: boolean; message: string };
}
