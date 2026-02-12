import { ValeAlert, ValeIssue, ValeOutput, type Severity } from "types";
import { SEVERITY_METADATA } from "utils/constants";
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
		link: alert.Link || undefined,
		id: `${filePath}:${alert.Line}:${alert.Span[0]}:${alert.Check}`,
	};
}

/** Type guard to validate severity strings at runtime */
function _isSeverity(value: unknown): value is Severity {
	return typeof value === "string" && value in SEVERITY_METADATA;
}
