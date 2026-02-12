import { ValePluginSettings, ValeRuntimeConfig, ValeConfig } from "types";
import { Plugin } from "obsidian";
import { ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";
import { IssueManager } from "core/issue-manager";
import { getExistingConfigOptions, testValeConnection } from "utils/vale-utils";
import { existsSync } from "fs";

export const DEFAULT_SETTINGS: ValePluginSettings = {
	valeBinaryPath: "vale",
	valeConfigPath: ".vale.ini",
	excludedFiles: [],
	showInlineAlerts: true,
	debounceMs: 500,
	disabledFiles: [],
	automaticChecking: true,
};
export default class ValePlugin extends Plugin {
	public settings: ValePluginSettings;
	public valeRunner: ValeRunner;
	issueManager: IssueManager;
	public workingValeBinary: boolean;
	public valeConfig: ValeConfig;

	async onload(): Promise<void> {
		console.debug("Loading Vale Plugin...");
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

		if (!this.settings.valeBinaryPath) {
			this.settings.valeBinaryPath = "vale";
		}
		this.workingValeBinary = await testValeConnection(
			this.settings.valeBinaryPath,
		);
		if (
			this.workingValeBinary &&
			existsSync(this.settings.valeConfigPath)
		) {
			const options = await getExistingConfigOptions(
				this.settings.valeBinaryPath,
				this.settings.valeConfigPath,
			);
			if (options) {
				this.valeConfig = options;
			}
		}
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
		const loadedData =
			(await this.loadData()) as Partial<ValePluginSettings>;
		const defaultsCopy = structuredClone(DEFAULT_SETTINGS);
		this.settings = { ...defaultsCopy, ...loadedData };
	}
}
