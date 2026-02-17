export const SEVERITY_METADATA = {
	suggestion: {
		icon: "💡",
		label: "Suggestion",
	},
	warning: {
		icon: "⚠️",
		label: "Warning",
	},
	error: {
		icon: "❌",
		label: "Error",
	},
} as const;

export type Severity = keyof typeof SEVERITY_METADATA;

export const ISSUES_PANEL_VIEW_TYPE = "vale-issues-view";

export type ActionType = "remove" | "replace" | "suggest" | "edit";
export const ALERT_LEVEL_TO_STRING = {
	1: "suggestion",
	2: "warning",
	3: "error",
} as const;

export const ALERT_STRING_TO_LEVEL = {
	suggestion: 1,
	warning: 2,
	error: 3,
} as const;

export type AlertLevelString = keyof typeof ALERT_LEVEL_TO_STRING;
export type AlertLevelNumber = keyof typeof ALERT_STRING_TO_LEVEL;
