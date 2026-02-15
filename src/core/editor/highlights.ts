import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { App, MarkdownView } from "obsidian";
import { ValeIssue } from "types";
import { calculateIssuePosition } from "utils/position-utils";

// Define a state effect to add a temporary highlight
export const addIssueHighlight = StateEffect.define<{
	from: number;
	to: number;
}>();

// Define a state effect to clear the temporary highlight
export const clearIssueHighlight = StateEffect.define<null>();

/** Adds an HTML class to the span matching an issue for a temporary highlight */
export const temporaryHighlightField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},

	update(decorations, tr) {
		decorations = decorations.map(tr.changes);
		for (const effect of tr.effects) {
			if (effect.is(addIssueHighlight)) {
				const { from, to } = effect.value;
				const decoration = Decoration.mark({
					class: "cm-vale-temporary-highlight",
				});
				return Decoration.set([decoration.range(from, to)]);
			}

			if (effect.is(clearIssueHighlight)) {
				return Decoration.none;
			}
		}

		return decorations;
	},

	provide: (f) => EditorView.decorations.from(f),
});

export function highlightIssueInEditor(issue: ValeIssue, app: App): void {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	if (!view) return;

	// @ts-ignore - Access CodeMirror instance
	const editorView = view.editor.cm as EditorView;
	if (!editorView) return;

	// Calculate the position of the issue in the document
	const position = calculateIssuePosition(issue, editorView.state.doc);
	if (!position) return;

	const { from, to } = position;

	// Add temporary highlight decoration
	editorView.dispatch({
		effects: addIssueHighlight.of({ from, to }),
	});

	// Clear highlight after 800ms
	setTimeout(() => {
		editorView.dispatch({
			effects: clearIssueHighlight.of(null),
		});
	}, 800);
}
