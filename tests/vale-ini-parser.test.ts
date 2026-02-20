import { expect, test } from "vitest";
import { parseValeIni } from "../src/core/ini/parser";
import { ValeConfig } from "../src/types/vale-types";

test("Parses simple key-value pairs", () => {
	const text = `key1 = value1 \n key2=value2 \nkey3 = "value with spaces" \nkey4='another value'`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		key1: "value1",
		key2: "value2",
		key3: "value with spaces",
		key4: "another value",
	});
});

test("Parse empty", () => {
	const text = ``;
	const result = parseValeIni(text);
	expect(result).toEqual({});
});

test("Omit comments and empty lines", () => {
	const text = `
# This is a comment
; Another comment

key1 = value1

key2 = value2
`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		key1: "value1",
		key2: "value2",
	});
});

test("Parse section with key-value pairs", () => {
	const text = `[formats]
key1 = value1
key2 = value2`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		formats: {
			key1: "value1",
			key2: "value2",
		},
	});
});

test("Parse invalid section", () => {
	const text = `[not a vale option]
	key=value`;
	const result = parseValeIni(text);
	expect(result).toEqual({});
});

test("Handle top level options", () => {
	const text = `StylesPath = somewhere/.styles`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		StylesPath: "somewhere/.styles",
	});
});

test("Handle duplicate keys", () => {
	const text = `IgnoredClasses=value1\nIgnoredClasses=value2\nIgnoredClasses=value3`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		IgnoredClasses: ["value1", "value2", "value3"],
	});
});

test("Handle duplicate keys in sections", () => {
	const text = `[*]\nIgnoredScopes=value1\nIgnoredScopes=value2\nIgnoredScopes=value3`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		"*": {
			IgnoredScopes: ["value1", "value2", "value3"],
		},
	});
});

test("Handle invalid lines", () => {
	const text = `key=value\ninvalid line\nanother invalid line\nkey2=value2`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		key: "value",
		key2: "value2",
	});
});

test("Handle quoted values with equals sign", () => {
	const text = `key="value=with=equals"`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		key: "value=with=equals",
	});
});

test("Handle sections with leading/trailing whitespace", () => {
	const text = `   [formats]   \nkey=value`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		formats: {
			key: "value",
		},
	});
});

test("Handle values with regex special characters", () => {
	const text = `key=^\\d{3}-\\d{2}-\\d{4}$`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		key: "^\\d{3}-\\d{2}-\\d{4}$",
	});
});

test("Handle regex with ini comment characters", () => {
	const text = `key=^\\d{3}-\\d{2}-\\d{4}#notacomment$`;
	const result = parseValeIni(text);
	expect(result).toEqual({
		key: "^\\d{3}-\\d{2}-\\d{4}#notacomment$",
	});
});

test("Parse syntax section", () => {
	const text = `[*.{md,mdx}]
	IgnoredScopes = something
	Vale.Spelling = NO`;
	const result: ValeConfig = parseValeIni(text);

	expect(result).toEqual({
		syntaxSections: {
			"*.{md,mdx}": {
				IgnoredScopes: "something",
				"Vale.Spelling": "NO",
			},
		},
	});
});

test("Parse global section with asterisk", () => {
	const text = `[*]
	BasedOnStyles = Vale, Microsoft
	MinAlertLevel = suggestion`;
	const result: ValeConfig = parseValeIni(text);

	expect(result).toEqual({
		"*": {
			BasedOnStyles: ["Vale", "Microsoft"],
			MinAlertLevel: "suggestion",
		},
	});
});

test("Parse syntax section with path containing slash", () => {
	const text = `[docs/guide/*.md]
	BasedOnStyles = Vale
	MinAlertLevel = warning`;
	const result: ValeConfig = parseValeIni(text);

	expect(result).toEqual({
		syntaxSections: {
			"docs/guide/*.md": {
				BasedOnStyles: ["Vale"],
				MinAlertLevel: "warning",
			},
		},
	});
});

test("Handle top-level array fields with single value", () => {
	const text = `Vocab = MyVocab
IgnoredScopes = code
SkippedScopes = script
Packages = pkg1`;
	const result: ValeConfig = parseValeIni(text);

	expect(result).toEqual({
		Vocab: ["MyVocab"],
		IgnoredScopes: ["code"],
		SkippedScopes: ["script"],
		Packages: ["pkg1"],
	});
});

test("Handle top-level array fields with comma-separated values", () => {
	const text = `Vocab = Vocab1, Vocab2, Vocab3`;
	const result: ValeConfig = parseValeIni(text);

	expect(result).toEqual({
		Vocab: ["Vocab1", "Vocab2", "Vocab3"],
	});
});

