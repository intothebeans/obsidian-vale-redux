/**
 * Standard exit code checker - only returnCode 0 is success.
 * Use this for Vale commands that should always succeed (like --version, ls-config).
 */
export function returnCodeFail(
	returnCode: number,
	_stdout: string,
	stderr: string,
): {
	status: boolean;
	message: string;
} {
	if (returnCode === 0) {
		return { status: true, message: "Vale connection successful" };
	} else {
		return {
			status: false,
			message: `Vale process exited with code ${returnCode}${stderr ? `\n${stderr}` : ""}`,
		};
	}
}

/**
 * Vale linting exit code checker - allows non-zero exit codes if stdout has content.
 * Vale returns exit code 1 when it finds linting issues, but this is not a failure.
 * Only treat it as a failure if there's no stdout (meaning Vale couldn't run).
 */
export function valeLintExitHandler(
	returnCode: number,
	stdout: string,
	stderr: string,
): {
	status: boolean;
	message: string;
} {
	if (stdout.trim().length === 0) {
		return {
			status: false,
			message: `Vale exited with code ${returnCode}${stderr ? `: ${stderr}` : " (no output)"}`,
		};
	}
	return { status: true, message: "Vale executed successfully" };
}
