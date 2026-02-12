/** Mirrors the JSON output by vale ls-config
 *  @see https://github.com/errata-ai/vale/blob/v3/internal/core/config.go
 */
// NOTE: packages are special and read directly from the file.
// logic for displaying them in settings requires reading the file, not just using the CLI

export interface ValeConfigFull {
	BlockIgnores?: Record<string, string[]>;
	Checks?: string[];
	Formats?: Record<string, string>;
	Asciidoctor?: Record<string, string>;
	FormatToLang?: Record<string, string>;
	GBaseStyles?: string[];
	GChecks?: Record<string, boolean>;
	IgnoredClasses?: string[];
	IgnoredScopes?: string[];
	MinAlertLevel?: number;
	Vocab?: string[];
	RuleToLevel?: Record<string, string>;
	SBaseStyles?: Record<string, string[]>;
	SChecks?: Record<string, string[]>;
	SkippedScopes?: string[];
	Stylesheets?: string[];
	TokenIgnores?: Record<string, string[]>;
	CommentDelimiters?: Record<string, string[2]>;
	WordTemplate?: string;
	/** UNUSED */
	RootINI?: string;
	/** UNUSED  */
	Paths?: string[];
	/** UNUSED */
	ConfigFiles?: string[];
	/** UNUSED */
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
	action?: {
		name: string;
		params: string[];
	};
	link?: string;
	id: string;
}

/** Severity type - derived from SEVERITY_METADATA in constants */
export type Severity = "error" | "warning" | "suggestion";
