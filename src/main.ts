import { ValePluginSettings, ValeConfig } from "types";
import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";
import { IssueManager } from "core/issue-manager";
import { getExistingConfigOptions } from "core/vale-config";
import { ISSUES_PANEL_VIEW_TYPE } from "utils/constants";
import { ValeIssuesView } from "ui/issues-panel";
import { createValeDecorationExtension } from "core/vale-decorations";
import { testValeConnection } from "utils/vale-utils";

export const DEFAULT_SETTINGS: ValePluginSettings = {
	valeBinaryPath: "vale",
	valeConfigPath: ".vale.ini",
	valeConfigPathAbsolute: "",
	excludedFiles: [],
	showInlineAlerts: true,
	debounceMs: 500,
	disabledFiles: [],
	automaticChecking: true,
	valeProcessTimeoutMs: 10000,
};
// TODO: add sidebar and status bar function
export default class ValePlugin extends Plugin {
	public issueManager: IssueManager;
	public valeAvailable: boolean = false;
	public settings: ValePluginSettings;
	public valeRunner: ValeRunner;
	public valeConfig: ValeConfig;

	async onload(): Promise<void> {
		await this.loadSettings();
		// Uses the existing path if already absolute, otherwise resolves it relative to the vault
		this.settings.valeConfigPathAbsolute = ensureAbsolutePath(
			this.settings.valeConfigPath,
			this.app.vault,
		);

		// Register and initialize things
		this.valeRunner = new ValeRunner(this);
		this.issueManager = new IssueManager(this);
		this.registerView(
			ISSUES_PANEL_VIEW_TYPE,
			(leaf: WorkspaceLeaf) =>
				new ValeIssuesView(leaf, this.issueManager),
		);
		if (this.settings.showInlineAlerts) {
			this.registerEditorExtension(
				createValeDecorationExtension(this.app, this.issueManager),
			);
		}
		// Run things
		this.valeAvailable = await testValeConnection(this.settings);
		if (this.valeAvailable) {
		const options = await getExistingConfigOptions(
			this.settings.valeBinaryPath,
			this.settings.valeConfigPathAbsolute,
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
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async loadSettings(): Promise<void> {
		const loadedData =
			(await this.loadData()) as Partial<ValePluginSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...loadedData,
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
