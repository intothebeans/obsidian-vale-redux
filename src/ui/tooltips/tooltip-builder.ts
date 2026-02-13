import { EditorView } from "@codemirror/view";
import { ValeIssue } from "types";
import { createActionUI } from "./tooltip-actions";

/**
 * Create the hover tooltip DOM element
 * @author ChrisChinchilla
 */
export function createTooltipDOM(
	view: EditorView,
	issue: ValeIssue,
): HTMLElement {
	const container = document.createDiv({ cls: "vale-tooltip-container" });

	const severityBadge = document.createDiv({
		cls: `vale-tooltip-severity vale-tooltip-severity--${issue.severity}`,
		text: issue.severity.toUpperCase(),
	});
	container.appendChild(severityBadge);

	const messageText = document.createDiv({
		cls: "vale-tooltip-message",
		text: issue.message,
	});
	container.appendChild(messageText);

	const actionUI = createActionUI(view, issue);
	if (actionUI) {
		container.appendChild(actionUI);
	}

	const footer = document.createDiv({ cls: "vale-tooltip-bottom" });

	const checkName = document.createDiv({
		cls: "vale-tooltip-check",
		text: `Check: ${issue.check}`,
	});
	footer.appendChild(checkName);

	if (issue.link) {
		const linkEl = document.createEl("a", {
			cls: "vale-tooltip-link",
			href: issue.link,
			text: "Learn more →",
			type: "external",
		});
		linkEl.onclick = (e) => {
			e.preventDefault();
			window.open(issue.link, "_blank");
		};
		footer.appendChild(linkEl);
	}

	container.appendChild(footer);

	return container;
}
