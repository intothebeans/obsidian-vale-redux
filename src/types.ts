/** Represents the complete output from Vale linter for multiple files. */
export interface ValeOutput {
	[filename: string]: ValeAlert[];
}

/** Severity levels for Vale issues. */
export type ValeSeverity = "suggestion" | "warning" | "error";

/** Mirrors the Vale JSON output format for individual alerts. */
export interface ValeAlert {
	Action: {
		Name: string;
		Params: string[];
	};
	Check: string;
	Description: string;
	Line: number;
	Link: string;
	Message: string;
	Severity: string;
	Span: number[];
	Match: string;
}

/** Processed representation of a Vale issue for plugin use. */
export interface ValeIssue {
	file: string;
	line: number;
	startCol: number; // from ValeAlert.Span[0]
	endCol: number; // from ValeAlert.Span[1]
	severity: ValeSeverity;
	message: string;
	check: string;
	match: string;
	isFixable: boolean;
	fixes: string[]; // from ValeAlert.Action.Params
	link?: string;
	id: string;
}

/** Configuration parameters for Vale execution. */
export interface ValeRuntimeConfig {
	filePath: string;
	valeBinary: string;
	valeConfig: string;
	workingDir: string;
}

/** User configuration settings for the Vale plugin. */
export interface ValePluginSettings {
	valeBinaryPath: string;
	valeConfigPath: string;
	excludedFiles: string[];
	showInlineAlerts: boolean;
	debounceMs: number;
	disabledFiles: string[];
	automaticChecking: boolean;
	valeConfig?: ValeConfig;
}

// TODO: Implement class
export class ValeConfig {
	// Class Stub
	stylesPath: string;

	constructor(stylesPath: string) {
		this.stylesPath = stylesPath;
	}

	getStylesPath(): string {
		return this.stylesPath;
	}
}
