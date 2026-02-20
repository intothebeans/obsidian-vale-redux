import { describe, test, expect, vi, beforeEach } from "vitest";
import {
	backupExistingConfig,
	getExistingConfigOptions,
	rotateBackups,
	writeConfigToFile,
} from "../src/core/vale-config";
import path from "path";
import { TFile } from "./__mocks__/obsidian";

vi.mock("fs/promises", () => ({
	copyFile: vi.fn(),
	readFile: vi.fn(),
	writeFile: vi.fn(),
}));

vi.mock("main", () => {
	const MockPlugin = vi.fn();
	return { default: MockPlugin };
});

vi.mock("../src/core/ini/parser", () => ({
	parseValeIni: vi.fn(),
}));

vi.mock("../src/core/ini/writer", () => ({
	serializeValeConfig: vi.fn(),
}));

vi.mock("../src/utils/error-utils", () => ({
	notifyError: vi.fn(),
}));

vi.mock("../src/utils/file-utils", () => ({
	ensureAbsolutePath: vi.fn((attachmentPath: string) => {
		if (attachmentPath.startsWith("/")) {
			return attachmentPath;
		}
		return `/vault/${attachmentPath}`;
	}),
}));

import { copyFile, readFile, writeFile } from "fs/promises";
import type ValePlugin from "../src/main";
import { TFolder } from "obsidian";
import { parseValeIni } from "../src/core/ini/parser";
import { serializeValeConfig } from "../src/core/ini/writer";
import { notifyError } from "../src/utils/error-utils";

function createMockPlugin(overrides: {
	debounceSettingsSave?: () => void;
	valeConfigPathAbsolute?: string;
	valeConfigBackupDir?: string;
	valeConfigBackupsToKeep?: number;
	backupPaths?: { ts: string; path: string }[];
	getAvailablePathForAttachment?: (name: string) => Promise<string | null>;
	getAbstractFileByPath?: (
		path: string,
	) => { file: typeof TFile | typeof TFolder | null } | null;
	trashFile?: (file: typeof TFile) => Promise<void>;
	getRoot?: () => { path: string };
}) {
	return {
		debounceSettingsSave: vi.fn(),
		settings: {
			valeConfigPathAbsolute:
				overrides.valeConfigPathAbsolute ?? "/vault/.vale.ini",
			valeConfigBackupDir: overrides.valeConfigBackupDir ?? "",
			valeConfigBackupsToKeep: overrides.valeConfigBackupsToKeep ?? 5,
			backupPaths: overrides.backupPaths ?? [],
		},
		app: {
			fileManager: {
				getAvailablePathForAttachment:
					overrides.getAvailablePathForAttachment ??
					vi.fn().mockResolvedValue("/vault/attachments"),
				trashFile:
					overrides.trashFile ?? vi.fn().mockResolvedValue(undefined),
			},
			vault: {
				getRoot:
					overrides.getRoot ??
					vi.fn().mockReturnValue({ path: "/vault" }),
				getAbstractFileByPath:
					overrides.getAbstractFileByPath ??
					vi.fn().mockReturnValue(null),
			},
		},
	} as unknown;
}

