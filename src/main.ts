import { ValePluginSettings, ValeRuntimeConfig, ValeConfig } from "types";
import { Plugin } from "obsidian";
import { ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";
import { IssueManager } from "core/issue-manager";
import { getExistingConfigOptions } from "utils/vale-utils";

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
	issueManager: IssueManager;
	public settings: ValePluginSettings;
	public valeRunner: ValeRunner;
	public valeConfig: ValeConfig;
	private configFullPath: string;

	async onload(): Promise<void> {
		console.debug("Loading Vale Plugin...");
		await this.loadSettings();
		this.configFullPath = ensureAbsolutePath(
			this.settings.valeConfigPath,
			this.app.vault,
		);

		const runtimeConfig: ValeRuntimeConfig = {
			valeBinary: this.settings.valeBinaryPath || "vale",
			valeConfig: this.configFullPath,
			workingDir: this.app.vault.getRoot().path,
		};
		this.valeRunner = new ValeRunner(runtimeConfig);
		this.issueManager = new IssueManager(this);
		const options = await getExistingConfigOptions(
			this.settings.valeBinaryPath,
			this.configFullPath,
		);
		if (options) {
			this.valeConfig = options;
		}

		this.addSettingTab(new ValePluginSettingTab(this.app, this));
		this.addCommand({
			id: "vale-test-linting",
			name: "Test Vale Linting",
			callback: async () => {
				await this.issueManager.refreshFile(
					this.app.workspace.getActiveFile()?.path || "",
				);
			},
		});
		console.debug("Vale Plugin loaded.");
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async loadSettings(): Promise<void> {
		const loadedData =
			(await this.loadData()) as Partial<ValePluginSettings>;
		const defaultsCopy = structuredClone(DEFAULT_SETTINGS);
		this.settings = {
			...defaultsCopy,
			...loadedData,
			valeBinaryPath:
				loadedData.valeBinaryPath || DEFAULT_SETTINGS.valeBinaryPath,
			valeConfigPath:
				loadedData.valeConfigPath || DEFAULT_SETTINGS.valeConfigPath,
		};
	}
}
