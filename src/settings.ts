/* eslint-disable obsidianmd/ui/sentence-case */
import {
	App,
	debounce,
	PluginSettingTab,
	Setting,
	SettingGroup,
} from "obsidian";
import { ValeConfig } from "types";
import ValePlugin from "main";
import {
	ensureAbsolutePath,
	openExternalFilesystemObject,
} from "utils/file-utils";
import { getValeStylesPath, testValeConnection } from "utils/vale-utils";
import { notifyError } from "utils/utils";

// FIX - Single regex being broken up during parsing
export const DEFAULT_VALE_CONFIG: ValeConfig = {
	BlockIgnores: {
		"*.{md,mdx}": [/ *(`{3,}|~{3,})\S*?[\s\S]*?(`{3,}|~{3,})/.source],
	},
	MinAlertLevel: 0,
	Vocab: ["Base"],
	Formats: {
		mdx: "md",
	},
	SBaseStyles: {
		"*.{md,mdx}": ["write-good", "Vale"],
	},
	GBaseStyles: ["Vale"],
	TokenIgnores: {
		"*.{md,mdx}": [
			/(\$+[^\n$]+\$+)/.source,
			/(\[\[.*?\]\])/.source,
			/(#[^\s]+)/.source,
		],
	},
};

export class ValePluginSettingTab extends PluginSettingTab {
	plugin: ValePlugin;
	icon = "spell-check-2";
	// NOTE: Use to prevent saving overhead on text input fields
	debouncedSave = debounce(() => this.plugin.saveSettings(), 500);

	constructor(app: App, plugin: ValePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let settings = this.plugin.settings;
		const vault = this.app.vault;
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName("Enable inline alerts")
			.setDesc("Show Vale issues directly in the editor.")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.showInlineAlerts)
					.onChange(async (value) => {
						settings.showInlineAlerts = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Automatic checking")
			.setDesc("Automatically check files. Disable for manual control.")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.automaticChecking)
					.onChange(async (value) => {
						settings.automaticChecking = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Vale binary path")
			.setDesc(
				"Absolute path to the Vale binary (e.g., /usr/local/bin/vale). Leave empty to use 'vale' from system PATH.",
			)
			.addText((text) => {
				text.setPlaceholder("vale")
					.setValue(settings.valeBinaryPath)
					.onChange(async (value) => {
						// If empty, use default "vale" command from PATH
						// Otherwise, assume the input is absolute
						settings.valeBinaryPath = value.trim() || "vale";
						this.debouncedSave();
					});
			})
			.addButton((button) => {
				button
					.setButtonText("Test Connection")
					.setTooltip(
						"Check if the Vale binary is accessible and working.",
					)
					.onClick(async () => {
						this.plugin.workingValeBinary =
							await testValeConnection(settings.valeBinaryPath);
					});
			});
		new Setting(containerEl)
			.setName("Vale config path")
			.setDesc(
				"Path to Vale config file. Use relative path (from vault root) or absolute path.",
			)
			.addText((text) => {
				text.setPlaceholder(".vale.ini")
					.setValue(settings.valeConfigPath)
					.onChange(async (value) => {
						settings.valeConfigPath = value.trim();
						this.debouncedSave();
					});
			})
			.addButton((button) => {
				button.setButtonText("Generate Config");
			});
		new Setting(containerEl)
			.setName("Quick Access")
			.addButton((button) => {
				button.setButtonText("Open Styles Folder").onClick(async () => {
					try {
						const stylesPath = await getValeStylesPath(
							settings.valeBinaryPath,
							settings.valeConfigPath,
						);
						console.debug("Opening styles path:", stylesPath);
						await openExternalFilesystemObject(stylesPath, vault);
					} catch (error) {
						notifyError(
							"Failed to open styles folder.",
							8000,
							`${error instanceof Error ? error.message : String(error)}`,
						);
					}
				});
			})
			.addButton((button) => {
				button.setButtonText("Open Config File").onClick(async () => {
					const absolutePath = ensureAbsolutePath(
						settings.valeConfigPath,
						vault,
					);
					await openExternalFilesystemObject(absolutePath, vault);
				});
			});

		new SettingGroup(containerEl)
			.setHeading("Advanced")
			.addSetting((setting) => {
				setting
					.setName("Exclude files")
					.setDesc(
						"Glob patterns for files to exclude from linting (one per line).",
					)
					.addTextArea((text) => {
						text.setPlaceholder(
							"*.excalidraw.md\n**/_templates/**\n**/daily-notes/**",
						)
							.setValue(settings.excludedFiles.join("\n"))
							.onChange(async (value) => {
								settings.excludedFiles = value
									.split("\n")
									.map((line) => line.trim())
									.filter((line) => line.length > 0);
								this.debouncedSave();
							});
					});
			})
			.addSetting((setting) => {
				setting
					.setName("Debounce Time")
					.setDesc(
						"Delay in milliseconds before saving settings after changes.",
					)
					.addText((text) => {
						text.setPlaceholder("500")
							.setValue(settings.debounceMs.toString())
							.onChange(async (value) => {
								const num = parseInt(value, 10);
								if (!isNaN(num) && num >= 0) {
									settings.debounceMs = num;
									this.debouncedSave();
								}
							});
					});
			});
	}

	hide(): void {
		// Cancel any pending save operations when the settings tab is closed
		this.debouncedSave.cancel();
		super.hide();
	}
}
