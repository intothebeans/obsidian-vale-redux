import { App, PluginSettingTab } from "obsidian";
import { ValeConfig } from "types";
import ValePlugin from "main";

import { SettingsTab } from "ui/settings-tabs/settings-tab";
import { ValePluginSettingsTab } from "ui/settings-tabs/plugin-settings-tab";
import { ValeConfigTab } from "ui/settings-tabs/vale-config-tab";
export const DEFAULT_VALE_CONFIG: ValeConfig = {
	StylesPath: ".vale/styles",
	MinAlertLevel: "suggestion",
	Packages: ["Microsoft", "write-good"],
	Vocab: ["Base"],
	formats: { mdx: "md" },
	"*": {
		BasedOnStyles: ["Vale"],
	},
	syntaxSections: {
		"*.{md,mdx}": {
			BasedOnStyles: ["Vale", "Microsoft", "write-good"],
			CheckOverrides: [{ Check: "Vale.Spelling", Enabled: false }],
			BlockIgnores: [new RegExp(/(\$\$[\s\S]+?\$\$)/).source],
			TokenIgnores: [
				new RegExp(/(\$+[^\n$]+\$+)/).source,
				new RegExp(/(\[\[.*?\]\])/).source,
				new RegExp(/(#[^\s]+)/).source,
			],
		},
	},
};

export class ValePluginSettingTab extends PluginSettingTab {
	plugin: ValePlugin;
	icon = "spell-check-2";
	navContainer: HTMLElement;
	tabNavEl: HTMLDivElement;
	settingsContentEl: HTMLDivElement;
	private tabNameToTab: Map<string, SettingsTab> = new Map();
	private navClickListeners: Map<string, EventListener> = new Map();
	private selectedTab: string = "Plugin Settings";
	constructor(app: App, plugin: ValePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.navContainer = containerEl.createEl("nav", {
			cls: "vale-settings-nav",
		});
		this.tabNavEl = this.navContainer.createDiv({
			cls: "vale-settings-tab-group",
		});
		this.settingsContentEl = containerEl.createDiv({
			cls: "vale-settings-content",
		});
		this.addTabs();
	}

	hide(): void {
		// Cancel any pending save operations when the settings tab is closed
		this.plugin.debounceSettingsSave.cancel();
		this.containerEl.empty();
		for (const [name, tab] of this.tabNameToTab.entries()) {
			const listener = this.navClickListeners.get(name);
			if (listener) {
				tab.navButton.removeEventListener("click", listener);
			}
		}
		this.navClickListeners.clear();
		this.tabNameToTab.clear();
		super.hide();
	}

	private addTabs(): void {
		const pluginSettingsTab = new ValePluginSettingsTab(
			this.tabNavEl,
			this.settingsContentEl,
			this.plugin,
		);

		const valeConfigTab = new ValeConfigTab(
			this.tabNavEl,
			this.settingsContentEl,
			this.plugin,
		);

		this.addTab(pluginSettingsTab);
		this.addTab(valeConfigTab);
		this.onTabClick(this.selectedTab);
	}

	private addTab(tab: SettingsTab): void {
		this.tabNameToTab.set(tab.name, tab);
		const listener = () => {
			this.onTabClick(tab.name);
		};
		tab.navButton.addEventListener("click", listener);
		this.navClickListeners.set(tab.name, listener);
	}

	private onTabClick(clickedTabName: string): void {
		for (const [name, tab] of this.tabNameToTab.entries()) {
			tab.updateTabDisplayMode(name === clickedTabName);
		}
		this.selectedTab = clickedTabName;
	}
}
