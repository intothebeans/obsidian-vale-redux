import { ValePluginSettings, ValeRuntimeConfig, ValeConfig } from "types";
import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";
import { IssueManager } from "core/issue-manager";
import { getExistingConfigOptions } from "utils/vale-utils";
import { ISSUES_PANEL_VIEW_TYPE } from "utils/constants";
import { ValeIssuesView } from "ui/issues-panel";

export const DEFAULT_SETTINGS: ValePluginSettings = {
	valeBinaryPath: "vale",
	valeConfigPath: ".vale.ini",
	excludedFiles: [],
	showInlineAlerts: true,
	debounceMs: 500,
	disabledFiles: [],
	automaticChecking: true,
	valeProcessTimeoutMs: 10000,
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
			timeoutMs: this.settings.valeProcessTimeoutMs || 5000,
		};
		this.valeRunner = new ValeRunner(runtimeConfig);
		this.issueManager = new IssueManager(this);
		this.registerView(
			ISSUES_PANEL_VIEW_TYPE,
			(leaf: WorkspaceLeaf) =>
				new ValeIssuesView(leaf, this.issueManager),
		);
		const options = await getExistingConfigOptions(
			this.settings.valeBinaryPath,
			this.configFullPath,
		);
		if (options) {
			this.valeConfig = options;
		}

		this.addSettingTab(new ValePluginSettingTab(this.app, this));
		this.registerEventListeners();
		this.addCommand({
			id: "vale-lint-file",
			name: "Lint current file",
			callback: async () => {
				await this.issueManager.refreshFile(
					this.app.workspace.getActiveFile()?.path || "",
				);
			},
		});
		this.addCommand({
			id: "vale-open-issues-panel",
			name: "Open issues panel",
			callback: async () => {
				await this.app.workspace.getRightLeaf(false)?.setViewState({
					type: ISSUES_PANEL_VIEW_TYPE,
					active: true,
				});
				const leaf = this.app.workspace.getLeavesOfType(
					ISSUES_PANEL_VIEW_TYPE,
				)[0];
				if (leaf) {
					await this.app.workspace.revealLeaf(leaf);
				}
			},
		});
		if (this.app.workspace.getActiveFile()) {
			await this.issueManager.refreshFile(
				this.app.workspace.getActiveFile()!.path,
			);
		}
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

	private registerEventListeners(): void {
		this.registerEvent(
			this.app.workspace.on("file-open", (file: TFile | null) => {
				if (file) {
					this.issueManager.refreshFileDebounced(file.path);
				}
			}),
		);

		if (this.settings.automaticChecking) {
			this.registerEvent(
				this.app.workspace.on("editor-change", (_editor, info) => {
					const file = info.file;
					if (file) {
						this.issueManager.refreshFileDebounced(file.path);
					}
				}),
			);

			this.registerEvent(
				this.app.workspace.on("active-leaf-change", (leaf) => {
					if (
						leaf &&
						leaf.view instanceof MarkdownView &&
						leaf.view.file
					) {
						this.issueManager.refreshFileDebounced(
							leaf.view.file.path,
						);
					}
				}),
			);
		}
	}
}
