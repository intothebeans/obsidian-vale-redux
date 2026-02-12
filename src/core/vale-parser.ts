import { ValeAlert, ValeIssue, ValeOutput, ValeSeverity } from "types";

export function parseValeOutput(output: ValeOutput): ValeIssue[] {
	const issues: ValeIssue[] = [];
	for (const [filePath, alerts] of Object.entries(output)) {
		for (const alert of alerts) {
			try {
				const issue = parseValeAlert(filePath, alert);
				issues.push(issue);
			} catch (error) {
				console.error(
					`Error parsing alert for file ${filePath}:`,
					error,
					alert,
				);
			}
		}
	}
	return issues;
}

function parseValeAlert(filePath: string, alert: ValeAlert): ValeIssue {
	const fixes: string[] = [];
	if (alert.Action && alert.Action.Params) {
		fixes.push(...alert.Action.Params);
	}

	return {
		file: filePath,
		line: alert.Line,
		check: alert.Check,
		startCol: alert.Span[0] as number,
		endCol: alert.Span[1] as number,
		severity: new ValeSeverity(alert.Severity),
		message: alert.Message,
		match: alert.Match,
		isFixable: fixes.length > 0,
		fixes,
		link: alert.Link || undefined,
		id: `${filePath}:${alert.Line}:${alert.Span[0]}:${alert.Check}`,
	};
}
