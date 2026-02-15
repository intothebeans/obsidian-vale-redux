import { ValeRunner } from "./vale-runner";
import ValePlugin from "main";
import { debounce, Events } from "obsidian";
import { ValeIssue } from "types";
import { ensureAbsolutePath } from "utils/file-utils";
import { notifyError } from "utils/error-utils";

export class IssueManager extends Events {
	private plugin: ValePlugin;
	private valeRunner: ValeRunner;
	// TODO: Add cache to saved plugin data
	// Maybe allow use of redis?
	private cache: Map<string, ValeIssue[]> = new Map();
	private debouncedRefresh: (filePath: string) => void;
	private _valeAvailable = true;

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
		if (!this._valeAvailable) {
			return;
		}
		this.trigger("linting-started", filePath);
		const absolutePath = ensureAbsolutePath(
			filePath,
			this.plugin.app.vault,
		);
		const result = await this.valeRunner.lintFile(absolutePath);
		if (result.success) {
			this.cache.set(filePath, result.issues);
		} else {
			this.cache.delete(filePath);
			if (this.isProcessError(result.error)) {
				this._valeAvailable = false;
				notifyError(
					"Vale binary is not available. Linting is disabled until settings are updated or the plugin is reloaded.",
					0,
					result.error || "Unknown error",
				);
			} else {
				notifyError(
					`Vale linting failed for file: ${filePath}`,
					8000,
					result.error || "Unknown error",
				);
			}
		}
		this.trigger("issues-updated", filePath);
	}

	refreshFileDebounced(filePath: string): void {
		this.debouncedRefresh(filePath);
	}

	resetAvailability(): void {
		this._valeAvailable = true;
	}

	get valeAvailable(): boolean {
		return this._valeAvailable;
	}

	clearCache(): void {
		this.cache.clear();
		this.trigger("issues-updated");
	}

	clearFileCache(filePath: string): void {
		this.cache.delete(filePath);
		this.trigger("issues-updated", filePath);
	}

	getIssues(filePath: string): ValeIssue[] {
		return this.cache.get(filePath) || [];
	}

	getIssuesGroupedBySeverity(filePath: string): {
		errors: ValeIssue[];
		warnings: ValeIssue[];
		suggestions: ValeIssue[];
	} {
		const issues = this.getIssues(filePath);
		return {
			errors: issues.filter((i) => i.severity === "error"),
			warnings: issues.filter((i) => i.severity === "warning"),
			suggestions: issues.filter((i) => i.severity === "suggestion"),
		};
	}

	private isProcessError(error?: string): boolean {
		if (!error) return false;
		return (
			error.includes("ENOENT") ||
			error.includes("EACCES") ||
			error.includes("Process failed with error")
		);
	}
}
