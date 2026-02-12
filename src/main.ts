import { ValePluginSettings } from "types";
import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, ValePluginSettingTab } from "settings";

export default class ValePlugin extends Plugin {
	public settings: ValePluginSettings;

	// onload runs when plugin becomes enabled.
	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new ValePluginSettingTab(this.app, this));
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ValePluginSettings>,
		);
	}
}
