import ValePlugin from "main";
import { openIssuesPanel } from "ui/issues-panel";

export function registerCommands(plugin: ValePlugin): void {
	// Lint file command
	plugin.addCommand({
		id: "vale-lint-file",
		name: "Lint current file",
		callback: async () => {
			await plugin.issueManager.refreshFile(
				plugin.app.workspace.getActiveFile()?.path || "",
			);
		},
	});

	// Open issues panel command
	plugin.addCommand({
		id: "vale-open-issues-panel",
		name: "Open issues panel",
		callback: () => openIssuesPanel(plugin),
	});
}
