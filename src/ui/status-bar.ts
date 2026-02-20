import ValePlugin from "main";
import { setIcon } from "obsidian";

export function createValeIssuesStatusBar(
	bar: HTMLElement,
	plugin: ValePlugin,
): void {
	const textbar = bar.createSpan({
		title: "Vale Issues",
	});
	textbar.setText(updateValeIssuesStatusBar(plugin));
	plugin.registerEvent(
		plugin.issueManager.on("issues-updated", () => {
			textbar.setText(updateValeIssuesStatusBar(plugin));
		}),
	);
}

export function createValeStatusStatusBar(
	bar: HTMLElement,
	plugin: ValePlugin,
): void {
	const textbar = bar.createSpan({
		cls: "vale-status-status",
		title: "Vale Status",
	});
	updateValeStatusStatusBar(plugin, textbar);
	plugin.registerEvent(
		plugin.issueManager.on("issues-updated", () => {
			updateValeStatusStatusBar(plugin, textbar);
		}),
	);
}

function updateValeStatusStatusBar(
	plugin: ValePlugin,
	textbar: HTMLElement,
): void {
	const icon = plugin.valeAvailable ? "circle-check" : "circle-x";
	setIcon(textbar, icon);
}

function updateValeIssuesStatusBar(plugin: ValePlugin): string {
	const currentFile = plugin.app.workspace.getActiveFile();
	if (!currentFile) {
		return "No file";
	}
	const issues = plugin.issueManager.getIssuesGroupedBySeverity(
		currentFile.path,
	);
	const errorCount = issues.errors.length ? issues.errors.length : 0;
	const warningCount = issues.warnings.length ? issues.warnings.length : 0;
	const suggestionCount = issues.suggestions.length
		? issues.suggestions.length
		: 0;

	return `${errorCount} error${errorCount !== 1 ? "s" : ""}, ${warningCount} warning${warningCount !== 1 ? "s" : ""}, ${suggestionCount} suggestion${suggestionCount !== 1 ? "s" : ""}`;
}
