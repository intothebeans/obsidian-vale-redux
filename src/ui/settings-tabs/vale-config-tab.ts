import ValePlugin from "main";
import { SettingsTab } from "./settings-tab";
import { Setting, SettingGroup, Notice } from "obsidian";
import { ValeConfig, ValeGlobalSection, ValeProcess } from "types";
import { getValeStylesPath, returnCodeFail } from "utils/vale-utils";
import { ALERT_LEVEL_TO_STRING, AlertLevelString } from "utils/constants";
import { shell } from "electron";
import {
	backupAndWriteConfig,
	getExistingConfigOptions,
} from "core/vale-config";
import { spawnProcessWithOutput } from "utils/process-utils";
import { notifyError } from "utils/error-utils";

export class ValeConfigTab extends SettingsTab {
	private valeConfig: ValeConfig;
	constructor(
		navEl: HTMLElement,
		settingsEl: HTMLElement,
		plugin: ValePlugin,
	) {
		super(navEl, settingsEl, "Vale Config", plugin, "file-sliders");
		this.valeConfig = plugin.valeConfig || null;
		this.display();
	}

	display(): void {
		if (this.valeConfig) {
			this.createValeActions();
			this.createCoreSettings();
			this.createGlobalSettings();
			this.createSyntaxSettings();
		}
	}

	private createValeActions(): void {
		new SettingGroup(this.contentEl)
			.setHeading("File management")
			.addSetting((setting) => {
				setting
					.setName("Configuration")
					.setDesc("Saving also creates a backup.")
					.addButton((btn) => {
						btn.setButtonText("Save to file")
							.setTooltip(
								"Save the current configuration to the vale config file. Also creates a backup.",
							)
							.onClick(async () => {
								await backupAndWriteConfig(
									this.plugin,
									this.valeConfig,
								);
							});
					})
					.addButton((btn) => {
						btn.setButtonText("Load from file")
							.setTooltip(
								"Load the current configuration from the vale config file.",
							)
							.onClick(async () => {
								const notice = new Notice(
									"Loading config...",
									0,
								);
								const loadedConfig =
									await getExistingConfigOptions(
										this.plugin.settings
											.valeConfigPathAbsolute,
									);
								if (loadedConfig) {
									notice.hide();
									new Notice(
										"Config loaded successfully!",
										3000,
									);
									this.valeConfig = loadedConfig;
									this.contentEl.empty();
									this.display();
								}
								notice.hide();
							});
					})
					.addButton((btn) => {
						btn.setButtonText("Open config file")
							.setTooltip(
								"Open the vale config file in the default editor.",
							)
							.onClick(async () => {
								await shell.openPath(
									this.plugin.settings.valeConfigPathAbsolute,
								);
							});
					});
			})
			.addSetting((setting) => {
				setting
					.setName("Styles")
					.addButton((btn) => {
						btn.setButtonText("Open styles folder")
							.setTooltip(
								"Open the folder containing vale styles.",
							)
							.onClick(async () => {
								const stylesPath = await getValeStylesPath(
									this.plugin,
								);
								if (stylesPath) {
									await shell.openPath(stylesPath);
								}
							});
					})
					.addButton((btn) => {
						btn.setButtonText("Sync styles")
							.setTooltip("Run vale sync")
							.onClick(async () => {
								const settings = this.plugin.settings;
								const process: ValeProcess = {
									command: settings.valeBinaryPath,
									args: [
										"sync",
										"--config",
										settings.valeConfigPathAbsolute,
									],
									timeoutMs: 60000,
									onClose: returnCodeFail,
								};
								try {
									await spawnProcessWithOutput(process);
									new Notice(
										"Styles synced successfully!",
										3000,
									);
								} catch (err) {
									notifyError(
										"Failed to sync styles.",
										5000,
										err instanceof Error
											? err.message
											: String(err),
									);
								}
							});
					});
			});
	}