test("Handle section array fields - BasedOnStyles", () => {
	const text = `[*.md]
BasedOnStyles = Vale, proselint, write-good`;
	const result: ValeConfig = parseValeIni(text);

	expect(result.syntaxSections?.["*.md"]).toEqual({
		BasedOnStyles: ["Vale", "proselint", "write-good"],
	});
});

test("Handle section array fields - BlockIgnores", () => {
	const text = `[*]
BlockIgnores = (?s) *({< file [^>]* >}.*?{</ ?file >})`;
	const result: ValeConfig = parseValeIni(text);

	expect(result["*"]).toEqual({
		BlockIgnores: ["(?s) *({< file [^>]* >}.*?{</ ?file >})"],
	});
});

test("Handle section array fields - TokenIgnores", () => {
	const text = `[*.md]
TokenIgnores = pattern1, pattern2`;
	const result: ValeConfig = parseValeIni(text);

	expect(result.syntaxSections?.["*.md"]).toEqual({
		TokenIgnores: ["pattern1", "pattern2"],
	});
});

test("Handle section with already-array value from duplicates", () => {
	const text = `[*]
BasedOnStyles = Vale
BasedOnStyles = Microsoft
BasedOnStyles = Google`;
	const result: ValeConfig = parseValeIni(text);

	expect(result["*"]).toEqual({
		BasedOnStyles: ["Vale", "Microsoft", "Google"],
	});
});

test("Handle undefined/null values in sections", () => {
	const text = `[*]
SomeKey =
AnotherKey = value`;
	const result: ValeConfig = parseValeIni(text);

	// Empty values should still be preserved as empty strings
	expect(result["*"]).toEqual({
		SomeKey: "",
		AnotherKey: "value",
	});
});

test("Parse section with duplicate entries becoming array", () => {
	const text = `key1=first
key1=second`;
	const result = parseValeIni(text);

	expect(result).toEqual({
		key1: ["first", "second"],
	});
});

test("Handle non-syntax object sections", () => {
	const text = `[formats]
md = markdown
txt = text

[*.md]
BasedOnStyles = Vale

[some-other-section]
key = value`;
	const result: ValeConfig = parseValeIni(text);

	expect(result.formats).toEqual({
		md: "markdown",
		txt: "text",
	});
	expect(result.syntaxSections?.["*.md"]).toEqual({
		BasedOnStyles: ["Vale"],
	});
	// The other section should be ignored (continue case)
	expect(result).not.toHaveProperty("some-other-section");
});

test("Handle section declared multiple times", () => {
	const text = `[*.md]
key1 = value1

[*.md]
key2 = value2`;
	const result: ValeConfig = parseValeIni(text);

	expect(result.syntaxSections?.["*.md"]).toEqual({
		key1: "value1",
		key2: "value2",
	});
});

test("Handle array field with duplicate values", () => {
	const text = `[*.md]
BasedOnStyles = Vale
BasedOnStyles = Google
BasedOnStyles = Microsoft`;
	const result: ValeConfig = parseValeIni(text);

	expect(result.syntaxSections?.["*.md"]).toEqual({
		BasedOnStyles: ["Vale", "Google", "Microsoft"],
	});
});

test("Handle mixed quote styles", () => {
	const text = `key1 = "double quotes"
key2 = 'single quotes'
key3 = no quotes`;
	const result = parseValeIni(text);

	expect(result).toEqual({
		key1: "double quotes",
		key2: "single quotes",
		key3: "no quotes",
	});
});

test("Handle Packages as array field", () => {
	const text = `Packages = package1, package2, package3`;
	const result: ValeConfig = parseValeIni(text);

	expect(result).toEqual({
		Packages: ["package1", "package2", "package3"],
	});
});

test("Complex real-world example", () => {
	const text = `StylesPath = styles
MinAlertLevel = suggestion

[*]
BasedOnStyles = Vale, write-good
BlockIgnores = (?s) *({< file [^>]* >}.*?{</ ?file >})

[*.md]
BasedOnStyles = Vale, proselint

[docs/*.rst]
BasedOnStyles = Vale`;
	const result: ValeConfig = parseValeIni(text);

	expect(result.StylesPath).toBe("styles");
	expect(result.MinAlertLevel).toBe("suggestion");
	expect(result["*"]?.BasedOnStyles).toEqual(["Vale", "write-good"]);
	expect(result["*"]?.BlockIgnores).toEqual([
		"(?s) *({< file [^>]* >}.*?{</ ?file >})",
	]);
	expect(result.syntaxSections?.["*.md"]?.BasedOnStyles).toEqual([
		"Vale",
		"proselint",
	]);
	expect(result.syntaxSections?.["docs/*.rst"]?.BasedOnStyles).toEqual([
		"Vale",
	]);
});
