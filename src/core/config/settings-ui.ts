import ValePlugin from "main";
import { Setting, SettingGroup } from "obsidian";
import { ValeConfig } from "types";
import { ALERT_LEVEL_METADATA, AlertLevel } from "utils/constants";
import { getValeStylesPath } from "utils/vale-utils";

export function createConfigUI(
	container: HTMLElement,
	plugin: ValePlugin,
): void {
	createCoreSettings(container, plugin);
	createGlobalSettings(container, plugin);
}

function createCoreSettings(
	container: HTMLElement,
	plugin: ValePlugin,
): SettingGroup {
	// TODO: read installed packages from config file
	const config: ValeConfig = plugin.valeConfig;
	return new SettingGroup(container)
		.setHeading("Core Settings")
		.addClass("vale-config-core-settings")
		.addSearch((search) => {
			search.setPlaceholder("Search settings...");
		})
		.addSetting((setting) => {
			setting
				.setName("Styles path")
				.setDisabled(true)
				.setDesc("Path to all vale-related resources.")
				.addText(async (text) => {
					const stylesPath = await getValeStylesPath(plugin);
					text.setValue(stylesPath).setPlaceholder(
						"Path to vale styles",
					);
				});
		})
		.addSetting((setting) => {
			stringArraySetting(
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
			stringArraySetting(
				setting,
				config.IgnoredScopes,
				"Ignored scopes",
				"List of inline-level HTML tags to ignore.",
			);
		})
		.addSetting((setting) => {
			stringArraySetting(
				setting,
				config.SkippedScopes,
				"Skipped scopes",
				"List of block-level HTML tags to ignore",
			);
		})
		.addSetting((setting) => {
			stringArraySetting(
				setting,
				config.IgnoredClasses,
				"Ignored classes",
				"Classes to ignore for both inline and block-level tags.",
			);
		});
}

function createGlobalSettings(
	container: HTMLElement,
	plugin: ValePlugin,
): SettingGroup {
	const config: ValeConfig = plugin.valeConfig;
	const globalConfig = config["*"];
	return new SettingGroup(container)
		.setHeading("Global Settings")
		.addClass("vale-config-global-settings")
		.addSetting((setting) => {
			stringArraySetting(
				setting,
				globalConfig?.BasedOnStyles,
				"Based on styles",
				"List of styles to apply globally.",
			);
		})
		.addSetting((setting) => {
			stringArraySetting(
				setting,
				globalConfig?.BlockIgnores,
				"Block ignores",
				"List of block-level HTML tags to ignore globally.",
			);
		})
		.addSetting((setting) => {
			stringArraySetting(
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
					const overrides = globalConfig?.CheckOverrides;
					const overrideLines = [];
					if (overrides && overrides.length > 0) {
						for (const override of overrides) {
							overrideLines.push(
								`${override.Check} = ${override?.Enabled === false ? "NO" : override?.Level || "no change"}`,
							);
						}
					}
					text.setValue(overrideLines.join("\n")).setPlaceholder(
						// eslint-disable-next-line obsidianmd/ui/sentence-case
						"One override per line, format: CheckName = Level or NO (to disable)",
					);
				});
		});
}

function stringArraySetting(
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
				array ? array.join("\n") : `No ${name.toLowerCase()} defined`,
			).setPlaceholder(`List of ${name.toLowerCase()}, one per line`);
		});
}
