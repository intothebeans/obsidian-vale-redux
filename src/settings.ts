/* eslint-disable obsidianmd/ui/sentence-case */
import {
	App,
	debounce,
	Notice,
	PluginSettingTab,
	Setting,
	SettingGroup,
} from "obsidian";
import { ValeConfig, ValeProcess } from "types";
import ValePlugin from "main";
import {
	ensureAbsolutePath,
	openExternalFilesystemObject,
} from "utils/file-utils";
import { returnCodeFail } from "utils/vale-utils";
import { notifyError } from "utils/error-utils";
import { spawnProcessWithOutput } from "utils/process-utils";

// FIX: Single regex being broken up during parsing
export const DEFAULT_VALE_CONFIG: ValeConfig = {
	BlockIgnores: {
		"*.{md,mdx}": [/ *(`{3,}|~{3,})\S*?[\s\S]*?(`{3,}|~{3,})/.source],
	},
	MinAlertLevel: 0,
	Vocab: ["Base"],
	Formats: {
		mdx: "md",
	},
	SBaseStyles: {
		"*.{md,mdx}": ["write-good", "Vale"],
	},
	GBaseStyles: ["Vale"],
	TokenIgnores: {
		"*.{md,mdx}": [
			/(\$+[^\n$]+\$+)/.source,
			/(\[\[.*?\]\])/.source,
			/(#[^\s]+)/.source,
		],
	},
};

export class ValePluginSettingTab extends PluginSettingTab {
	plugin: ValePlugin;
	icon = "spell-check-2";
	// NOTE: Use to prevent saving overhead on text input fields
	debouncedSave = debounce(() => this.plugin.saveSettings(), 500);

	constructor(app: App, plugin: ValePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.addBasicSettings(containerEl);
		this.addValeBinaryPathSetting(containerEl);
		this.addValeConfigPathSetting(containerEl);
		this.addQuickAccessButtons(containerEl);
		this.addAdvancedSettings(containerEl);
	}

	private addBasicSettings(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Enable inline alerts")
			.setDesc("Show Vale issues directly in the editor.")
			.addToggle((toggle) => {
				toggle
					.setValue(settings.showInlineAlerts)
					.onChange(async (value) => {
						settings.showInlineAlerts = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Automatic checking")
			.setDesc(
				"Automatically check files on changes. Requires plugin reload to take effect.",
			)
			.addToggle((toggle) => {
				toggle
					.setValue(settings.automaticChecking)
					.onChange(async (value) => {
						settings.automaticChecking = value;
						await this.plugin.saveSettings();
					});
			});
	}

	private addValeBinaryPathSetting(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Vale binary path")
			.setDesc(
				"Absolute path to the Vale binary (e.g., /usr/local/bin/vale). Leave empty to use 'vale' from system PATH.",
			)
			.addText((text) => {
				text.setPlaceholder("vale")
					.setValue(settings.valeBinaryPath)
					.onChange(async (value) => {
						settings.valeBinaryPath = value.trim() || "vale";
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
						const valeProcess = {
							command: settings.valeBinaryPath,
							args: ["--version"],
							timeoutMs: settings.valeProcessTimeoutMs,
							onClose: returnCodeFail,
						};
						await testValeConnection(valeProcess);
					});
			});
	}

	private addValeConfigPathSetting(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Vale config path")
			.setDesc(
				"Path to Vale config file. Use relative path (from vault root) or absolute path.",
			)
			.addText((text) => {
				text.setPlaceholder(".vale.ini")
					.setValue(settings.valeConfigPath)
					.onChange(async (value) => {
						settings.valeConfigPath = value.trim();
						this.debouncedSave();
					});
			});
	}

	private addQuickAccessButtons(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;
		const vault = this.app.vault;

		new Setting(containerEl)
			.setName("Quick Access")
			.addButton((button) => {
				button.setButtonText("Open Styles Folder").onClick(async () => {
					try {
						const stylesPath = await getValeStylesPath(
							settings.valeBinaryPath,
							settings.valeConfigPath,
						);
						await openExternalFilesystemObject(stylesPath, vault);
					} catch (error) {
						notifyError(
							"Failed to open styles folder.",
							8000,
							`${error instanceof Error ? error.message : String(error)}`,
						);
					}
				});
			})
			.addButton((button) => {
				button.setButtonText("Open Config File").onClick(async () => {
					const absolutePath = ensureAbsolutePath(
						settings.valeConfigPath,
						vault,
					);
					if (!absolutePath) {
						notifyError(
							"No config file path specified. Set a config path above first.",
						);
						return;
					}
					await openExternalFilesystemObject(absolutePath, vault);
				});
			});
	}

	private addAdvancedSettings(containerEl: HTMLElement): void {
		const settings = this.plugin.settings;

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
						"Delay in milliseconds before re-linting after edits.",
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
			})
			.addSetting((setting) => {
				setting
					.setName("Process timeout")
					.setDesc(
						"How long should Vale run before it times out. If Vale is failing on large files, try increasing this value.",
					)
					.addText((text) => {
						text.setPlaceholder("5000")
							.setValue(settings.valeProcessTimeoutMs.toString())
							.onChange(async (value) => {
								const num = parseInt(value, 10);
								if (!isNaN(num) && num >= 0) {
									settings.valeProcessTimeoutMs = num;
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
}

async function testValeConnection(valeProcess: ValeProcess): Promise<boolean> {
	const notice = new Notice("Testing Vale connection...", 0);

	try {
		const stdout = await spawnProcessWithOutput(valeProcess);
		notice.hide();
		new Notice(`✓ Vale connected successfully!\n${stdout.trim()}`);
		return true;
	} catch (error) {
		notice.hide();
		notifyError(
			`Vale connection failed\n\nPlease ensure Vale is installed and the binary path is correct.`,
			8000,
			`${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}

async function getValeStylesPath(
	binaryPath: string,
	configPath: string,
): Promise<string> {
	const valeProcess = {
		command: binaryPath,
		args: ["ls-dirs", "--output=JSON", `--config=${configPath}`],
		timeoutMs: 5000,
		onClose: returnCodeFail,
	};
	const cmdOutput = await spawnProcessWithOutput(valeProcess);
	const outputJson = JSON.parse(cmdOutput) as {
		StylesPath?: string;
		".vale.ini"?: string;
	};
	if (outputJson && outputJson.StylesPath) {
		return outputJson.StylesPath;
	} else if (outputJson && configPath && outputJson[".vale.ini"]) {
		return outputJson[".vale.ini"];
	} else {
		throw new Error("Styles path not found in Vale output");
	}
}
