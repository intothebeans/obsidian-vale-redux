import {
	EditorView,
	hoverTooltip,
	ViewPlugin,
	ViewUpdate,
} from "@codemirror/view";
import { setValeDecorationsEffect, valeDecorationsField } from "./decorations";
import { findIssueAtPosition } from "utils/position-utils";
import { createTooltipDOM } from "ui/tooltips";
import { App, MarkdownView } from "obsidian";
import { IssueManager } from "core/issue-manager";
import { Extension } from "@codemirror/state";
import { temporaryHighlightField } from "./highlights";

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
const valeDecorationsExtension = [
	valeDecorationsField,
	valeHoverTooltip,
	temporaryHighlightField,
];

/**
 * Creates the Vale decoration extension that bridges IssueManager and CodeMirror decorations
 */
export function buildValeEditorExtension(
	app: App,
	issueManager: IssueManager,
): Extension {
	const viewMap = new WeakMap<EditorView, string>();
	const editorViewRegistry = createViewRegistry(app, issueManager, viewMap);

	// Listen for external issue updates from IssueManager
	issueManager.on("issues-updated", (filePath: string) => {
		app.workspace.iterateAllLeaves((leaf) => {
			if (leaf.view instanceof MarkdownView) {
				const editor = leaf.view.editor;
				// @ts-ignore - Access CodeMirror instance
				const cm = editor.cm as EditorView;
				if (cm && viewMap.get(cm) === filePath) {
					const issues = issueManager.getIssues(filePath);
					requestAnimationFrame(() => {
						cm.dispatch({
							effects: setValeDecorationsEffect.of(issues),
						});
					});
				}
			}
		});
	});

	return [valeDecorationsExtension, editorViewRegistry];
}

function createViewRegistry(
	app: App,
	issueManager: IssueManager,
	viewMap: WeakMap<EditorView, string>,
): Extension {
	return ViewPlugin.fromClass(
		class {
			constructor(view: EditorView) {
				const filePath = this.getFilePathforView(app, view);
				if (filePath) {
					viewMap.set(view, filePath);
					const issues = issueManager.getIssues(filePath);
					// Defer dispatch — constructor runs during an update cycle
					requestAnimationFrame(() => {
						view.dispatch({
							effects: setValeDecorationsEffect.of(issues),
						});
					});
				}
			}

			update(update: ViewUpdate) {
				const filePath = this.getFilePathforView(app, update.view);
				if (filePath) {
					viewMap.set(update.view, filePath);
				}
			}

			destroy() {
				// Cleanup handled by WeakMap
			}

			/** Helper function that gets the path for the active view */
			private getCurrentFilePath(app: App): string | null {
				const activeView =
					app.workspace.getActiveViewOfType(MarkdownView);
				return activeView?.file?.path || null;
			}

			/** Gets the file path for a given CodeMirror EditorView */
			private getFilePathforView(
				app: App,
				view: EditorView,
			): string | null {
				let filePath: string | null = null;
				app.workspace.iterateAllLeaves((leaf) => {
					if (leaf.view instanceof MarkdownView) {
						// @ts-ignore - Access CodeMirror instance
						if ((leaf.view.editor.cm as EditorView) === view) {
							filePath = leaf.view.file?.path || null;
						}
					}
				});
				return filePath || this.getCurrentFilePath(app);
			}
		},
	);
}
