import { DecorationSet, EditorView } from "@codemirror/view";
import { type ValeIssue } from "types";

/**
 * Calculate the absolute position range for a Vale issue in the document
 * @author ChrisChinchilla
 */
export function calculateIssuePosition(
	issue: ValeIssue,
	doc: {
		lines: number;
		length: number;
		line: (num: number) => { from: number };
	},
): { from: number; to: number } | null {
	const line = issue.line - 1; // Vale uses 1-indexed lines

	if (line < 0 || line >= doc.lines) {
		return null;
	}

	const lineObj = doc.line(line + 1); // CodeMirror uses 1-indexed for doc.line()
	const from = lineObj.from + (issue.startCol - 1); // Convert to 0-indexed
	const to = lineObj.from + issue.endCol; // endCol is exclusive

	if (from < 0 || to > doc.length || from >= to) {
		return null;
	}

	return { from, to };
}

/**
 * Find the Vale issue at the given position
 * @author ChrisChinchilla
 */
export function findIssueAtPosition(
	view: EditorView,
	pos: number,
	decorations: DecorationSet,
	currentIssues: ValeIssue[],
): ValeIssue | undefined {
	let foundIssue: ValeIssue | undefined;

	decorations.between(pos, pos, (from, to): void => {
		if (pos >= from && pos <= to && !foundIssue) {
			for (const issue of currentIssues) {
				const position = calculateIssuePosition(issue, view.state.doc);
				if (position && from === position.from && to === position.to) {
					foundIssue = issue;

					return; // Stop iterating
				}
			}
		}
	});

	return foundIssue;
}
