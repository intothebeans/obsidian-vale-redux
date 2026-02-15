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
export const AlertLevel = {
	1: "suggestion",
	2: "warning",
	3: "error",
};
export type AlertLevel = keyof typeof AlertLevel;
