import type { Severity } from "utils/constants";
// Re-export Severity for convenience
export type { Severity };

/** Mirrors the JSON output by vale ls-config
 *  @see https://github.com/errata-ai/vale/blob/v3/internal/core/config.go
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

/** Represents the Vale configuration options used by the plugin,
 * excluding fields that are not relevant for plugin settings.
 */
export type ValeConfig = Omit<
	ValeConfigFull,
	| "Asciidoctor"
	| "Stylesheets"
	| "RootINI"
	| "Paths"
	| "ConfigFiles"
	| "NLPEndpoint"
>;

/** Represents the output of Vale when using JSON output */
export interface ValeOutput {
	[filename: string]: ValeAlert[];
}

/** Represents a linting issue detected by Vale. */
export interface ValeIssue {
	file: string;
	line: number;
	startCol: number; // from ValeAlert.Span[0]
	endCol: number; // from ValeAlert.Span[1]
	severity: Severity;
	message: string;
	check: string;
	match: string;
	isFixable: boolean;
	fixes: string[]; // from ValeAlert.Action.Params
	link?: string;
	id: string;
}

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

/** Mirrors the Vale JSON output format for individual alerts.*/
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
	Span: [number, number];
	Match: string;
}
