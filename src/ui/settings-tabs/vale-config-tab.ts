import ValePlugin from "main";
import { SettingsTab } from "./settings-tab";
import { Setting, SettingGroup } from "obsidian";
import { ValeConfig, ValeGlobalSection } from "types";
import { getValeStylesPath } from "utils/vale-utils";
import { ALERT_LEVEL_METADATA, AlertLevel } from "utils/constants";

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
		this.createCoreSettings();
		this.createGlobalSettings();
		this.createSyntaxSettings();
	}
	private createCoreSettings(): SettingGroup {
		const config: ValeConfig = this.plugin.valeConfig;
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
						const stylesPath = await getValeStylesPath(this.plugin);
						text.setValue(stylesPath).setPlaceholder(
							"Path to vale styles",
						);
					});
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					config.Vocab,
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
							config.MinAlertLevel !== undefined
								? ALERT_LEVEL_METADATA[
										config.MinAlertLevel as AlertLevel
									]
								: "Not set",
						).setPlaceholder("Minimum alert level");
					});
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					config.IgnoredScopes,
					"Ignored scopes",
					"List of inline-level HTML tags to ignore.",
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					config.SkippedScopes,
					"Skipped scopes",
					"List of block-level HTML tags to ignore",
				);
			})
			.addSetting((setting) => {
				this.stringArraySetting(
					setting,
					config.IgnoredClasses,
					"Ignored classes",
					"Classes to ignore for both inline and block-level tags.",
				);
			});
	}

	private createGlobalSettings(): SettingGroup {
		const config: ValeConfig = this.plugin.valeConfig;
		const globalConfig = config["*"];
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
						text.setValue(globalConfig?.Lang || "").setPlaceholder(
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
						text.setValue(overrideLines.join("\n")).setPlaceholder(
							// eslint-disable-next-line obsidianmd/ui/sentence-case
							"One override per line, format: CheckName = Level or NO (to disable)",
						);
					});
			});
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
									config?.CommentDelimeters
										? config.CommentDelimeters[0]
										: "",
								);
							})
							.addText((text) => {
								text.setPlaceholder(
									"Closing delimiter",
								).setValue(
									config?.CommentDelimeters
										? config.CommentDelimeters[1]
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
				text.setValue(
					array
						? array.join("\n")
						: `No ${name.toLowerCase()} defined`,
				).setPlaceholder(`List of ${name.toLowerCase()}, one per line`);
			});
	}
}
