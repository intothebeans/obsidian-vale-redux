import {
	EditorView,
	Decoration,
	DecorationSet,
	ViewPlugin,
	ViewUpdate,
	hoverTooltip,
} from "@codemirror/view";
import { StateField, StateEffect, Extension } from "@codemirror/state";
import type { ValeIssue } from "types";
import { App, MarkdownView } from "obsidian";
import { findIssueAtPosition } from "utils/position-utils";
import { IssueManager } from "./issue-manager";
import { createDecorations } from "ui/editor";
import { createTooltipDOM } from "ui/tooltips";

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
		let decorations = value.decorations.map(tr.changes);
		let issues = value.issues;

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
 * Create a hover tooltip extension for Vale issues
 */
const valeHoverTooltip = hoverTooltip((view, pos) => {
	const state = view.state.field(valeDecorationsField);
	const issue = findIssueAtPosition(
		view,
		pos,
		state.decorations,
		state.issues,
	);

	if (!issue) {
		return null;
	}

	return {
		pos,
		above: true,
		create: () => ({ dom: createTooltipDOM(view, issue) }),
	};
});

// The Vale decorations extension
const valeDecorationsExtension = [valeDecorationsField, valeHoverTooltip];

/**
 * Creates the Vale decoration extension that bridges IssueManager and CodeMirror decorations
 */
export function createValeDecorationExtension(
	app: App,
	issueManager: IssueManager,
): Extension {
	const viewMap = new WeakMap<EditorView, string>();
	const viewTracker = ViewPlugin.fromClass(
		class {
			constructor(view: EditorView) {
				const filePath = getFilePathforView(app, view);
				if (filePath) {
					viewMap.set(view, filePath);
					const issues = issueManager.getIssues(filePath);
					view.dispatch({
						effects: setValeDecorationsEffect.of(issues),
					});
				}
			}

			update(update: ViewUpdate) {
				const filePath = getFilePathforView(app, update.view);
				if (filePath) {
					viewMap.set(update.view, filePath);
				}
			}

			destroy() {
				// Cleanup handled by WeakMap
			}
		},
	);

	const updateListener = EditorView.updateListener.of((update) => {
		if (update.docChanged || update.viewportChanged) {
			const filePath = getCurrentFilePath(app);
			if (filePath) {
				const issues = issueManager.getIssues(filePath);
				update.view.dispatch({
					effects: setValeDecorationsEffect.of(issues),
				});
			}
		}
	});

	// Listen for external issue updates from IssueManager
	issueManager.on("issues-updated", (filePath: string) => {
		app.workspace.iterateAllLeaves((leaf) => {
			if (leaf.view instanceof MarkdownView) {
				const editor = leaf.view.editor;
				// @ts-ignore - Access CodeMirror instance
				const cm = editor.cm as EditorView;
				if (cm && viewMap.get(cm) === filePath) {
					const issues = issueManager.getIssues(filePath);
					cm.dispatch({
						effects: setValeDecorationsEffect.of(issues),
					});
				}
			}
		});
	});

	return [valeDecorationsExtension, viewTracker, updateListener];
}

/** Helper function that gets the path for the active view */
function getCurrentFilePath(app: App): string | null {
	const activeView = app.workspace.getActiveViewOfType(MarkdownView);
	return activeView?.file?.path || null;
}

/** Gets the file path for a given CodeMirror EditorView */
function getFilePathforView(app: App, view: EditorView): string | null {
	let filePath: string | null = null;
	app.workspace.iterateAllLeaves((leaf) => {
		if (leaf.view instanceof MarkdownView) {
			// @ts-ignore - Access CodeMirror instance
			if ((leaf.view.editor.cm as EditorView) === view) {
				filePath = leaf.view.file?.path || null;
			}
		}
	});
	return filePath || getCurrentFilePath(app);
}
