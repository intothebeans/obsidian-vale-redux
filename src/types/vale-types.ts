import type { Severity } from "utils/constants";
export type { Severity } from "utils/constants";

/** Represents the Vale configuration options
 */
export interface ValeConfig {
	StylesPath?: string;
	MinAlertLevel?: Severity;
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
export interface ValeSyntaxSection {
	BasedOnStyles?: string[];
	BlockIgnores?: string[];
	TokenIgnores?: string[];
	CommentDelimiters?: [string, string];
	/** UNUSED: for XML to HTML, not MD */
	Transform?: string;
	Lang?: string;
	Blueprint?: string;
	CheckOverrides?: ValeCheckOverride[];
}

export interface ValeGlobalSection {
	BasedOnStyles?: string[];
	BlockIgnores?: string[];
	TokenIgnores?: string[];
	Lang?: string;
	CheckOverrides?: ValeCheckOverride[];
}

export interface ValeCheckOverride {
	Check: string;
	Level?: Severity | undefined;
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
	Severity: Severity;
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
