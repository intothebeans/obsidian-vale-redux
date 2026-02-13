import { EditorView } from "@codemirror/view";
import { ValeIssue } from "types";
import { calculateIssuePosition } from "utils/position-utils";
import { parseValeAction } from "./vale-parser";

/**
 * Apply a Vale action to the editor
 * @param view - The CodeMirror EditorView
 * @param issue - The Vale issue containing the action
 * @param suggestionIndex - Optional index of the suggestion to apply
 * @returns true if the action was successfully applied
 * @author ChrisChinchilla
 */
export function applyValeAction(
	view: EditorView,
	issue: ValeIssue,
	suggestionIndex?: number,
): boolean {
	if (!issue.action || !issue.action.name) {
		return false;
	}

	const position = calculateIssuePosition(issue, view.state.doc);
	if (!position) {
		return false;
	}

	const { from, to } = position;
	const { operationType, suggestions } = parseValeAction(issue.action);

	try {
		if (operationType === "remove") {
			// Remove the highlighted text
			view.dispatch({ changes: { from, to, insert: "" } });
			return true;
		}

		if (operationType === "replace" || operationType === "suggest") {
			// Replace with a suggestion
			if (suggestions.length === 0) {
				return false;
			}

			const replacement =
				suggestionIndex !== undefined &&
				suggestionIndex < suggestions.length
					? suggestions[suggestionIndex]
					: suggestions[0];

			view.dispatch({ changes: { from, to, insert: replacement } });
			return true;
		}

		console.warn(`Unknown Vale action operation: ${operationType}`);
		return false;
	} catch (e) {
		console.error("Failed to apply Vale action:", e);
		return false;
	}
}
