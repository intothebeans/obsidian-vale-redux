import { SEVERITIES } from "utils/constants";

/** Represents the complete output from Vale linter for multiple files. */
export interface ValeOutput {
	[filename: string]: ValeAlert[];
}

export interface ValeRunnerResult {
	success: boolean;
	issues: ValeIssue[];
	error?: string;
}

export class ValeSeverity {
	private severity: string;
	constructor(severity: string) {
		severity = severity.toLowerCase();
		if (Object.values(SEVERITIES).includes(severity)) {
			this.severity = severity;
		} else {
			throw new Error(`Invalid severity level: ${severity}`);
		}
	}

	getIcon(): string {
		switch (this.severity) {
			case "suggestion":
				return "💡";
			case "warning":
				return "⚠️";
			case "error":
				return "❌";
			default:
				return "";
		}
	}

	getLabel(): string {
		return this.severity.charAt(0).toUpperCase() + this.severity.slice(1);
	}

	getSeverity(): string {
		return this.severity;
	}
}

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
	valeBinary: string;
	valeConfig: string;
	workingDir: string;
}

/** User configuration settings for the Vale plugin. */
export interface ValePluginSettings {
	// valeBinaryPath: "vale" for PATH, or absolute path to binary
	// valeConfigPath: relative to vault root by default, or absolute path
	valeBinaryPath: string;
	valeConfigPath: string | null;
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
