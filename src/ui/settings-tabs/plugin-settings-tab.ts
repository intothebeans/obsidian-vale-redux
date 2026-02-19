/* eslint-disable obsidianmd/ui/sentence-case */
import ValePlugin from "main";
import { SettingsTab } from "./settings-tab";
import { Notice, Setting, SettingGroup, TFolder } from "obsidian";
import { testValeConnection } from "utils/vale-utils";
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
		this.addBasicSettings();
		this.addValeBinaryPathSetting();
		this.addValeConfigPathSetting();
		this.addAdvancedSettings();
	}
	private addBasicSettings(): void {
		this.addToggleSettingRequiringReload(
			this.contentEl,
			"Inline alerts",
			"Show Vale issues directly in the editor. Requires plugin reload to take effect.",
			"showInlineAlerts",
		);

		this.addToggleSettingRequiringReload(
			this.contentEl,
			"Automatic checking",
			"Automatically check files on changes. Requires plugin reload to take effect.",
			"automaticChecking",
		);

		this.addToggleSettingRequiringReload(
			this.contentEl,
			"Inline highlights",
			"Show highlights when using the issues panel to navigate to issues. Requires plugin reload to take effect.",
			"showInlineHighlights",
		);
		new SettingGroup(this.contentEl)
			.setHeading("Backup settings")
			.addSetting((setting) => {
				setting
					.setName("Number of backups to keep")
					.setDesc(
						"Number of backup files to keep in the vault. Older backups will be deleted automatically.",
					)
					.addText((text) => {
						text.setPlaceholder("5")
							.setValue(
								this.settings.valeConfigBackupsToKeep.toString(),
							)
							.onChange(async (value) => {
								const trimmed = value.trim();
								// Allow empty input while typing without showing an error or changing the setting
								if (trimmed === "") {
									return;
								}
								const num = parseInt(trimmed, 10);
								if (!isNaN(num) && num >= 0) {
									this.settings.valeConfigBackupsToKeep = num;
									this.debouncedSave();
								} else {
									new Notice(
										"Number of backups must be a non-negative whole number.",
									);
								}
							});
					});
			})
			.addSetting((setting) => {
				setting
					.setName("Backup directory")
					.setDesc(
						"Directory to store backup files inside the vault. Defaults to attachments folder.",
					)
					.addText((text) => {
						text.setPlaceholder("some/directory")
							.setValue(this.settings.valeConfigBackupDir)
							.onChange(async (value) => {
								const path = value.trim();
								if (path === "") {
									this.settings.valeConfigBackupDir = "";
									this.debouncedSave();
									return;
								}
								const folder =
									this.plugin.app.vault.getAbstractFileByPath(
										value.trim(),
									);
								if (!folder || !(folder instanceof TFolder)) {
									notifyError(
										"Invalid backup directory. Please enter an existing, accessible path.",
									);
									return;
								}
								this.settings.valeConfigBackupDir = path;
								this.debouncedSave();
							});
					});
			});
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

	private addValeBinaryPathSetting(): void {
		new Setting(this.contentEl)
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

	private addValeConfigPathSetting(): void {
		new Setting(this.contentEl)
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

	private addAdvancedSettings(): void {
		new SettingGroup(this.contentEl)
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
