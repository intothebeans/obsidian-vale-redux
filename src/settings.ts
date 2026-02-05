/* eslint-disable obsidianmd/ui/sentence-case */
import {
	App,
	debounce,
	Notice,
	PluginSettingTab,
	Setting,
	SettingGroup,
} from "obsidian";
import { ValeConfig, ValePluginSettings } from "types";
import ValePlugin from "main";
import { spawn } from "child_process";
import { Buffer } from "buffer";
import { openExternalFilesystemObject } from "utils/file-utils";

export const DEFAULT_SETTINGS: ValePluginSettings = {
	valeBinaryPath: "vale",
	valeConfigPath: ".vale.ini",
	excludedFiles: [],
	showInlineAlerts: true,
	debounceMs: 500,
	disabledFiles: [],
	automaticChecking: true,
	valeConfig: new ValeConfig("styles"),
};

export class ValePluginSettingTab extends PluginSettingTab {
	plugin: ValePlugin;
	icon: "spell-check";
	// Prevent setting save overhead
	debouncedSave = debounce(() => this.plugin.saveSettings(), 500);

	constructor(app: App, plugin: ValePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		let settings = this.plugin.settings;
		const vault = this.app.vault;
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName("Enable inline alerts")
			.setDesc("Show Vale issues directly in the editor.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.showInlineAlerts)
					.onChange(async (value) => {
						settings.showInlineAlerts = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Automatic checking")
			.setDesc("Automatically check files. Disable for manual control.")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.automaticChecking)
					.onChange(async (value) => {
						settings.automaticChecking = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Vale binary path")
			.setDesc(
				"Use an absolute path for the Vale binary. (i.e. /usr/local/bin/vale)",
			)
			.addText((text) => {
				text.setPlaceholder("vale")
					.setValue(settings.valeBinaryPath)
					.onChange(async (value) => {
						settings.valeBinaryPath = value;
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
						await this.testValeConnection();
					});
			});
		new Setting(containerEl)
			.setName("Vale config path")
			.setDesc("Absolute path or relative to vault root.")
			.addText((text) => {
				text.setPlaceholder(".vale.ini")
					.setValue(settings.valeConfigPath)
					.onChange(async (value) => {
						settings.valeConfigPath = value;
						this.debouncedSave();
					});
			})
			.addButton((button) => {
				button.setButtonText("Generate Config");
			});
		new Setting(containerEl)
			.setName("Quick Access")
			.addButton((button) => {
				button.setButtonText("Open Styles Folder").onClick(async () => {
					return settings.valeConfig
						? await openExternalFilesystemObject(
								settings.valeConfig.getStylesPath(),
								vault,
							)
						: new Notice(
								"Vale config not loaded. Please set a valid config path and save settings.",
							);
				});
			})
			.addButton((button) => {
				button.setButtonText("Open Config File").onClick(async () => {
					await openExternalFilesystemObject(
						settings.valeConfigPath,
						vault,
					);
				});
			});

		new SettingGroup(containerEl)
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
							.setValue(settings.excludedFiles.join("\n"))
							.onChange(async (value) => {
								settings.excludedFiles = value
									.split("\n")
									.map((line) => line.trim())
									.filter((line) => line.length > 0);
								this.debouncedSave();
							});
					});
			})
			.addSetting((setting) => {
				setting
					.setName("Debounce Time")
					.setDesc(
						"Delay in milliseconds before saving settings after changes.",
					)
					.addText((text) => {
						text.setPlaceholder("500")
							.setValue(settings.debounceMs.toString())
							.onChange(async (value) => {
								const num = parseInt(value, 10);
								if (!isNaN(num) && num >= 0) {
									settings.debounceMs = num;
									this.debouncedSave();
								}
							});
					});
			});
	}

	hide(): void {
		// Cancel any pending save operations when the settings tab is closed
		this.debouncedSave.cancel();
		super.hide();
	}

	private async testValeConnection(): Promise<void> {
		const binaryPath = this.plugin.settings.valeBinaryPath || "vale";
		const notice = new Notice("Testing Vale connection...", 0);
		try {
			const process = spawn(binaryPath, ["--version"]);
			let stdout = "";
			let stderr = "";

			process.stdout.on("data", (data: Buffer) => {
				stdout += data.toString();
			});
			process.stderr.on("data", (data: Buffer) => {
				stderr += data.toString();
			});

			await new Promise<void>((resolve, reject) => {
				process.on("close", (returnCode) => {
					if (returnCode === 0) {
						resolve();
					} else {
						reject(
							new Error(
								`Vale process exited with code ${returnCode}: ${stderr}`,
							),
						);
					}
				});
				process.on("error", (err) => {
					reject(err);
				});
				setTimeout(() => {
					process.kill();
					reject(new Error("Vale process timed out"));
				}, 5000);
			});
			notice.hide();
			new Notice(`✓ Vale connected successfully!\n${stdout.trim()}`);
		} catch (error) {
			notice.hide();
			new Notice(
				`✗ Vale connection failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure Vale is installed and the binary path is correct.`,
				8000,
			);
		}
	}
}
