/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Any typing allowed for generic data parsing, the data is validated and typed later */
import { ValeConfig } from "types";

export function parseValeIni(content: string): ValeConfig {
	// generic ini data being stored
	const config: any = {};
	let currentSection: string | null = null;

	const lines = content.split(/\r?\n/);

	if (lines) {
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i]!.trim();
			if (!line) {
				continue;
			}

			// Check for section headers
			const sectionMatch = line.match(/^\[([^\]]+)\]$/);
			if (sectionMatch) {
				currentSection = sectionMatch[1]!.trim();
				if (currentSection && !config[currentSection]) {
					config[currentSection] = {};
				}
				continue;
			}

			if (line.startsWith("#") || line.startsWith(";")) {
				continue;
			}

			// Parse key-value pairs
			const equalIndex = line.indexOf("=");
			if (equalIndex === -1) {
				continue;
			}

			const key = line.substring(0, equalIndex).trim();
			let value = line.substring(equalIndex + 1).trim();

			// Remove quotes if present
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.substring(1, value.length - 1);
			}

			const targetObj = currentSection ? config[currentSection] : config;

			// Handle duplicate keys by converting to arrays
			if (targetObj[key] !== undefined) {
				if (Array.isArray(targetObj[key])) {
					targetObj[key].push(value);
				} else {
					targetObj[key] = [targetObj[key], value];
				}
			} else {
				targetObj[key] = value;
			}
		}
	}

	return transformToValeConfig(config);
}

/**
 * Transform parsed INI data to match ValeConfig interface
 */
function transformToValeConfig(parsed: any): ValeConfig {
	const config: ValeConfig = {};

	for (const [key, value] of Object.entries(parsed)) {
		if (key === "formats") {
			config.formats = value as Record<string, string>;
		} else if (key === "*") {
			config["*"] = processSection(value);
		} else if (key.startsWith("*.") || key.includes("/")) {
			if (!config.syntaxSections) {
				config.syntaxSections = {};
			}
			config.syntaxSections[key] = processSection(value);
		} else if (typeof value === "object" && !Array.isArray(value)) {
			continue;
		} else {
			// Top-level config values
			(config as any)[key] = ensureArray(
				value,
				[
					"IgnoredScopes",
					"SkippedScopes",
					"IgnoredClasses",
					"Vocab",
					"Packages",
				].includes(key),
			);
		}
	}

	return config;
}

/**
 * Process a section (global or syntax) to match the expected structure
 */
function processSection(section: any): any {
	const processed: any = {};

	for (const [key, value] of Object.entries(section)) {
		const shouldBeArray = [
			"BasedOnStyles",
			"BlockIgnores",
			"TokenIgnores",
		].includes(key);
		processed[key] = ensureArray(value, shouldBeArray);
	}

	return processed;
}

/**
 * Ensure a value is an array if it should be
 */
function ensureArray(value: any, shouldBeArray: boolean): any {
	if (!shouldBeArray) {
		return value;
	}

	if (Array.isArray(value)) {
		return value;
	}

	if (value === undefined || value === null) {
		return undefined;
	}

	if (typeof value === "string" && value.includes(",")) {
		return value.split(",").map((v) => v.trim());
	}

	return [value];
}
