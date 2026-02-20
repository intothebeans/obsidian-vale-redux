/** Configuration settings for the Vale plugin. */
export interface ValePluginSettings {
	/** Absolute Path to binary */
	valeBinaryPath: string;
	valeConfigPath: string;
	valeConfigPathAbsolute: string;
	excludedFiles: string[];
	showInlineAlerts: boolean;
	showInlineHighlights: boolean;
	showValeStatusInStatusBar: boolean;
	showIssuesInStatusBar: boolean;
	debounceMs: number;
	disabledFiles: string[];
	automaticChecking: boolean;
	valeProcessTimeoutMs: number;
	valeConfigBackupsToKeep: number;
	valeConfigBackupDir: string;
	backupPaths: { ts: string; path: string }[];
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
