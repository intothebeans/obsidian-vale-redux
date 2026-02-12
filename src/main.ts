import { ValePluginSettings, ValeRuntimeConfig } from "types";
import { Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, ValePluginSettingTab } from "settings";
import { ValeRunner } from "core/vale-runner";
import { ensureAbsolutePath } from "utils/file-utils";

export default class ValePlugin extends Plugin {
	public settings: ValePluginSettings;
	private valeRunner: ValeRunner;

	// onload runs when plugin becomes enabled.
	async onload(): Promise<void> {
		await this.loadSettings();
		const runtimeConfig: ValeRuntimeConfig = {
			valeBinary: this.settings.valeBinaryPath,
			valeConfig: ensureAbsolutePath(
				this.settings.valeConfigPath,
				this.app.vault,
			),
			workingDir: this.app.vault.getRoot().path,
		};
		this.valeRunner = new ValeRunner(runtimeConfig);

		this.addSettingTab(new ValePluginSettingTab(this.app, this));
		this.addCommand({
			id: "vale-lint-current-file",
			name: "Lint current file with vale.",
			callback: async () => {
				const filePath = ensureAbsolutePath(
					this.app.workspace.getActiveFile()?.path || "",
					this.app.vault,
				);
				if (!filePath) {
					new Error("No active file to lint.");
					return;
				}
				await this.valeRunner.lintFile(filePath).then((result) => {
					console.debug(result);
				});
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
