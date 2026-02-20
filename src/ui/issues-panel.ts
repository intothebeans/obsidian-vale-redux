import { IssueManager } from "core/issue-manager";
import ValePlugin from "main";
import { ItemView, MarkdownView, Notice, WorkspaceLeaf } from "obsidian";
import { ValeIssue } from "types";
import {
	ISSUES_PANEL_VIEW_TYPE,
	Severity,
	SEVERITY_METADATA,
} from "utils/constants";
import { notifyError } from "utils/error-utils";

import { EditorView } from "@codemirror/view";
import { calculateIssuePosition } from "utils/position-utils";
import {
	addIssueHighlight,
	clearIssueHighlight,
	highlightIssueInEditor,
} from "core/editor/highlights";

export class ValeIssuesView extends ItemView {
	private issueManager: IssueManager;
	private currentFile: string | null = null;

	constructor(leaf: WorkspaceLeaf, issueManager: IssueManager) {
		super(leaf);
		this.issueManager = issueManager;

		this.registerEvent(
			this.issueManager.on("issues-updated", (filePath: string) => {
				if (filePath === this.currentFile) {
					this.render();
				}
			}),
		);

		this.registerEvent(
			this.issueManager.on("linting-started", (filePath: string) => {
				if (filePath === this.currentFile) {
					this.showLintingIndicator();
				}
			}),
		);

		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file) {
					this.currentFile = file.path;
					this.render();
				}
			}),
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
					const activeFile =
						this.app.workspace.getActiveViewOfType(
							MarkdownView,
						)!.file;
					if (activeFile) {
						this.currentFile = activeFile.path;
						this.render();
					}
				}
			}),
		);
	}

	getViewType(): string {
		return ISSUES_PANEL_VIEW_TYPE;
	}

	getDisplayText(): string {
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		return "Vale Issues";
	}

	getIcon(): string {
		return "spell-check";
	}

	async onOpen(): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView?.file) {
			this.currentFile = activeView.file.path;
		}
		this.render();
	}

	private render(): void {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();

		container.addClass("vale-issues-view");
		this.renderActions(container);
		if (!this.currentFile) {
			this.renderEmptyState(
				container,
				"No active file",
				"Open a file to see Vale issues.",
				"📝",
			);
			return;
		}

		const grouped = this.issueManager.getIssuesGroupedBySeverity(
			this.currentFile,
		);
		const issues = this.issueManager.getIssues(this.currentFile);
		const totalIssues = issues.length;
		const header = container.createDiv({ cls: "vale-issues-header" });

		header.createSpan({
			text: `Total Issues: ${totalIssues}`,
			cls: "vale-issues-count",
		});

		if (totalIssues === 0) {
			this.renderEmptyState(
				container,
				"No issues found",
				"Great job! No Vale issues detected in this file.",
				"✅",
			);
			return;
		}

		if (grouped.errors.length > 0) {
			this.renderSeverityGroup(
				container,
				"error",
				"Errors",
				grouped.errors,
			);
		}

		if (grouped.warnings.length > 0) {
			this.renderSeverityGroup(
				container,
				"warning",
				"Warnings",
				grouped.warnings,
			);
		}

		if (grouped.suggestions.length > 0) {
			this.renderSeverityGroup(
				container,
				"suggestion",
				"Suggestions",
				grouped.suggestions,
			);
		}
	}

	private renderIssue(container: HTMLElement, issue: ValeIssue): void {
		const item = container.createDiv({
			cls: `vale-issue-item ${issue.severity}`,
		});

		const itemHeader = item.createDiv({ cls: "vale-issue-header" });
		itemHeader.createDiv({
			text: issue.message,
			cls: "vale-issue-message",
		});
		itemHeader.createSpan({
			text: `Line ${issue.line}:${issue.startCol}`,
			cls: "vale-issue-location",
		});
		item.createDiv({ text: issue.check, cls: "vale-issue-check" });
		item.addEventListener("click", () => {
			this.jumpToIssue(issue).catch((err) => {
				notifyError(
					"Failed to jump to issue location",
					2000,
					err instanceof Error ? err.message : "Unknown error",
				);
			});
		});
	}

	private renderSeverityGroup(
		container: HTMLElement,
		severity: Severity,
		label: string,
		issues: ValeIssue[],
	): void {
		const group = container.createDiv({ cls: "vale-severity-group" });
		const header = group.createDiv({ cls: "vale-severity-header" });
		header.createSpan({
			text: this.getSeverityIcon(severity),
			cls: "vale-severity-icon",
		});
		header.createSpan({ text: label });
		header.createSpan({
			text: `(${issues.length})`,
			cls: "vale-severity-count",
		});

		for (const issue of issues) {
			this.renderIssue(group, issue);
		}
	}

	private showLintingIndicator(): void {
		if (!this.currentFile) return;

		const issues = this.issueManager.getIssues(this.currentFile);
		if (issues.length > 0) return;

		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("vale-issues-view");

		this.renderEmptyState(
			container,
			"Linting...",
			"Checking file for issues.",
			"⏳",
		);
	}

	private renderEmptyState(
		container: HTMLElement,
		title: string,
		message: string,
		icon: string,
	): void {
		const emptyState = container.createDiv({ cls: "vale-empty-state" });
		emptyState.createDiv({ text: icon, cls: "vale-empty-state-icon" });
		emptyState.createEl("h3", { text: title });
		emptyState.createEl("p", { text: message });
	}

	private renderActions(container: HTMLElement): void {
		const actionsContainer = container.createDiv({
			cls: "vale-issues-panel-actions",
		});

		const disabledActions = [
			this.addAction(
				"list-filter",
				"Filter issues (coming soon)",
				() => {},
			),
			this.addAction(
				"chevrons-down-up",
				"Collapse (coming soon)",
				() => {},
			),
			this.addAction("group", "Group by (coming soon)", () => {}),
			this.addAction(
				"arrow-down-wide-narrow",
				"Sort issues (coming soon)",
				() => {},
			),
			this.addAction(
				"magnifying-glass",
				"Search issues (coming soon)",
				() => {},
			),
		];
		for (const action of disabledActions) {
			action.addClass("vale-action-disabled");
			action.setAttribute("aria-disabled", "true");
		}

		actionsContainer.append(
			this.addAction("refresh-cw", "Refresh issues", async () => {
				if (this.currentFile) {
					const notice = new Notice("Refreshing issues...", 0);
					await this.issueManager.refreshFile(this.currentFile);
					notice.hide();
					this.render();
				}
			}),
			...disabledActions,
		);
	}

	private async jumpToIssue(issue: ValeIssue): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!activeView || activeView.file?.path !== this.currentFile) {
			// Need to open the file first
			const file = this.app.vault.getAbstractFileByPath(
				this.currentFile!,
			);
			if (file) {
				await this.app.workspace.openLinkText(
					this.currentFile!,
					"",
					false,
				);
			}
		}

		// Set cursor position
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const editor = view.editor;
			editor.setCursor({
				line: issue.line - 1,
				ch: issue.startCol - 1,
			});
			editor.scrollIntoView(
				{
					from: { line: issue.line - 1, ch: issue.startCol },
					to: { line: issue.line - 1, ch: issue.endCol },
				},
				true,
			);

			// Add temporary highlight to make the issue easier to see
			highlightIssueInEditor(issue, this.app);
		}
	}

	/** Get icon for severity level */
	private getSeverityIcon(severity: Severity): string {
		return SEVERITY_METADATA[severity].icon;
	}
}

export async function openIssuesPanel(plugin: ValePlugin): Promise<void> {
	await plugin.app.workspace.getRightLeaf(false)?.setViewState({
		type: ISSUES_PANEL_VIEW_TYPE,
		active: true,
	});
	const leaf = plugin.app.workspace.getLeavesOfType(
		ISSUES_PANEL_VIEW_TYPE,
	)[0];
	if (leaf) {
		await plugin.app.workspace.revealLeaf(leaf);
	}
}
