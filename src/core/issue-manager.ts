import { ValeRunner } from "./vale-runner";
import ValePlugin from "main";
import { debounce, Events, Notice } from "obsidian";
import { ValeIssue } from "types";
import { ensureAbsolutePath } from "utils/file-utils";

export class IssueManager extends Events {
	private plugin: ValePlugin;
	private valeRunner: ValeRunner;
	// TODO: Add cache to saved plugin data
	// Maybe allow use of redis?
	private cache: Map<string, ValeIssue[]> = new Map();
	private debouncedRefresh: (filePath: string) => void;

	constructor(plugin: ValePlugin) {
		super();
		this.plugin = plugin;
		this.valeRunner = this.plugin.valeRunner;

		this.debouncedRefresh = debounce(
			(filePath: string) => this.refreshFile(filePath),
			this.plugin.settings.debounceMs,
		);
	}

	async refreshFile(filePath: string): Promise<void> {
		console.debug(`Refreshing issues for file: ${filePath}`);
		const absolutePath = ensureAbsolutePath(
			filePath,
			this.plugin.app.vault,
		);
		const result = await this.valeRunner.lintFile(absolutePath);
		if (result.success) {
			console.debug(
				`Vale lint successful for ${filePath}, found ${result.issues.length} issues.`,
			);
			this.cache.set(filePath, result.issues);
		} else {
			console.error(`Vale lint failed for ${filePath}: ${result.error}`);
			this.cache.delete(filePath);
			new Notice(`Vale linting failed!`);
		}
	}

	refreshFileDebounced(filePath: string): void {
		this.debouncedRefresh(filePath);
	}

	clearCache(): void {
		console.debug("Clearing entire issue cache");
		this.cache.clear();
		this.trigger("issues-updated");
	}

	clearFileCache(filePath: string): void {
		console.debug(`Clearing cache for file: ${filePath}`);
		this.cache.delete(filePath);
		this.trigger("issues-updates", filePath);
	}
}