	private createCoreSettings(): SettingGroup {
		return new SettingGroup(this.contentEl)
			.setHeading("Core Settings")
			.addClass("vale-config-core-settings")
			.addSearch((search) => {
				search.setPlaceholder("Search settings...");
			})
			.addSetting((setting) => {
				setting
					.setName("Styles path")
					.setDesc("Path to all vale-related resources.")
					.addText(async (text) => {
						const stylesPath =
							(await getValeStylesPath(this.plugin)) || "";
						text.setValue(stylesPath).setPlaceholder(
							"Path to vale styles",
						);
					});
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					this.valeConfig.Vocab,
					"Vocab",
					"List of vocabularies to load.",
				);
			})
			.addSetting((setting) => {
				setting
					.setName("Minimum alert level")
					.setDisabled(true)
					.setDesc(
						"Minimum alert level to display. (e.g., suggestion, warning, error)",
					)
					.addText((text) => {
						text.setValue(
							ALERT_LEVEL_TO_STRING[
								this.valeConfig
									.MinAlertLevel as AlertLevelString
							] ?? "",
						).setPlaceholder("Minimum alert level");
					});
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					this.valeConfig.Packages,
					"Packages",
					"Packages to install with vale sync",
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					this.valeConfig.IgnoredScopes,
					"Ignored scopes",
					"List of inline-level HTML tags to ignore.",
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					this.valeConfig.SkippedScopes,
					"Skipped scopes",
					"List of block-level HTML tags to ignore",
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					this.valeConfig.IgnoredClasses,
					"Ignored classes",
					"Classes to ignore for both inline and block-level tags.",
				);
			});
	}

	private createGlobalSettings(): SettingGroup | void {
		const globalConfig = this.valeConfig["*"] || null;
		if (globalConfig) {
			return new SettingGroup(this.contentEl)
				.setHeading("Global Settings")
				.addClass("vale-config-global-settings")
				.addSetting((setting) => {
					this.stringArraySetting(
						setting,
						globalConfig?.BasedOnStyles,
						"Based on styles",
						"List of styles to apply globally.",
					);
				})
				.addSetting((setting) => {
					this.stringArraySetting(
						setting,
						globalConfig?.BlockIgnores,
						"Block ignores",
						"List of block-level HTML tags to ignore globally.",
					);
				})
				.addSetting((setting) => {
					this.stringArraySetting(
						setting,
						globalConfig?.TokenIgnores,
						"Token ignores",
						"List of inline-level HTML tags to ignore globally.",
					);
				})
				.addSetting((setting) => {
					setting
						.setName("Language")
						.setDesc("Language to use for global checks.")
						.addText((text) => {
							text.setValue(
								globalConfig?.Lang || "",
							).setPlaceholder(
								"Language code (e.g., en, fr, etc.)",
							);
						});
				})
				.addSetting((setting) => {
					setting
						.setName("Check overrides")
						.setDesc(
							"Override specific checks globally. Specify the check name, and optionally set a new alert level or disable it.",
						)
						.addTextArea((text) => {
							const overrideLines =
								this.extractCheckOverrides(globalConfig);
							text.setValue(
								overrideLines.join("\n"),
							).setPlaceholder(
								// eslint-disable-next-line obsidianmd/ui/sentence-case
								"One override per line, format: CheckName = Level or NO (to disable)",
							);
						});
				});
		}
		return;
	}

	private createSyntaxSettings(): SettingGroup | void {
		const sections = this.valeConfig.syntaxSections || null;
		if (sections) {
			for (const [syntax, config] of Object.entries(sections)) {
				new SettingGroup(this.contentEl)
					.setHeading(`Settings for: ${syntax}`)
					.addClass("vale-config-syntax-settings")
					.addSetting((setting) => {
						this.stringArraySetting(
							setting,
							config.BasedOnStyles,
							"Based on styles",
							"List of styles to apply for this syntax.",
						);
					})
					.addSetting((setting) => {
						this.stringArraySetting(
							setting,
							config.BlockIgnores,
							"Block ignores",
							"List of block-level HTML tags to ignore for this syntax.",
						);
					})
					.addSetting((setting) => {
						this.stringArraySetting(
							setting,
							config.TokenIgnores,
							"Token ignores",
							"List of inline-level HTML tags to ignore for this syntax.",
						);
					})
					.addSetting((setting) => {
						setting
							.setName("Comment delimiters")
							.setDesc(
								"Delimiters used to identify comments for this syntax.",
							)
							.addText((text) => {
								text.setPlaceholder(
									"Opening delimiter",
								).setValue(
									config?.CommentDelimiters
										? config.CommentDelimiters[0]
										: "",
								);
							})
							.addText((text) => {
								text.setPlaceholder(
									"Closing delimiter",
								).setValue(
									config?.CommentDelimiters
										? config.CommentDelimiters[1]
										: "",
								);
							});
					})
					.addSetting((setting) => {
						setting
							.setName("Language")
							.setDesc("Language to use for this syntax.")
							.addText((text) => {
								text.setValue(
									config?.Lang || "",
								).setPlaceholder(
									"Language code (e.g., en, fr, etc.)",
								);
							});
					})
					.addSetting((setting) => {
						setting
							.setName("Blueprint")
							.setDesc("Blueprint to use for this syntax.")
							.addText((text) => {
								text.setValue(
									config?.Blueprint || "",
								).setPlaceholder("Blueprint name");
							});
					})
					.addSetting((setting) => {
						setting
							.setName("Check overrides")
							.setDesc("Overrides for checks in this syntax")
							.addTextArea((text) => {
								const overrideLines =
									this.extractCheckOverrides(config);
								text.setValue(
									overrideLines.join("\n"),
								).setPlaceholder(
									// eslint-disable-next-line obsidianmd/ui/sentence-case
									"One override per line, format: CheckName = Level or NO (to disable)",
								);
							});
					});
			}
		}
	}

	private extractCheckOverrides(globalConfig: ValeGlobalSection | undefined) {
		const overrides = globalConfig?.CheckOverrides;
		const overrideLines = [];
		if (overrides && overrides.length > 0) {
			for (const override of overrides) {
				overrideLines.push(
					`${override.Check} = ${override?.Enabled === false ? "NO" : override?.Level || "no change"}`,
				);
			}
		}
		return overrideLines;
	}

	private stringArraySetting(
		setting: Setting,
		array: string[] | undefined,
		name: string,
		desc: string,
	): Setting {
		return setting
			.setName(name)
			.setDisabled(true)
			.setDesc(desc)
			.addTextArea((text) => {
				text.setValue(array ? array.join("\n") : "").setPlaceholder(
					`List of ${name.toLowerCase()}, one per line`,
				);
			});
	}
}