describe("backupExistingConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-01-15T10:30:00.000Z"));
	});

	test("copies config to the specified backup directory", async () => {
		const plugin = createMockPlugin({
			valeConfigPathAbsolute: "/vault/.vale.ini",
			valeConfigBackupDir: "/vault/backups",
		}) as ValePlugin;

		await backupExistingConfig(plugin);

		expect(copyFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			path.join(
				"/vault/backups",
				"vale_config_backup_2025-01-15T10-30-00-000Z",
			),
		);
		expect(plugin.debounceSettingsSave).toHaveBeenCalledTimes(1);
		expect(plugin.settings.backupPaths).toContainEqual({
			ts: "2025-01-15T10:30:00.000Z",
			path: "/vault/backups/vale_config_backup_2025-01-15T10-30-00-000Z",
		});
	});

	test("uses attachment directory when backup dir is empty", async () => {
		const getAvailablePathForAttachment = vi
			.fn()
			.mockResolvedValue(
				"attachments/.vale_backup_2025-01-15T10-30-00-000Z.ini",
			);
		const getAbstractFileByPath = vi.fn().mockReturnValue(new TFile());
		const plugin = createMockPlugin({
			valeConfigPathAbsolute: "/vault/.vale.ini",
			valeConfigBackupDir: "",
			getAvailablePathForAttachment,
			getAbstractFileByPath,
		}) as ValePlugin;

		await backupExistingConfig(plugin);

		expect(getAvailablePathForAttachment).toHaveBeenCalled();
		expect(copyFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			"/vault/attachments/.vale_backup_2025-01-15T10-30-00-000Z.ini",
		);
		expect(plugin.settings.backupPaths).toContainEqual({
			ts: "2025-01-15T10:30:00.000Z",
			path: "attachments/.vale_backup_2025-01-15T10-30-00-000Z.ini",
		});
		expect(plugin.debounceSettingsSave).toHaveBeenCalledTimes(1);
	});

	test("stores resolved attachment path when available attachment differs from requested file name", async () => {
		const getAvailablePathForAttachment = vi
			.fn()
			.mockResolvedValue(
				"attachments/.vale_backup_2025-01-15T10-30-00-000Z 1.ini",
			);
		const plugin = createMockPlugin({
			valeConfigPathAbsolute: "/vault/.vale.ini",
			valeConfigBackupDir: "",
			getAvailablePathForAttachment,
		}) as ValePlugin;

		await backupExistingConfig(plugin);

		expect(copyFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			"/vault/attachments/.vale_backup_2025-01-15T10-30-00-000Z 1.ini",
		);
		expect(plugin.settings.backupPaths).toContainEqual({
			ts: "2025-01-15T10:30:00.000Z",
			path: "attachments/.vale_backup_2025-01-15T10-30-00-000Z 1.ini",
		});
	});

	test("throws error when attachment directory cannot be determined", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupDir: "",
			getAvailablePathForAttachment: vi.fn().mockResolvedValue(null),
		}) as ValePlugin;

		await expect(backupExistingConfig(plugin)).rejects.toThrow(
			"Failed to determine backup directory for Vale config. Please set a backup directory in the plugin settings.",
		);
		expect(copyFile).not.toHaveBeenCalled();
		expect(plugin.debounceSettingsSave).not.toHaveBeenCalled();
	});

	test("throws error when getAvailablePathForAttachment returns empty string", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupDir: "",
			getAvailablePathForAttachment: vi.fn().mockResolvedValue(""),
		}) as ValePlugin;

		await expect(backupExistingConfig(plugin)).rejects.toThrow(
			"Failed to determine backup directory for Vale config. Please set a backup directory in the plugin settings.",
		);
		expect(copyFile).not.toHaveBeenCalled();
		expect(plugin.debounceSettingsSave).not.toHaveBeenCalled();
	});
});

