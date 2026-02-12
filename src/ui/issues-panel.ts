import { IssueManager } from "core/issue-manager";
import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import { getSeverityLabel, ValeIssue } from "types";
import { ISSUES_PANEL_VIEW_TYPE } from "utils/constants";

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
			this.app.workspace.on("file-open", (file) => {
				if (file) {
					this.currentFile = file.path;
					this.render();
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
		return "alert-circle";
	}

	async onOpen(): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView?.file) {
			this.currentFile = activeView.file.path;
		}
		this.render();
	}

	async onClose(): Promise<void> {
		// TODO: implement me
	}

	private render(): void {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();

		// for ✨ style ✨
		container.addClass("vale-issues-view");

		if (!this.currentFile) {
			this.renderEmptyState(
				container,
				"No active file",
				"Open a file to see Vale issues.",
			);
			return;
		}

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
				"✅ No issues found",
				"Great job! No Vale issues detected in this file.",
			);
			return;
		}

		issues.forEach((issue) => {
			this.renderIssue(container, issue);
		});
	}

	private renderIssue(container: HTMLElement, issue: ValeIssue): void {
		const item = container.createDiv({
			cls: `vale-issue-item ${getSeverityLabel(issue.severity)}`,
		});

		const itemHeader = item.createDiv({ cls: "vale-issue-header" });
		itemHeader.createSpan({
			text: `Line ${issue.line}:${issue.startCol}`,
			cls: "vale-issue-location",
		});
		itemHeader.createDiv({
			text: issue.message,
			cls: "vale-issue-message",
		});
		item.createDiv({ text: issue.check, cls: "vale-issue-check" });
	}

	private renderEmptyState(
		container: HTMLElement,
		title: string,
		message: string,
	): void {
		const emptyState = container.createDiv({ cls: "vale-empty-state" });
		emptyState.createDiv({ text: "📝", cls: "vale-empty-state-icon" });
		emptyState.createEl("h3", { text: title });
		emptyState.createEl("p", { text: message });
	}
}
