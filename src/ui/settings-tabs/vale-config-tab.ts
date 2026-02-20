import ValePlugin from "main";
import { SettingsTab } from "./settings-tab";
import { Setting, SettingGroup, Notice } from "obsidian";
import { Severity, ValeCheckOverride, ValeProcess } from "types";
import { getValeStylesPath, returnCodeFail } from "utils/vale-utils";
import { shell } from "electron";
import {
	backupExistingConfig,
	getExistingConfigOptions,
	rotateBackups,
	writeConfigToFile,
} from "core/vale-config";
import { spawnProcessWithOutput } from "utils/process-utils";
import { notifyError } from "utils/error-utils";

export class ValeConfigTab extends SettingsTab {
	constructor(
		navEl: HTMLElement,
		settingsEl: HTMLElement,
		plugin: ValePlugin,
	) {
		super(navEl, settingsEl, "Vale Config", plugin, "file-sliders");
		this.display();
	}

	display(): void {
		if (this.plugin.valeConfig) {
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
								await this.backupAndWriteConfig();
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
									this.plugin.valeConfig = loadedConfig;
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
		const valeConfig = this.plugin.valeConfig;
		return new SettingGroup(this.contentEl)
			.setHeading("Core Settings")
			.addClass("vale-config-core-settings")
			.addSetting((setting) => {
				setting
					.setName("Styles path")
					.setDesc("Path to all vale-related resources.")
					.addText(async (text) => {
						const stylesPath =
							(await getValeStylesPath(this.plugin)) || "";
						text.setValue(stylesPath)
							.setPlaceholder("Path to vale styles")
							.onChange((value) => {
								valeConfig.StylesPath =
									value.trim() === ""
										? undefined
										: value.trim();
							});
					});
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					valeConfig.Vocab,
					"Vocab",
					"List of vocabularies to load.",
					(value) => {
						valeConfig.Vocab = value;
					},
				);
			})
			.addSetting((setting) => {
				setting
					.setName("Minimum alert level")
					.setDesc(
						"Minimum alert level to display. (e.g., suggestion, warning, error)",
					)
					.addText((text) => {
						text.setValue(valeConfig.MinAlertLevel ?? "")
							// eslint-disable-next-line obsidianmd/ui/sentence-case
							.setPlaceholder("suggestion, warning, or error")
							.onChange((value) => {
								valeConfig.MinAlertLevel =
									(value as Severity) ?? undefined;
							});
					});
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					valeConfig.Packages,
					"Packages",
					"Packages to install with vale sync",
					(value) => {
						valeConfig.Packages = value;
					},
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					valeConfig.IgnoredScopes,
					"Ignored scopes",
					"List of inline-level HTML tags to ignore.",
					(value) => {
						valeConfig.IgnoredScopes = value;
					},
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					valeConfig.SkippedScopes,
					"Skipped scopes",
					"List of block-level HTML tags to ignore",
					(value) => {
						valeConfig.SkippedScopes = value;
					},
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					valeConfig.IgnoredClasses,
					"Ignored classes",
					"Classes to ignore for both inline and block-level tags.",
					(value) => {
						valeConfig.IgnoredClasses = value;
					},
				);
			});
	}

	private createGlobalSettings(): SettingGroup | void {
		const globalConfig = this.plugin.valeConfig["*"] || null;
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
						(value) => {
							globalConfig.BasedOnStyles = value;
						},
					);
				})
				.addSetting((setting) => {
					this.stringArraySetting(
						setting,
						globalConfig?.BlockIgnores,
						"Block ignores",
						"List of block-level HTML tags to ignore globally.",
						(value) => {
							globalConfig.BlockIgnores = value;
						},
					);
				})
				.addSetting((setting) => {
					this.stringArraySetting(
						setting,
						globalConfig?.TokenIgnores,
						"Token ignores",
						"List of inline-level HTML tags to ignore globally.",
						(value) => {
							globalConfig.TokenIgnores = value;
						},
					);
				})
				.addSetting((setting) => {
					setting
						.setName("Language")
						.setDesc("Language to use for global checks.")
						.addText((text) => {
							text.setValue(globalConfig?.Lang || "")
								.setPlaceholder(
									"Language code (e.g., en, fr, etc.)",
								)
								.onChange((value) => {
									globalConfig.Lang =
										value.trim() || undefined;
								});
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
							text.setValue(overrideLines.join("\n"))
								.setPlaceholder(
									// eslint-disable-next-line obsidianmd/ui/sentence-case
									"One override per line, format: CheckName = Level or NO (to disable)",
								)
								.onChange((value) => {
									globalConfig.CheckOverrides =
										this.parseCheckOverrides(value);
								});
						});
				});
		}
		return;
	}

	private createSyntaxSettings(): SettingGroup | void {
		const sections = this.plugin.valeConfig.syntaxSections || null;
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
							(value) => {
								config.BasedOnStyles = value;
							},
						);
					})
					.addSetting((setting) => {
						this.stringArraySetting(
							setting,
							config.BlockIgnores,
							"Block ignores",
							"List of block-level HTML tags to ignore for this syntax.",
							(value) => {
								config.BlockIgnores = value;
							},
						);
					})
					.addSetting((setting) => {
						this.stringArraySetting(
							setting,
							config.TokenIgnores,
							"Token ignores",
							"List of inline-level HTML tags to ignore for this syntax.",
							(value) => {
								config.TokenIgnores = value;
							},
						);
					})
					.addSetting((setting) => {
						setting
							.setName("Comment delimiters")
							.setDesc(
								"Delimiters used to identify comments for this syntax, separated by a space.",
							)
							.addText((text) => {
								text.setPlaceholder(
									// eslint-disable-next-line obsidianmd/ui/sentence-case
									"<!-- -->, # ---, etc. depending on syntax)",
								)
									.setValue(
										(config.CommentDelimiters || []).join(
											" ",
										),
									)
									.onChange((value) => {
										const parts = value
											.split(" ")
											.map((part) => part.trim())
											.filter((part) => part !== "");
										const opening = parts[0];
										if (!opening) {
											config.CommentDelimiters =
												undefined;
										} else {
											config.CommentDelimiters = [
												opening,
												parts[1] || "",
											];
										}
									});
							});
					})
					.addSetting((setting) => {
						setting
							.setName("Language")
							.setDesc("Language to use for this syntax.")
							.addText((text) => {
								text.setValue(config?.Lang || "")
									.setPlaceholder(
										"Language code (e.g., en, fr, etc.)",
									)
									.onChange((value) => {
										config.Lang = value.trim() || undefined;
									});
							});
					})
					.addSetting((setting) => {
						setting
							.setName("Blueprint")
							.setDesc("Blueprint to use for this syntax.")
							.addText((text) => {
								text.setValue(config?.Blueprint || "")
									.setPlaceholder("Blueprint name")
									.onChange((value) => {
										config.Blueprint =
											value.trim() || undefined;
									});
							});
					})
					.addSetting((setting) => {
						setting
							.setName("Check overrides")
							.setDesc("Overrides for checks in this syntax")
							.addTextArea((text) => {
								const overrideLines =
									this.extractCheckOverrides(config);
								text.setValue(overrideLines.join("\n"))
									.setPlaceholder(
										// eslint-disable-next-line obsidianmd/ui/sentence-case
										"One override per line, format: CheckName = Level or NO (to disable)",
									)
									.onChange((value) => {
										config.CheckOverrides =
											this.parseCheckOverrides(value);
									});
							});
					});
			}
		}
	}

	private extractCheckOverrides(section: {
		CheckOverrides?: ValeCheckOverride[];
	}) {
		const overrides = section?.CheckOverrides;
		const overrideLines: string[] = [];
		if (overrides && overrides.length > 0) {
			for (const override of overrides) {
				overrideLines.push(
					`${override.Check} = ${override.Enabled === false ? "NO" : override.Level || ""}`,
				);
			}
		}
		return overrideLines;
	}

	private parseCheckOverrides(
		value: string,
	): ValeCheckOverride[] | undefined {
		const parsedOverrides: ValeCheckOverride[] = [];
		for (const rawLine of value.split("\n")) {
			const line = rawLine.trim();
			if (line === "") {
				continue;
			}
			const equalsIndex = line.indexOf("=");
			if (equalsIndex === -1) {
				continue;
			}
			const check = line.slice(0, equalsIndex).trim();
			const rawLevel = line.slice(equalsIndex + 1).trim();
			if (!check || !rawLevel) {
				continue;
			}
			if (rawLevel.toUpperCase() === "NO") {
				parsedOverrides.push({ Check: check, Enabled: false });
			} else {
				const level = (rawLevel as Severity) ?? undefined;
				if (!level) {
					continue;
				}
				parsedOverrides.push({
					Check: check,
					Enabled: true,
					Level: level,
				});
			}
		}

		return parsedOverrides.length > 0 ? parsedOverrides : undefined;
	}

	private stringArraySetting(
		setting: Setting,
		array: string[] | undefined,
		name: string,
		desc: string,
		onChange: (value: string[] | undefined) => void,
	): Setting {
		return setting
			.setName(name)
			.setDesc(desc)
			.addTextArea((text) => {
				text.setValue(array ? array.join("\n") : "")
					.setPlaceholder(
						`List of ${name.toLowerCase()}, one per line`,
					)
					.onChange((value) => {
						const parsed = value
							.split("\n")
							.map((line) => line.trim())
							.filter((line) => line !== "");
						onChange(parsed.length > 0 ? parsed : undefined);
					});
			});
	}

	private async backupAndWriteConfig(): Promise<void> {
		const plugin = this.plugin;
		const config = this.plugin.valeConfig;
		try {
			await backupExistingConfig(plugin);
		} catch (err) {
			notifyError(
				"Failed to backup existing config.",
				8000,
				err instanceof Error ? err.message : String(err),
			);
			return;
		}

		try {
			await writeConfigToFile(
				plugin.settings.valeConfigPathAbsolute,
				config,
			);
		} catch (err) {
			notifyError(
				`Failed to write Vale config file: ${err instanceof Error ? err.message : String(err)}`,
			);
			return;
		}

		try {
			await rotateBackups(plugin);
		} catch (err) {
			notifyError(
				"Failed to rotate backups after saving config.",
				8000,
				err instanceof Error ? err.message : String(err),
			);
			return;
		}

		new Notice("Config saved successfully! Backup created.", 3000);
	}
}
