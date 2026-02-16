import ValePlugin from "main";
import { setIcon } from "obsidian";

/** Setting tab implementation based on {@link https://github.com/platers/obsidian-linter | platers/obsidian-linter} plugin */
export abstract class SettingsTab {
	contentEl: HTMLDivElement;
	headingEl: HTMLElement;
	navButton: HTMLDivElement;

	constructor(
		navEl: HTMLElement,
		settingsEl: HTMLElement,
		public name: string,
		protected plugin: ValePlugin,
		public icon?: string,
	) {
		this.navButton = navEl.createDiv({
			cls: "vale-navigation-item",
		});

		// Make tab button focusable for keyboard navigation
		this.navButton.setAttribute("tabindex", "0");
		this.navButton.setAttribute("role", "tab");
		this.navButton.setAttribute("aria-selected", "false");

		if (icon) {
			setIcon(
				this.navButton.createSpan({ cls: "vale-settings-tab-icon" }),
				icon,
			);
		}
		this.navButton.createSpan({ text: name, title: name });

		this.contentEl = settingsEl.createDiv({ cls: "vale-tab-settings" });
		this.contentEl.id = name.toLowerCase().replace(" ", "-");
		this.contentEl.setAttribute("role", "tabpanel");
		this.contentEl.setAttribute(
			"aria-labelledby",
			name.toLowerCase().replace(" ", "-") + "-tab",
		);
		this.navButton.id = name.toLowerCase().replace(" ", "-") + "-tab";
	}

	abstract display(): void;

	updateTabDisplayMode(isSelected: boolean): void {
		if (isSelected) {
			this.navButton.addClass("selected");
			this.navButton.setAttribute("aria-selected", "true");
			this.navButton.setAttribute("tabindex", "0");
			this.showElement(this.contentEl);
		} else {
			this.navButton.removeClass("selected");
			this.navButton.setAttribute("aria-selected", "false");
			this.navButton.setAttribute("tabindex", "-1");
			this.hideElement(this.contentEl);
		}
	}

	private hideElement(el: HTMLElement): void {
		el.addClass("vale-hidden");
	}

	private showElement(el: HTMLElement): void {
		el.removeClass("vale-hidden");
	}
}
