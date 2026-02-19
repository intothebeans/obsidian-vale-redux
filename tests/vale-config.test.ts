import { describe, test, expect, vi, beforeEach } from "vitest";
import { backupExistingConfig, rotateBackups } from "../src/core/vale-config";
import path from "path";
import { TFile } from "./__mocks__/obsidian";

vi.mock("fs/promises", () => ({
	copyFile: vi.fn(),
	readFile: vi.fn(),
}));

vi.mock("main", () => {
	const MockPlugin = vi.fn();
	return { default: MockPlugin };
});

vi.mock("./vale-ini-parser", () => ({
	parseValeIni: vi.fn(),
}));

vi.mock("../src/utils/file-utils", () => ({
	ensureAbsolutePath: vi.fn((attachmentPath: string) => {
		if (attachmentPath.startsWith("/")) {
			return attachmentPath;
		}
		return `/vault/${attachmentPath}`;
	}),
}));

import { copyFile } from "fs/promises";
import type ValePlugin from "../src/main";
import { TFolder } from "obsidian";

function createMockPlugin(overrides: {
	debounceSettingsSave?: () => void;
	valeConfigPathAbsolute?: string;
	valeConfigBackupDir?: string;
	valeConfigBackupsToKeep?: number;
	backupPaths?: string[];
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
		});

		await backupExistingConfig(plugin as ValePlugin);

		expect(copyFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			path.join(
				"/vault/backups",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
			),
		);
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
		});

		await backupExistingConfig(plugin as ValePlugin);

		expect(getAvailablePathForAttachment).toHaveBeenCalled();
		expect(copyFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			"/vault/attachments/.vale_backup_2025-01-15T10-30-00-000Z.ini",
		);
	});

	test("throws error when attachment directory cannot be determined", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupDir: "",
			getAvailablePathForAttachment: vi.fn().mockResolvedValue(null),
		});

		await expect(
			backupExistingConfig(plugin as ValePlugin),
		).rejects.toThrow(
			"Failed to determine backup directory for Vale config. Please set a backup directory in the plugin settings.",
		);
		expect(copyFile).not.toHaveBeenCalled();
	});

	test("throws error when getAvailablePathForAttachment returns empty string", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupDir: "",
			getAvailablePathForAttachment: vi.fn().mockResolvedValue(""),
		});

		await expect(
			backupExistingConfig(plugin as ValePlugin),
		).rejects.toThrow(
			"Failed to determine backup directory for Vale config. Please set a backup directory in the plugin settings.",
		);
		expect(copyFile).not.toHaveBeenCalled();
	});

	test("generates backup name from config filename", async () => {
		const plugin = createMockPlugin({
			valeConfigPathAbsolute: "/some/path/my-config.ini",
			valeConfigBackupDir: "/backups",
		});

		await backupExistingConfig(plugin as ValePlugin);

		expect(copyFile).toHaveBeenCalledWith(
			"/some/path/my-config.ini",
			path.join(
				"/backups",
				"my-config_backup_2025-01-15T10-30-00-000Z.ini",
			),
		);
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
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
				".vale_backup_2025-01-14T10-30-00-000Z.ini",
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
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
				".vale_backup_2025-01-14T10-30-00-000Z.ini",
				".vale_backup_2025-01-13T10-30-00-000Z.ini",
			],
			trashFile,
			getAbstractFileByPath,
		}) as ValePlugin;

		await rotateBackups(plugin);

		expect(trashFile).toHaveBeenCalledTimes(1);
		expect(getAbstractFileByPath).toHaveBeenCalledWith(
			".vale_backup_2025-01-13T10-30-00-000Z.ini",
		);
	});

	test("skips trashing files that do not exist", async () => {
		const trashFile = vi.fn().mockResolvedValue(undefined);
		const getAbstractFileByPath = vi.fn().mockReturnValue(null);
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
				".vale_backup_2025-01-14T10-30-00-000Z.ini",
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
				".vale_backup_2025-01-13T10-30-00-000Z.ini",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
				".vale_backup_2025-01-14T10-30-00-000Z.ini",
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

	test("throws error for invalid backup filename format", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				"invalid_backup_name.ini",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
			],
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).rejects.toThrow(
			"Invalid backup timestamp format: invalid_backup_name.ini",
		);
	});

	test("throws error for backup with missing timestamp", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				".vale_backup_.ini",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
			],
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).rejects.toThrow(
			"Invalid backup filename format: .vale_backup_.ini",
		);
	});

	test("throws error for backup with invalid date format", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				".vale_backup_not-a-date.ini",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
			],
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).rejects.toThrow(
			"Invalid backup timestamp format: .vale_backup_not-a-date.ini",
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
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
				".vale_backup_2025-01-14T10-30-00-000Z.ini",
				".vale_backup_2025-01-13T10-30-00-000Z.ini",
				".vale_backup_2025-01-12T10-30-00-000Z.ini",
				".vale_backup_2025-01-11T10-30-00-000Z.ini",
			],
			getAbstractFileByPath,
			trashFile,
		}) as ValePlugin;

		await rotateBackups(plugin);

		expect(trashFile).toHaveBeenCalledTimes(3);
	});

	test("invalid filename format", async () => {
		const plugin = createMockPlugin({
			valeConfigBackupsToKeep: 1,
			backupPaths: [
				"invalid_backup_name_tokens.ini",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
			],
		}) as ValePlugin;

		await expect(rotateBackups(plugin)).rejects.toThrow(
			"Invalid backup filename format: invalid_backup_name_tokens.ini",
		);
	});
});
