import type { Severity } from "utils/constants";
import { SEVERITY_METADATA } from "utils/constants";

// Re-export Severity for convenience
export type { Severity };

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

/** Type guard to validate severity strings at runtime */
export function isSeverity(value: unknown): value is Severity {
	return typeof value === "string" && value in SEVERITY_METADATA;
}

/** Get icon for severity level */
export function getSeverityIcon(severity: Severity): string {
	return SEVERITY_METADATA[severity].icon;
}

/** Get formatted label for severity level */
export function getSeverityLabel(severity: Severity): string {
	return SEVERITY_METADATA[severity].label;
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
	Span: [number, number];
	Match: string;
}

/** Processed representation of a Vale issue for plugin use. */
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

/** Configuration parameters for Vale execution. */
export interface ValeRuntimeConfig {
	valeBinary: string;
	valeConfig: string;
	workingDir: string;
	timeoutMs: number;
}

/**
 * Configuration settings for the Vale plugin.
 * @interface ValePluginSettings
 * @property {string} valeBinaryPath - Path to the Vale binary executable.
 * @property {string} valeConfigPath - Path to the Vale configuration file.
 * @property {string[]} excludedFiles - Array of file patterns to exclude from Vale checks.
 * @property {boolean} showInlineAlerts - Whether to display inline alerts in the editor.
 * @property {number} debounceMs - Debounce delay in milliseconds for checking triggers.
 * @property {string[]} disabledFiles - Array of file paths that are currently disabled from checking.
 * @property {boolean} automaticChecking - Whether to automatically check files on changes.
 */
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

/**
 * Represents a Vale process configuration and execution interface.
 * Defines the command, arguments, and callback handler for a Vale linting process.
 *
 * @interface ValeProcess
 *
 * @property {string} command - The command to execute for the Vale process.
 * @property {string[]} args - Array of command-line arguments to pass to the Vale command.
 * @property {number} [timeoutMs] - Optional timeout in milliseconds for the Vale process execution.
 * @property {Function} onClose - Callback function invoked when the Vale process closes.
 * @param {number} onClose.returnCode - The exit code returned by the Vale process.
 * @param {string} onClose.stdout - The standard output produced by the Vale process.
 * @param {string} onClose.stderr - The standard error output produced by the Vale process.
 * @returns {object} An object containing the process status and result message.
 * @returns {boolean} returns.status - Indicates whether the process completed successfully.
 * @returns {string} returns.message - A message describing the process result or any errors encountered.
 */
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
