/* eslint-disable obsidianmd/ui/sentence-case */
import {
	App,
	debounce,
	Notice,
	PluginSettingTab,
	Setting,
	SettingGroup,
} from "obsidian";
import { ValeConfig } from "types";
import ValePlugin from "main";

import { getValeStylesPath, testValeConnection } from "utils/vale-utils";
import { notifyError } from "utils/error-utils";
import { shell } from "electron";
import { createConfigUI } from "core/config/settings-ui";
// FIX: Single regex being broken up during parsing
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
	debouncedSave = debounce(() => this.plugin.saveSettings(), 500);

	constructor(app: App, plugin: ValePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.addBasicSettings(containerEl);
		this.addValeBinaryPathSetting(containerEl);
		this.addValeConfigPathSetting(containerEl);
		this.addQuickAccessButtons(containerEl);
		this.addAdvancedSettings(containerEl);
	}

	private addBasicSettings(containerEl: HTMLElement): void {
		this.addToggleSetting(
			containerEl,
			"Inline alerts",
			"Show Vale issues directly in the editor. Requires plugin reload to take effect.",
			"showInlineAlerts",
		);

		this.addToggleSetting(
			containerEl,
			"Automatic checking",
			"Automatically check files on changes. Requires plugin reload to take effect.",
			"automaticChecking",
		);

		this.addToggleSetting(
			containerEl,
			"Inline highlights",
			"Show highlights when using the issues panel to navigate to issues. Requires plugin reload to take effect.",
			"showInlineHighlights",
		);
	}

	private addToggleSetting(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		settingKey: keyof ValePlugin["settings"],
	): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle((toggle) => {
				toggle
					.setValue(settings[settingKey] as boolean)
					.onChange(async (value) => {
						(settings[settingKey] as boolean) = value;
						await this.plugin.saveSettings();
						new Notice(
							`${name} setting ${value ? "enabled" : "disabled"}. Please reload the plugin for this to take effect.`,
						);
					});
			});
	}

	private addValeBinaryPathSetting(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Vale binary path")
			.setDesc(
				"Absolute path to the Vale binary (e.g., /usr/local/bin/vale). Leave empty to use 'vale' from system PATH.",
			)
			.addText((text) => {
				text.setPlaceholder("vale")
					.setValue(settings.valeBinaryPath)
					.onChange(async (value) => {
						settings.valeBinaryPath =
							value.trim() === "" ? "vale" : value.trim();
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
						const success = await testValeConnection(settings);
						if (success) {
							this.plugin.valeAvailable = true;
						}
					});
			});
	}

	private addValeConfigPathSetting(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Vale config path")
			.setDesc(
				"Path to Vale config file. Use relative path (from vault root) or absolute path.",
			)
			.addText((text) => {
				text.setPlaceholder(".vale.ini")
					.setValue(settings.valeConfigPath)
					.onChange(async (value) => {
						settings.valeConfigPath =
							value.trim() === "" ? ".vale.ini" : value.trim();
						this.debouncedSave();
					});
			});
	}

	private addQuickAccessButtons(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Quick Access")
			.addButton((button) => {
				button.setButtonText("Open Styles Folder").onClick(async () => {
					try {
						const stylesPath = await getValeStylesPath(this.plugin);
						await shell.openPath(stylesPath);
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
					await shell.openPath(settings.valeConfigPathAbsolute);
				});
			});
	}

	private addAdvancedSettings(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

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
					})
					.setDisabled(true);
			})
			.addSetting((setting) => {
				setting
					.setName("Debounce Time")
					.setDesc(
						"Delay in milliseconds before re-linting after edits.",
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
			})
			.addSetting((setting) => {
				setting
					.setName("Process timeout")
					.setDesc(
						"How long should Vale run before it times out. If Vale is failing on large files, try increasing this value.",
					)
					.addText((text) => {
						text.setPlaceholder("5000")
							.setValue(settings.valeProcessTimeoutMs.toString())
							.onChange(async (value) => {
								const num = parseInt(value, 10);
								if (!isNaN(num) && num >= 0) {
									settings.valeProcessTimeoutMs = num;
									this.debouncedSave();
								}
							});
					});
			});

		createConfigUI(containerEl, this.plugin);
	}

	hide(): void {
		// Cancel any pending save operations when the settings tab is closed
		this.debouncedSave.cancel();
		super.hide();
	}
}
