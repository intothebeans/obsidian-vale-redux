import { ValeRunner } from "./vale-runner";
import ValePlugin from "main";
import { debounce, Events } from "obsidian";
import { ValeIssue } from "types";
import { ensureAbsolutePath } from "utils/file-utils";
import { notifyError } from "utils/utils";

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
			notifyError(
				`Vale linting failed for file: ${filePath}`,
				8000,
				result.error || "Unknown error",
			);
		}
		this.trigger("issues-updated", filePath);
	}

	refreshFileDebounced(filePath: string): void {
		this.debouncedRefresh(filePath);
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
}