describe("rotateBackups", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-01-15T10:30:00.000Z"));
	});
	test("returns early when backup count is within limit", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 5,
			backupPaths: [
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-14T10:30:00.000Z",
					path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
				},
			],
			trashFile,
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).resolves.not.toThrow();
		expect(trashFile).not.toHaveBeenCalled();
	});

	test("deletes oldest backups when exceeding max backups", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		// return a real mocked TFile instance so `instanceof TFile` passes
		const getAbstractFileByPath = vi.fn().mockReturnValue(new TFile());
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 2,
			backupPaths: [
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-14T10:30:00.000Z",
					path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-13T10:30:00.000Z",
					path: ".vale_backup_2025-01-13T10-30-00-000Z.ini",
				},
			],
			trashFile,
			getAbstractFileByPath,
		}) as ValePlugin;

		await rotateBackups(plugin);

		expect(trashFile).toHaveBeenCalledTimes(1);
		expect(getAbstractFileByPath).toHaveBeenCalledWith(
			".vale_backup_2025-01-13T10-30-00-000Z.ini",
		);
		expect(plugin.settings.backupPaths).toEqual([
			{
				ts: "2025-01-15T10:30:00.000Z",
				path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
			},
			{
				ts: "2025-01-14T10:30:00.000Z",
				path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
			},
		]);
		expect(plugin.debounceSettingsSave).toHaveBeenCalledTimes(1);
	});

	test("skips trashing files that do not exist", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		const getAbstractFileByPath = vi.fn().mockReturnValue(null);
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-14T10:30:00.000Z",
					path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
				},
			],
			getAbstractFileByPath,
			trashFile,
		}) as ValePlugin;

		await rotateBackups(plugin);

		expect(trashFile).not.toHaveBeenCalled();
	});

	test("sorts backups by timestamp in descending order", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		const getAbstractFileByPath = vi
			.fn()
			.mockImplementation(() => new TFile());
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				{
					ts: "2025-01-13T10:30:00.000Z",
					path: ".vale_backup_2025-01-13T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-14T10:30:00.000Z",
					path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
				},
			],
			getAbstractFileByPath,
			trashFile,
		}) as ValePlugin;

		await rotateBackups(plugin);

		expect(trashFile).toHaveBeenCalledTimes(2);
		expect(getAbstractFileByPath).toHaveBeenCalledWith(
			".vale_backup_2025-01-14T10-30-00-000Z.ini",
		);
		expect(getAbstractFileByPath).toHaveBeenCalledWith(
			".vale_backup_2025-01-13T10-30-00-000Z.ini",
		);
	});

	test("handles empty backup paths array", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 5,
			backupPaths: [],
			trashFile,
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).resolves.not.toThrow();
		expect(trashFile).not.toHaveBeenCalled();
	});

	test("throws error for missing file name", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				{
					ts: "2025-01-14T10:30:00.000Z",
					path: "",
				},
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
			],
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).rejects.toThrow(
			`Invalid backup entry: {"ts":"2025-01-14T10:30:00.000Z","path":""}. Each backup must have a timestamp and path.`,
		);
	});

	test("throws error for backup with missing timestamp", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				{
					ts: "",
					path: ".vale_backup_.ini",
				},
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
			],
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).rejects.toThrow(
			`Invalid backup entry: {"ts":"","path":".vale_backup_.ini"}. Each backup must have a timestamp and path.`,
		);
	});

	test("deletes multiple oldest backups when exceeding limit by more than one", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		const getAbstractFileByPath = vi
			.fn()
			.mockImplementation(() => new TFile());
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 2,
			backupPaths: [
				{
					ts: "2025-01-15T10:30:00.000Z",
					path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-14T10:30:00.000Z",
					path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-13T10:30:00.000Z",
					path: ".vale_backup_2025-01-13T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-12T10:30:00.000Z",
					path: ".vale_backup_2025-01-12T10-30-00-000Z.ini",
				},
				{
					ts: "2025-01-11T10:30:00.000Z",
					path: ".vale_backup_2025-01-11T10-30-00-000Z.ini",
				},
			],
			getAbstractFileByPath,
			trashFile,
		}) as ValePlugin;

		await rotateBackups(plugin);

		expect(trashFile).toHaveBeenCalledTimes(3);
		expect(plugin.settings.backupPaths).toEqual([
			{
				ts: "2025-01-15T10:30:00.000Z",
				path: ".vale_backup_2025-01-15T10-30-00-000Z.ini",
			},
			{
				ts: "2025-01-14T10:30:00.000Z",
				path: ".vale_backup_2025-01-14T10-30-00-000Z.ini",
			},
		]);
		expect(plugin.debounceSettingsSave).toHaveBeenCalledTimes(1);
	});
});

describe("getExistingConfigOptions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("returns parsed config when file is readable and valid", async () => {
		vi.mocked(readFile).mockResolvedValue("MinAlertLevel = warning");
		vi.mocked(parseValeIni).mockReturnValue({
			MinAlertLevel: "warning",
		});

		const result = await getExistingConfigOptions("/vault/.vale.ini");

		expect(readFile).toHaveBeenCalledWith("/vault/.vale.ini", "utf-8");
		expect(parseValeIni).toHaveBeenCalledWith("MinAlertLevel = warning");
		expect(result).toEqual({ MinAlertLevel: "warning" });
		expect(notifyError).not.toHaveBeenCalled();
	});

	test("returns undefined and notifies when file read fails", async () => {
		vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));

		const result = await getExistingConfigOptions("/vault/.vale.ini");

		expect(result).toBeUndefined();
		expect(parseValeIni).not.toHaveBeenCalled();
		expect(notifyError).toHaveBeenCalledWith(
			"Failed to read Vale config file: ENOENT",
		);
	});

	test("returns undefined and notifies when parse fails", async () => {
		vi.mocked(readFile).mockResolvedValue("invalid-content");
		vi.mocked(parseValeIni).mockImplementation(() => {
			throw new Error("invalid format");
		});

		const result = await getExistingConfigOptions("/vault/.vale.ini");

		expect(result).toBeUndefined();
		expect(notifyError).toHaveBeenCalledWith(
			"Failed to parse Vale config file: invalid format",
		);
	});
});

describe("writeConfigToFile", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("serializes config and writes to disk", async () => {
		vi.mocked(serializeValeConfig).mockReturnValue(
			"MinAlertLevel = warning",
		);

		await writeConfigToFile("/vault/.vale.ini", {
			MinAlertLevel: "warning",
		});

		expect(serializeValeConfig).toHaveBeenCalledWith({
			MinAlertLevel: "warning",
		});
		expect(writeFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			"MinAlertLevel = warning",
			"utf-8",
		);
	});
});
