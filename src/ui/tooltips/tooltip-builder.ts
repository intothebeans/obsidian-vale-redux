import { EditorView } from "@codemirror/view";
import { ValeIssue } from "types";
import { createActionUI } from "./tooltip-actions";

/** Create a div element without using Obsidian's document.createDiv */
export function createDiv(cls?: string, text?: string): HTMLDivElement {
	const el = document.createElement("div");
	if (cls) el.className = cls;
	if (text) el.textContent = text;
	return el;
}

/**
 * Create the hover tooltip DOM element
 * @author ChrisChinchilla
 */
export function createTooltipDOM(
	view: EditorView,
	issue: ValeIssue,
): HTMLElement {
	const container = createDiv("vale-tooltip-container");

	const severityBadge = createDiv(
		`vale-tooltip-severity vale-tooltip-severity--${issue.severity}`,
		issue.severity.toUpperCase(),
	);
	container.appendChild(severityBadge);

	const messageText = createDiv("vale-tooltip-message", issue.message);
	container.appendChild(messageText);

	const actionUI = createActionUI(view, issue);
	if (actionUI) {
		container.appendChild(actionUI);
	}

	const footer = createDiv("vale-tooltip-bottom");

	const checkName = createDiv("vale-tooltip-check", `Check: ${issue.check}`);
	footer.appendChild(checkName);

	if (issue.link) {
		const linkEl = document.createElement("a");
		linkEl.className = "vale-tooltip-link";
		linkEl.href = issue.link;
		linkEl.textContent = "Learn more →";
		linkEl.onclick = (e) => {
			e.preventDefault();
			window.open(issue.link, "_blank");
		};
		footer.appendChild(linkEl);
	}

	container.appendChild(footer);

	return container;
}
