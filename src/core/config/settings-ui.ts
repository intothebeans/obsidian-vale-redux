import ValePlugin from "main";
import { SearchComponent, Setting, SettingGroup } from "obsidian";
import { ValeConfig } from "types";
import { AlertLevel } from "utils/constants";
import { getValeStylesPath } from "utils/vale-utils";

export function createConfigUI(
	container: HTMLElement,
	plugin: ValePlugin,
): void {
	createCoreSettings(container, plugin);
}

function createCoreSettings(
	container: HTMLElement,
	plugin: ValePlugin,
): SettingGroup {
	// TODO: read installed packages from config file
	const config: ValeConfig = plugin.valeConfig;
	return new SettingGroup(container)
		.setHeading("Core Settins")
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
							? AlertLevel[config.MinAlertLevel as AlertLevel]
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
		})
		.addSetting((setting) => {
			setting
				.setName("Check severity overrides")
				.setDisabled(true)
				.setDesc("Custom alert levels for specific checks.")
				.addTextArea((text) => {
					if (config.RuleToLevel) {
						const overrides = Object.entries(config.RuleToLevel)
							.map(([check, level]) => `${check}: ${level}`)
							.join("\n");
						text.setValue(overrides);
					} else {
						text.setValue("No custom overrides defined");
					}
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
