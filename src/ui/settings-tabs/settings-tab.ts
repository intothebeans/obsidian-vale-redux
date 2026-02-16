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

		if (icon) {
			setIcon(
				this.navButton.createSpan({ cls: "vale-settings-tab-icon" }),
				icon,
			);
		}
		this.navButton.createSpan({ text: name, title: name });

		this.contentEl = settingsEl.createDiv({ cls: "vale-tab-settings" });
		this.contentEl.id = name.toLowerCase().replace(" ", "-");
	}

	abstract display(): void;

	updateTabDisplayMode(isSelected: boolean): void {
		if (isSelected) {
			this.navButton.addClass("selected");
			this.showElement(this.contentEl);
		} else {
			this.navButton.removeClass("selected");
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
