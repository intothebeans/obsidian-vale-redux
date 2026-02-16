import { App, PluginSettingTab } from "obsidian";
import { ValeConfig } from "types";
import ValePlugin from "main";

import { SettingsTab } from "ui/settings-tabs/settings-tab";
import { ValePluginSettingsTab } from "ui/settings-tabs/plugin-settings-tab";
import { ValeConfigTab } from "ui/settings-tabs/vale-config-tab";
// TODO: add default config with updated typing
export const DEFAULT_VALE_CONFIG: ValeConfig = {};

export class ValePluginSettingTab extends PluginSettingTab {
	plugin: ValePlugin;
	icon = "spell-check-2";
	navContainer: HTMLElement;
	tabNavEl: HTMLDivElement;
	settingsContentEl: HTMLDivElement;
	private tabNameToTab: Map<string, SettingsTab> = new Map();
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
		tab.navButton.addEventListener("click", () => {
			this.onTabClick(tab.name);
		});
	}

	private onTabClick(clickedTabName: string): void {
		for (const [name, tab] of this.tabNameToTab.entries()) {
			tab.updateTabDisplayMode(name === clickedTabName);
		}
		this.selectedTab = clickedTabName;
	}
}
