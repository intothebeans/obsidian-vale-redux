import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet } from "@codemirror/view";
import { ValeIssue } from "types";
import { calculateIssuePosition } from "utils/position-utils";

/**
 * Create decorations from Vale issues
 * @author ChrisChinchilla
 */
export function createDecorations(
	issues: ValeIssue[],
	doc: {
		lines: number;
		length: number;
		line: (num: number) => { from: number };
	},
): { decorations: DecorationSet; issues: ValeIssue[] } {
	const builder = new RangeSetBuilder<Decoration>();

	for (const issue of issues) {
		try {
			const position = calculateIssuePosition(issue, doc);
			if (!position) {
				continue;
			}

			const { from, to } = position;
			const className = `cm-vale-${issue.severity}`;

			const decoration = Decoration.mark({
				class: className,
				attributes: {
					"data-vale-message": issue.message,
					"data-vale-check": issue.check,
				},
			});

			builder.add(from, to, decoration);
		} catch (e) {
			console.warn(
				"Failed to create Vale decoration for issue:",
				issue,
				e,
			);
		}
	}

	return { decorations: builder.finish(), issues };
}
