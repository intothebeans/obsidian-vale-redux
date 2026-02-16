/** Represents the Vale configuration options
 */
export interface ValeConfig {
	StylesPath?: string;
	MinAlertLevel?: number;
	IgnoredScopes?: string[];
	SkippedScopes?: string[];
	IgnoredClasses?: string[];
	Vocab?: string[];
	WordTemplate?: string;
	Packages?: string[];
	"*"?: ValeGlobalSection;
	formats?: Record<string, string>;
	syntaxSections?: Record<string, ValeSyntaxSection>;

	/** Unused */
	asciidoctor?: Record<string, string>;
	NLPEndpoint?: string;
}
interface ValeSyntaxSection {
	BasedOnStyles?: string[];
	BlockIgnores?: string[];
	TokenIgnores?: string[];
	CommentDelimeters?: [string, string];
	Transform?: string;
	Lang?: string;
	Blueprint?: string;
	CheckOverrides?: ValeCheckOverride[];
}

interface ValeGlobalSection {
	BasedOnStyles?: string[];
	BlockIgnores?: string[];
	TokenIgnores?: string[];
	Lang?: string;
	CheckOverrides?: ValeCheckOverride[];
}

interface ValeCheckOverride {
	Check: string;
	Level?: string | undefined;
	Enabled?: boolean | undefined;
}

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
