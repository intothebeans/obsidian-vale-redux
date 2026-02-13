import { EditorView } from "@codemirror/view";
import { applyValeAction } from "core/vale-actions";
import { ButtonComponent } from "obsidian";
import { ValeIssue } from "types";
import { calculateIssuePosition } from "utils/position-utils";
import { parseValeAction } from "core/vale-parser";
import { getSpellingSuggestions } from "core/spell-checker";

/**
 * Create a remove button element using Obsidian's ButtonComponent
 */
export function createRemoveButton(
	view: EditorView,
	issue: ValeIssue,
): HTMLElement {
	const container = document.createElement("div");
	container.className = "vale-tooltip-actions";

	const button = new ButtonComponent(container);
	button.setButtonText("Remove");
	button.setCta();
	button.onClick(() => {
		if (applyValeAction(view, issue)) {
			view.focus();
		}
	});

	return container;
}

/**
 * Create a header element for suggestions section
 */
export function createSuggestionsHeader(text: string): HTMLElement {
	return document.createDiv({
		cls: "vale-tooltip-suggestions-header",
		text: text,
	});
}

/**
 * Create suggestion buttons using Obsidian's ButtonComponent
 * @param directApply - If true, directly replace text without using Vale action (for spell check)
 * @author ChrisChinchilla
 */
export function createSuggestionButtons(
	view: EditorView,
	issue: ValeIssue,
	suggestions: string[],
	directApply: boolean = false,
): HTMLElement {
	const container = document.createDiv({
		cls: "vale-tooltip-suggestions-list",
	});

	suggestions.forEach((suggestion, index) => {
		const button = new ButtonComponent(container);
		button.setButtonText(suggestion);
		button.onClick(() => {
			if (directApply) {
				// Directly replace text for spell check suggestions
				const position = calculateIssuePosition(issue, view.state.doc);
				if (position) {
					const { from, to } = position;
					view.dispatch({
						changes: { from, to, insert: suggestion },
					});
					view.focus();
				}
			} else {
				// Use Vale action for regular suggestions
				if (applyValeAction(view, issue, index)) {
					view.focus();
				}
			}
		});
	});

	return container;
}

/**
 * Create action UI for Vale issue (suggestions or remove button)
 * Handles both regular Vale suggestions and spell check suggestions
 * @author ChrisChinchilla
 */
export function createActionUI(
	view: EditorView,
	issue: ValeIssue,
): HTMLElement | null {
	const { operationType, suggestions, needsSpellCheck } = parseValeAction(
		issue.action,
	);

	// Remove action
	if (operationType === "remove") {
		return createRemoveButton(view, issue);
	}

	// Regular suggestions
	if (suggestions.length > 0 && !needsSpellCheck) {
		const container = document.createDiv();
		container.appendChild(createSuggestionsHeader("Suggestions:"));
		container.appendChild(
			createSuggestionButtons(view, issue, suggestions),
		);
		return container;
	}

	// Spell check suggestions (async)
	if (needsSpellCheck) {
		const container = document.createDiv();
		container.appendChild(createSuggestionsHeader("Spelling suggestions:"));
		// Create placeholder
		const placeholder = document.createDiv({
			cls: "vale-tooltip-loading",
			text: "Loading...",
		});
		container.appendChild(placeholder);
		// Load async
		getSpellingSuggestions(issue.match)
			.then((spellSuggestions) => {
				placeholder.remove();
				if (spellSuggestions.length > 0) {
					container.appendChild(
						createSuggestionButtons(
							view,
							issue,
							spellSuggestions,
							true,
						),
					);
				} else {
					const noneEl = document.createElement("div");
					noneEl.textContent = "No suggestions available";
					container.appendChild(noneEl);
				}
			})
			.catch((e) => {
				placeholder.remove();
				const errorEl = document.createDiv({
					text: "Error loading suggestions",
				});
				container.appendChild(errorEl);
			});
		return container;
	}

	return null;
}
