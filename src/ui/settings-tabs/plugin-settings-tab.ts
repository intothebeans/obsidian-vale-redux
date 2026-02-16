/* eslint-disable obsidianmd/ui/sentence-case */
import ValePlugin from "main";
import { SettingsTab } from "./settings-tab";
import { Notice, Setting, SettingGroup } from "obsidian";
import { getValeStylesPath, testValeConnection } from "utils/vale-utils";
import { shell } from "electron";
import { notifyError } from "utils/error-utils";

export class ValePluginSettingsTab extends SettingsTab {
	debouncedSave = this.plugin.debounceSettingsSave;
	private settings = this.plugin.settings;
	constructor(
		navEl: HTMLElement,
		settingsEl: HTMLElement,
		plugin: ValePlugin,
	) {
		super(navEl, settingsEl, "Plugin Settings", plugin, "settings");
		this.display();
	}

	display(): void {
		this.addBasicSettings(this.contentEl);
		this.addValeBinaryPathSetting(this.contentEl);
		this.addValeConfigPathSetting(this.contentEl);
		this.addQuickAccessButtons(this.contentEl);
		this.addAdvancedSettings(this.contentEl);
	}
	private addBasicSettings(containerEl: HTMLElement): void {
		this.addToggleSettingRequiringReload(
			containerEl,
			"Inline alerts",
			"Show Vale issues directly in the editor. Requires plugin reload to take effect.",
			"showInlineAlerts",
		);

		this.addToggleSettingRequiringReload(
			containerEl,
			"Automatic checking",
			"Automatically check files on changes. Requires plugin reload to take effect.",
			"automaticChecking",
		);

		this.addToggleSettingRequiringReload(
			containerEl,
			"Inline highlights",
			"Show highlights when using the issues panel to navigate to issues. Requires plugin reload to take effect.",
			"showInlineHighlights",
		);
	}

	private addToggleSettingRequiringReload(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		settingKey: keyof ValePlugin["settings"],
	): void {
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.settings[settingKey] as boolean)
					.onChange(async (value) => {
						(this.settings[settingKey] as boolean) = value;
						await this.plugin.saveSettings();
						new Notice(
							`${name} setting ${value ? "enabled" : "disabled"}. Please reload the plugin for this to take effect.`,
						);
					});
			});
	}

	private addValeBinaryPathSetting(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Vale binary path")
			.setDesc(
				"Absolute path to the Vale binary (e.g., /usr/local/bin/vale). Leave empty to use 'vale' from system PATH.",
			)
			.addText((text) => {
				text.setPlaceholder("vale")
					.setValue(this.settings.valeBinaryPath)
					.onChange(async (value) => {
						this.settings.valeBinaryPath =
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
						const success = await testValeConnection(this.settings);
						if (success) {
							this.plugin.valeAvailable = true;
						}
					});
			});
	}

	private addValeConfigPathSetting(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Vale config path")
			.setDesc(
				"Path to Vale config file. Use relative path (from vault root) or absolute path.",
			)
			.addText((text) => {
				text.setPlaceholder(".vale.ini")
					.setValue(this.settings.valeConfigPath)
					.onChange(async (value) => {
						this.settings.valeConfigPath =
							value.trim() === "" ? ".vale.ini" : value.trim();
						this.debouncedSave();
					});
			});
	}

	private addQuickAccessButtons(containerEl: HTMLElement): void {
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
					await shell.openPath(this.settings.valeConfigPathAbsolute);
				});
			});
	}

	private addAdvancedSettings(containerEl: HTMLElement): void {
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
							.setValue(this.settings.excludedFiles.join("\n"))
							.onChange(async (value) => {
								this.settings.excludedFiles = value
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
							.setValue(this.settings.debounceMs.toString())
							.onChange(async (value) => {
								const num = parseInt(value, 10);
								if (!isNaN(num) && num >= 0) {
									this.settings.debounceMs = num;
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
							.setValue(
								this.settings.valeProcessTimeoutMs.toString(),
							)
							.onChange(async (value) => {
								const num = parseInt(value, 10);
								if (!isNaN(num) && num >= 0) {
									this.settings.valeProcessTimeoutMs = num;
									this.debouncedSave();
								}
							});
					});
			});
	}
}
