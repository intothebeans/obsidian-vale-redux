import { ValeAlert, ValeIssue, ValeOutput, type Severity } from "types";
import { ActionType, SEVERITY_METADATA } from "utils/constants";
import { notifyError } from "utils/error-utils";

/** Parses the output into ValeIssue objects */
export function parseValeOutput(output: ValeOutput): ValeIssue[] {
	const issues: ValeIssue[] = [];
	for (const [filePath, alerts] of Object.entries(output)) {
		for (const alert of alerts) {
			try {
				const issue = _parseValeAlert(filePath, alert);
				issues.push(issue);
			} catch (error) {
				notifyError(
					`Error parsing Vale alert for file: ${filePath}`,
					8000,
					`${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	}
	return issues;
}

/** Parse a ValeAlert into the plugin's internal ValeIssue representation */
function _parseValeAlert(filePath: string, alert: ValeAlert): ValeIssue {
	const fixes: string[] = [];
	if (alert.Action && alert.Action.Params) {
		fixes.push(...alert.Action.Params);
	}

	const action = alert.Action
		? {
				name: alert.Action.Name,
				params: alert.Action.Params,
			}
		: undefined;

	const severity = alert.Severity.toLowerCase();
	if (!_isSeverity(severity)) {
		throw new Error(`Invalid severity level: ${alert.Severity}`);
	}

	return {
		file: filePath,
		line: alert.Line,
		check: alert.Check,
		startCol: alert.Span[0],
		endCol: alert.Span[1],
		severity,
		message: alert.Message,
		match: alert.Match,
		isFixable: fixes.length > 0,
		fixes,
		action,
		link: alert.Link || undefined,
		id: `${filePath}:${alert.Line}:${alert.Span[0]}:${alert.Check}`,
	};
}

/** Type guard to validate severity strings at runtime */
function _isSeverity(value: unknown): value is Severity {
	return typeof value === "string" && value in SEVERITY_METADATA;
}

/**
 * Parse Vale action to determine operation type and suggestions
 * Note: For spelling actions with 'spellings' placeholder, returns empty suggestions
 * (actual suggestions need to be fetched from system dictionary)
 * @author ChrisChinchilla
 */

export function parseValeAction(action: ValeIssue["action"]): {
	operationType: string;
	suggestions: string[];
	needsSpellCheck: boolean;
} {
	if (
		!action ||
		!action.name ||
		!action.params ||
		action.params.length === 0
	) {
		return { operationType: "", suggestions: [], needsSpellCheck: false };
	}

	const actionName = action.name.toLowerCase() as ActionType;

	// For 'edit' actions, first param is the operation type
	if (actionName === "edit") {
		const params = action.params;
		return {
			operationType: (params && params[0] ? params[0] : "").toLowerCase(),
			suggestions: params?.slice(1) ?? [],
			needsSpellCheck: false,
		};
	}

	// For 'suggest' actions with 'spellings' placeholder
	if (
		actionName === "suggest" &&
		action.params.length === 1 &&
		action.params[0] === "spellings"
	) {
		return {
			operationType: "suggest",
			suggestions: [], // Empty - will be fetched from system dictionary
			needsSpellCheck: true,
		};
	}

	// For other actions, all params are suggestions
	return {
		operationType: actionName,
		suggestions: action.params,
		needsSpellCheck: false,
	};
}
