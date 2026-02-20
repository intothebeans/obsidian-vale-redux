import {
	ValeConfig,
	ValeCheckOverride,
	ValeGlobalSection,
	ValeSyntaxSection,
} from "types";

const TOP_LEVEL_SCALAR_FIELDS = [
	"StylesPath",
	"WordTemplate",
	"NLPEndpoint",
] as const;
const TOP_LEVEL_ARRAY_FIELDS = [
	"Vocab",
	"Packages",
	"IgnoredScopes",
	"SkippedScopes",
	"IgnoredClasses",
] as const;
const SHARED_SECTION_ARRAY_FIELDS = [
	"BasedOnStyles",
	"BlockIgnores",
	"TokenIgnores",
] as const;

/**
 * Serializes a ValeConfig object into Vale-compatible INI format.
 */
export function serializeValeConfig(config: ValeConfig): string {
	const lines: string[] = [];

	pushTopLevelFields(lines, config);

	// [formats] section
	if (config.formats && Object.keys(config.formats).length > 0) {
		lines.push("", "[formats]");
		for (const [ext, fmt] of Object.entries(config.formats)) {
			lines.push(`${ext} = ${fmt}`);
		}
	}

	// [*] global section
	if (config["*"]) {
		lines.push("", "[*]");
		lines.push(...serializeSection(config["*"]));
	}

	// Syntax sections
	if (config.syntaxSections) {
		for (const [sectionName, section] of Object.entries(
			config.syntaxSections,
		)) {
			lines.push("", `[${sectionName}]`);
			lines.push(...serializeSection(section));
		}
	}

	return lines.join("\n");
}

function serializeSection(
	section: ValeGlobalSection | ValeSyntaxSection,
): string[] {
	const lines: string[] = [];

	pushArrayFields(lines, section, SHARED_SECTION_ARRAY_FIELDS);
	pushScalarField(lines, "Lang", section.Lang);

	// ValeSyntaxSection-only fields
	const syntaxSection = section as ValeSyntaxSection;
	if (syntaxSection.CommentDelimiters) {
		lines.push(
			`CommentDelimiters = ${syntaxSection.CommentDelimiters[0]} ${syntaxSection.CommentDelimiters[1]}`,
		);
	}
	if (syntaxSection.Blueprint) {
		lines.push(`Blueprint = ${syntaxSection.Blueprint}`);
	}
	if (syntaxSection.Transform) {
		lines.push(`Transform = ${syntaxSection.Transform}`);
	}

	// Check overrides: one line per override
	if (section.CheckOverrides?.length) {
		for (const override of section.CheckOverrides) {
			lines.push(serializeCheckOverride(override));
		}
	}

	return lines;
}

function serializeCheckOverride(override: ValeCheckOverride): string {
	if (override.Enabled === false) {
		return `${override.Check} = NO`;
	}
	if (override.Level) {
		return `${override.Check} = ${override.Level}`;
	}
	return "";
}

function pushTopLevelFields(lines: string[], config: ValeConfig): void {
	pushScalarFields(lines, config, TOP_LEVEL_SCALAR_FIELDS);

	if (config.MinAlertLevel !== undefined) {
		lines.push(`MinAlertLevel = ${config.MinAlertLevel}`);
	}

	pushArrayFields(lines, config, TOP_LEVEL_ARRAY_FIELDS);
}

function pushScalarFields<T extends object, K extends ReadonlyArray<keyof T>>(
	lines: string[],
	source: T,
	fields: K,
): void {
	for (const field of fields) {
		const value = source[field];
		if (value !== undefined) {
			lines.push(`${String(field)} = ${String(value)}`);
		}
	}
}

function pushArrayFields<T extends object, K extends ReadonlyArray<keyof T>>(
	lines: string[],
	source: T,
	fields: K,
): void {
	for (const field of fields) {
		const value = source[field];
		if (Array.isArray(value) && value.length > 0) {
			lines.push(`${String(field)} = ${value.join(", ")}`);
		}
	}
}

function pushScalarField(
	lines: string[],
	key: string,
	value: string | undefined,
): void {
	if (value) {
		lines.push(`${key} = ${value}`);
	}
}
