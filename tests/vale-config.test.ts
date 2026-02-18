import { describe, test, expect, vi, beforeEach } from "vitest";
import { backupExistingConfig } from "../src/core/vale-config";
import path from "path";

vi.mock("fs/promises", () => ({
	copyFile: vi.fn(),
	readFile: vi.fn(),
}));

vi.mock("utils/error-utils", () => ({
	notifyError: vi.fn(),
}));

vi.mock("main", () => {
	const MockPlugin = vi.fn();
	return { default: MockPlugin };
});

vi.mock("./vale-ini-parser", () => ({
	parseValeIni: vi.fn(),
}));

import { copyFile } from "fs/promises";
import { notifyError } from "utils/error-utils";
import type ValePlugin from "../src/main";

function createMockPlugin(overrides: {
	valeConfigPathAbsolute?: string;
	valeConfigBackupDir?: string;
	getAvailablePathForAttachment?: (name: string) => Promise<string | null>;
}) {
	return {
		settings: {
			valeConfigPathAbsolute:
				overrides.valeConfigPathAbsolute ?? "/vault/.vale.ini",
			valeConfigBackupDir: overrides.valeConfigBackupDir ?? "",
		},
		app: {
			fileManager: {
				getAvailablePathForAttachment:
					overrides.getAvailablePathForAttachment ??
					vi.fn().mockResolvedValue("/vault/attachments"),
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
				"/vault/attachments/.vale_backup_2025-01-15T10-30-00-000Z.ini",
			);
		const plugin = createMockPlugin({
			valeConfigPathAbsolute: "/vault/.vale.ini",
			valeConfigBackupDir: "",
			getAvailablePathForAttachment,
		});

		await backupExistingConfig(plugin as ValePlugin);

		expect(getAvailablePathForAttachment).toHaveBeenCalled();
		expect(copyFile).toHaveBeenCalledWith(
			"/vault/.vale.ini",
			path.join(
				"/vault/attachments",
				".vale_backup_2025-01-15T10-30-00-000Z.ini",
			),
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
