import { SEVERITIES } from "utils/constants";
/** Mirrors the JSON output by vale ls-config
 *  https://github.com/errata-ai/vale/blob/v3/internal/core/config.go
 */
// NOTE: packages are special and read directly from the file.
// logic for displaying them in settings requires reading the file, not just using the CLI

export interface ValeConfigFull {
	/** Maps path selection blob to block ignores */
	BlockIgnores?: Record<string, string[]>;
	/** All checks being configured */
	Checks?: string[];
	/** Maps unknown to known formats */
	Formats?: Record<string, string>;
	/** UNUSED - Asciidoctor attributes */
	Asciidoctor?: Record<string, string>;
	/** Language to use for a format */
	FormatToLang?: Record<string, string>;
	/** Global [*] base styles */
	GBaseStyles?: string[];
	/** Global [*] checks */
	GChecks?: Record<string, boolean>;
	/** List of HTML classes to ignore */
	IgnoredClasses?: string[];
	/** List of inline-level HTML tags to ignore */
	IgnoredScopes?: string[];
	/** Minimum alert level to report */
	MinAlertLevel?: number;
	/** Vocab definitions to use in this project */
	Vocab?: string[];
	/** Single rule alert level changes */
	RuleToLevel?: Record<string, string>;
	/** Format specific base styles */
	SBaseStyles?: Record<string, string[]>;
	/** Format specific checks */
	SChecks?: Record<string, string[]>;
	/** A list of block-level HTML tags to ignore */
	SkippedScopes?: string[];
	/** UNUSED - XSLT Stylesheet */
	Stylesheets?: string[];
	/** List of regexs to ignore in inline-level content */
	TokenIgnores?: Record<string, string[]>;
	/** Strings to treat as comment delimiters (start delim, end delim) */
	CommentDelimiters?: Record<string, string[2]>;
	/** Template used for turning yaml arrays in rule definitions into a regex */
	WordTemplate?: string;
	/** UNUSED - Path to the root INI configuration file */
	RootINI?: string;
	/** UNUSED - Paths to search for styles */
	Paths?: string[];
	/** UNUSED - Configuration files to load */
	ConfigFiles?: string[];
	/** UNUSED - NLP Endpoint */
	NLPEndpoint?: string;
}

export type ValeConfig = Omit<
	ValeConfigFull,
	| "Asciidoctor"
	| "Stylesheets"
	| "RootINI"
	| "Paths"
	| "ConfigFiles"
	| "NLPEndpoint"
>;

export interface ValeConfigErrorOutput {
	Line: number;
	Path: string;
	Text: string;
	Code: string;
	Span: number;
}

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
	valeBinaryPath: string;
	valeConfigPath: string;
	excludedFiles: string[];
	showInlineAlerts: boolean;
	debounceMs: number;
	disabledFiles: string[];
	automaticChecking: boolean;
}

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
