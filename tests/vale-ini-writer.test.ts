import { expect, test } from "vitest";
import { serializeValeConfig } from "../src/core/ini/writer";
import { parseValeIni } from "../src/core/ini/parser";
import { ValeConfig } from "../src/types/vale-types";

test("Serialize empty config", () => {
	const result = serializeValeConfig({});
	expect(result).toBe("");
});

test("Serialize top-level scalar fields", () => {
	const config: ValeConfig = {
		StylesPath: ".vale/styles",
		MinAlertLevel: 1,
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("StylesPath = .vale/styles");
	expect(result).toContain("MinAlertLevel = suggestion");
});

test("Serialize MinAlertLevel numbers to strings", () => {
	expect(serializeValeConfig({ MinAlertLevel: 1 })).toContain(
		"MinAlertLevel = suggestion",
	);
	expect(serializeValeConfig({ MinAlertLevel: 2 })).toContain(
		"MinAlertLevel = warning",
	);
	expect(serializeValeConfig({ MinAlertLevel: 3 })).toContain(
		"MinAlertLevel = error",
	);
});

test("Serialize top-level array fields as comma-separated", () => {
	const config: ValeConfig = {
		Vocab: ["Base", "Custom"],
		Packages: ["Microsoft", "write-good"],
		IgnoredScopes: ["code", "math"],
		SkippedScopes: ["script"],
		IgnoredClasses: ["no-vale"],
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("Vocab = Base, Custom");
	expect(result).toContain("Packages = Microsoft, write-good");
	expect(result).toContain("IgnoredScopes = code, math");
	expect(result).toContain("SkippedScopes = script");
	expect(result).toContain("IgnoredClasses = no-vale");
});

test("Serialize formats section", () => {
	const config: ValeConfig = {
		formats: { mdx: "md", txt: "rst" },
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("[formats]");
	expect(result).toContain("mdx = md");
	expect(result).toContain("txt = rst");
});

test("Serialize global [*] section", () => {
	const config: ValeConfig = {
		"*": {
			BasedOnStyles: ["Vale", "Microsoft"],
			BlockIgnores: ["(?s) *({{.*?}})"],
			TokenIgnores: ["pattern1", "pattern2"],
			Lang: "en",
		},
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("[*]");
	expect(result).toContain("BasedOnStyles = Vale, Microsoft");
	expect(result).toContain("BlockIgnores = (?s) *({{.*?}})");
	expect(result).toContain("TokenIgnores = pattern1, pattern2");
	expect(result).toContain("Lang = en");
});

test("Serialize syntax sections", () => {
	const config: ValeConfig = {
		syntaxSections: {
			"*.md": { BasedOnStyles: ["Vale"] },
			"docs/*.rst": { BasedOnStyles: ["Vale", "proselint"] },
		},
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("[*.md]");
	expect(result).toContain("[docs/*.rst]");
	expect(result).toContain("BasedOnStyles = Vale, proselint");
});

test("Serialize CheckOverrides with Enabled false", () => {
	const config: ValeConfig = {
		syntaxSections: {
			"*.md": {
				CheckOverrides: [{ Check: "Vale.Spelling", Enabled: false }],
			},
		},
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("Vale.Spelling = NO");
});

test("Serialize CheckOverrides with Level", () => {
	const config: ValeConfig = {
		"*": {
			CheckOverrides: [{ Check: "Vale.Hedging", Level: "warning" }],
		},
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("Vale.Hedging = warning");
});

test("Serialize CommentDelimiters", () => {
	const config: ValeConfig = {
		syntaxSections: {
			"*.py": { CommentDelimiters: ["#", ""] },
		},
	};
	const result = serializeValeConfig(config);
	expect(result).toContain("CommentDelimiters = # ");
});

test("Serialize section order: scalars, formats, global, syntax", () => {
	const config: ValeConfig = {
		StylesPath: "styles",
		formats: { mdx: "md" },
		"*": { BasedOnStyles: ["Vale"] },
		syntaxSections: { "*.md": { BasedOnStyles: ["Vale", "write-good"] } },
	};
	const result = serializeValeConfig(config);
	const stylesIdx = result.indexOf("StylesPath");
	const formatsIdx = result.indexOf("[formats]");
	const globalIdx = result.indexOf("[*]");
	const syntaxIdx = result.indexOf("[*.md]");
	expect(stylesIdx).toBeLessThan(formatsIdx);
	expect(formatsIdx).toBeLessThan(globalIdx);
	expect(globalIdx).toBeLessThan(syntaxIdx);
});

test("Omit undefined/empty optional fields", () => {
	const config: ValeConfig = {
		StylesPath: "styles",
		Vocab: [],
	};
	const result = serializeValeConfig(config);
	expect(result).not.toContain("Vocab");
	expect(result).not.toContain("[*]");
	expect(result).not.toContain("[formats]");
});

test("Round-trip: serialize then parse produces equivalent config", () => {
	const original: ValeConfig = {
		StylesPath: "styles",
		MinAlertLevel: 1,
		Packages: ["Microsoft", "write-good"],
		Vocab: ["Base"],
		formats: { mdx: "md" },
		"*": {
			BasedOnStyles: ["Vale", "write-good"],
			BlockIgnores: ["(?s) *({< file [^>]* >}.*?{</ ?file >})"],
		},
		syntaxSections: {
			"*.md": { BasedOnStyles: ["Vale", "proselint"] },
			"docs/*.rst": { BasedOnStyles: ["Vale"] },
		},
	};

	const serialized = serializeValeConfig(original);
	const reparsed = parseValeIni(serialized);

	expect(reparsed.StylesPath).toBe(original.StylesPath);
	expect(reparsed.MinAlertLevel).toBe("suggestion");
	expect(reparsed.Packages).toEqual(original.Packages);
	expect(reparsed.Vocab).toEqual(original.Vocab);
	expect(reparsed.formats).toEqual(original.formats);
	expect(reparsed["*"]?.BasedOnStyles).toEqual(original["*"]?.BasedOnStyles);
	expect(reparsed["*"]?.BlockIgnores).toEqual(original["*"]?.BlockIgnores);
	expect(reparsed.syntaxSections?.["*.md"]?.BasedOnStyles).toEqual(
		original.syntaxSections?.["*.md"]?.BasedOnStyles,
	);
	expect(reparsed.syntaxSections?.["docs/*.rst"]?.BasedOnStyles).toEqual(
		original.syntaxSections?.["docs/*.rst"]?.BasedOnStyles,
	);
});
