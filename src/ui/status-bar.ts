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
		plugin.issueManager.on("issues-updated", (filePath) => {
			textbar.setText(
				updateValeIssuesStatusBar(plugin, filePath as string),
			);
		}),
	);
	if (!plugin.settings.automaticChecking) {
		plugin.registerEvent(
			plugin.app.workspace.on("active-leaf-change", () => {
				textbar.setText(updateValeIssuesStatusBar(plugin));
			}),
		);
		plugin.registerEvent(
			plugin.app.workspace.on("file-open", () => {
				textbar.setText(updateValeIssuesStatusBar(plugin));
			}),
		);
		plugin.registerEvent(
			plugin.app.workspace.on("editor-change", () => {
				textbar.setText(updateValeIssuesStatusBar(plugin));
			}),
		);
	}
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
		plugin.app.workspace.on("active-leaf-change", () => {
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

export function updateValeIssuesStatusBar(
	plugin: ValePlugin,
	filePath?: string,
): string {
	const currentFile = filePath || plugin.app.workspace.getActiveFile()?.path;
	if (!currentFile) {
		return "No file";
	}
	const issues = plugin.issueManager.getIssuesGroupedBySeverity(currentFile);
	const errorCount = issues.errors.length;
	const warningCount = issues.warnings.length;
	const suggestionCount = issues.suggestions.length;

	return `${errorCount} error${errorCount !== 1 ? "s" : ""}, ${warningCount} warning${warningCount !== 1 ? "s" : ""}, ${suggestionCount} suggestion${suggestionCount !== 1 ? "s" : ""}`;
}
