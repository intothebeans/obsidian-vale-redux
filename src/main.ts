import { ValePluginSettings, ValeConfig } from "types";
import { debounce, MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { DEFAULT_VALE_CONFIG, ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";
import { IssueManager } from "core/issue-manager";
import { getExistingConfigOptions } from "core/vale-config";
import { ISSUES_PANEL_VIEW_TYPE } from "utils/constants";
import { ValeIssuesView } from "ui/issues-panel";
import { buildValeEditorExtension } from "core/editor";
import { testValeConnection } from "utils/vale-utils";
import { registerCommands } from "commands/register-commands";

export const DEFAULT_SETTINGS: ValePluginSettings = {
	valeBinaryPath: "vale",
	valeConfigPath: ".vale.ini",
	valeConfigPathAbsolute: "",
	excludedFiles: [],
	showInlineAlerts: true,
	showInlineHighlights: true,
	debounceMs: 500,
	disabledFiles: [],
	automaticChecking: true,
	valeProcessTimeoutMs: 10000,
	valeConfigBackupsToKeep: 2,
	valeConfigBackupDir: "",
	backupPaths: [],
};
// TODO: add sidebar and status bar function
export default class ValePlugin extends Plugin {
	public issueManager: IssueManager;
	public valeAvailable: boolean = false;
	public settings: ValePluginSettings;
	public valeRunner: ValeRunner;
	public valeConfig: ValeConfig;
	public debounceSettingsSave = debounce(() => this.saveSettings(), 500);

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
		this.addSettingTab(new ValePluginSettingTab(this.app, this));
		if (this.settings.automaticChecking) {
			this.registerEventListeners();
		}
		this.registerEditorExtension(
			buildValeEditorExtension(
				this.app,
				this.issueManager,
				this.settings,
			),
		);
		registerCommands(this);

		// Defer processes after load.
		this.app.workspace.onLayoutReady(async () => {
			this.valeAvailable = await testValeConnection(this.settings);
			if (this.valeAvailable) {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					await this.issueManager.refreshFile(activeFile.path);
				}
			}
			this.valeConfig =
				(await getExistingConfigOptions(
					this.settings.valeConfigPathAbsolute,
				)) || DEFAULT_VALE_CONFIG;
		});
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
