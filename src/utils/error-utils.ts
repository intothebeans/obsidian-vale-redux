import { Notice } from "obsidian";

export function notifyError(
	message: string,
	duration: number = 8000,
	devMessage?: string,
): void {
	console.error(
		`Error: ${message}`,
		devMessage ? `\nDetails: ${devMessage}` : "",
	);
	new Notice(`⚠️ Vale Error:\n${message}`, duration);
}
