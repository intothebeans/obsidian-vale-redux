export const VALE_TIMEOUT_MS = 10000;

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
