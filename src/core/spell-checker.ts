/**
 * Get spelling suggestions from the system dictionary
 * Uses Electron's spell checker via the webFrame API
 * @author ChrisChinchilla
 */

const dictionarySuggestionsCache = new Map<string, string[]>();

export async function getSpellingSuggestions(word: string): Promise<string[]> {
	// Check cache first
	const cached = dictionarySuggestionsCache.get(word);
	if (cached !== undefined) {
		return cached;
	}

	try {
		// Access Electron's spell checker through the webFrame API if available
		if (window.require) {
			const electron = window.require("electron") as {
				webFrame?: {
					getWordSuggestions?: (word: string) => string[];
				};
			};
			if (electron.webFrame?.getWordSuggestions) {
				const suggestions = electron.webFrame.getWordSuggestions(word);
				dictionarySuggestionsCache.set(word, suggestions);
				return suggestions;
			}
		}
	} catch (e) {
		console.error("Failed to get spelling suggestions:", e);
	}

	dictionarySuggestionsCache.set(word, []);
	return [];
}
