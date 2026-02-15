import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";
import type { ValeIssue } from "types";
import { calculateIssuePosition } from "utils/position-utils";

// Define a state effect to update Vale decorations
export const setValeDecorationsEffect = StateEffect.define<ValeIssue[]>();

// Create a state field to manage Vale decorations and associated issues
export const valeDecorationsField = StateField.define<{
	decorations: DecorationSet;
	issues: ValeIssue[];
}>({
	create() {
		return { decorations: Decoration.none, issues: [] };
	},

	update(value, tr) {
		let decorations: DecorationSet = value.decorations.map(tr.changes);
		let issues: ValeIssue[] = value.issues;

		for (const effect of tr.effects) {
			if (effect.is(setValeDecorationsEffect)) {
				const result = createDecorations(effect.value, tr.state.doc);
				decorations = result.decorations;
				issues = result.issues;
			}
		}

		return { decorations, issues };
	},

	provide: (f) =>
		EditorView.decorations.from(f, (value) => value.decorations),
});

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
