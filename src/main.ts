import { ValePluginSettings, ValeRuntimeConfig } from "types";
import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";
import { IssueManager } from "core/issue-manager";

export default class ValePlugin extends Plugin {
	public settings: ValePluginSettings;
	public valeRunner: ValeRunner;
	issueManager: IssueManager;

	// onload runs when plugin becomes enabled.
	async onload(): Promise<void> {
		await this.loadSettings();

		// Set default config path if not specified (stored as relative)
		if (!this.settings.valeConfigPath) {
			this.settings.valeConfigPath = ".vale.ini";
			await this.saveSettings();
		}

		const runtimeConfig: ValeRuntimeConfig = {
			valeBinary: this.settings.valeBinaryPath || "vale",
			// Convert config path to absolute for Vale runner
			valeConfig: ensureAbsolutePath(
				this.settings.valeConfigPath,
				this.app.vault,
			),
			workingDir: this.app.vault.getRoot().path,
		};
		this.valeRunner = new ValeRunner(runtimeConfig);
		this.issueManager = new IssueManager(this);

		this.addSettingTab(new ValePluginSettingTab(this.app, this));
		this.addCommand({
			id: "vale-refresh-current-file",
			name: "Refresh file",
			callback: async () => {
				const filePath = ensureAbsolutePath(
					this.app.workspace.getActiveFile()?.path || "",
					this.app.vault,
				);
				if (!filePath) {
					new Error("No active file to lint.");
					return;
				}
				await this.issueManager.refreshFile(filePath);
			},
		});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ValePluginSettings>,
		);
	}
}
