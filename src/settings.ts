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
		this.tabNavEl.setAttribute("role", "tablist");
		this.settingsContentEl = containerEl.createDiv({
			cls: "vale-settings-content",
		});
		this.addTabs();
	}

	hide(): void {
		// Cancel any pending save operations when the settings tab is closed
		this.plugin.debounceSettingsSave.cancel();
		this.containerEl.empty();
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
		tab.navButton.addEventListener("click", () => {
			this.onTabClick(tab.name);
		});

		// Add keyboard navigation support
		tab.navButton.addEventListener("keydown", (e: KeyboardEvent) => {
			this.handleTabKeydown(e, tab.name);
		});
	}

	private onTabClick(clickedTabName: string): void {
		for (const [name, tab] of this.tabNameToTab.entries()) {
			tab.updateTabDisplayMode(name === clickedTabName);
		}
		this.selectedTab = clickedTabName;
	}

	private handleTabKeydown(e: KeyboardEvent, currentTabName: string): void {
		const tabNames = Array.from(this.tabNameToTab.keys());
		const currentIndex = tabNames.indexOf(currentTabName);

		switch (e.key) {
			case "Enter":
			case " ": // Space key
				e.preventDefault();
				this.onTabClick(currentTabName);
				break;
			case "ArrowLeft":
				e.preventDefault();
				this.navigateToTab(currentIndex - 1, tabNames);
				break;
			case "ArrowRight":
				e.preventDefault();
				this.navigateToTab(currentIndex + 1, tabNames);
				break;
		}
	}

	private navigateToTab(targetIndex: number, tabNames: string[]): void {
		// Wrap around if at the beginning or end
		if (targetIndex < 0) {
			targetIndex = tabNames.length - 1;
		} else if (targetIndex >= tabNames.length) {
			targetIndex = 0;
		}

		const targetTabName = tabNames[targetIndex];
		if (!targetTabName) {
			return;
		}

		this.onTabClick(targetTabName);

		// Focus the newly selected tab
		const targetTab = this.tabNameToTab.get(targetTabName);
		if (targetTab) {
			targetTab.navButton.focus();
		}
	}
}
