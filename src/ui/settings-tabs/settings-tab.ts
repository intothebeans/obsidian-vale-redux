import ValePlugin from "main";
import { Setting, setIcon } from "obsidian";

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
		this.navButton = navEl.createDiv({ cls: "vale-navigation-item" });

		this.navButton.createSpan().setText(name);
		if (icon) {
			setIcon(this.navButton, icon);
		}

		this.contentEl = settingsEl.createDiv({ cls: "vale-tab-settings" });
		this.contentEl.id = name.toLowerCase().replace(" ", "-");

		this.headingEl = new Setting(this.contentEl)
			.setName(name)
			.setHeading().nameEl;
		this.hideElement(this.headingEl);
	}

	abstract display(): void;

	updateTabDisplayMode(isSelected: boolean): void {
		if (isSelected) {
			this.navButton.addClass("selected");
			this.showElement(this.headingEl);
			this.showElement(this.contentEl);
		} else {
			this.navButton.removeClass("selected");
			this.hideElement(this.headingEl);
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
