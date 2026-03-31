#!/usr/bin/env node

/**
 * @packageDocumentation
 * CLI entrypoint for validating the repository's Docusaurus site contract.
 */

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
    formatDocusaurusSiteContractViolations,
    validateDocusaurusSiteContract,
} from "./index.mjs";
import { runInitCommand } from "./init.mjs";

const defaultContractPath = "docs/docusaurus/site-contract.config.mjs";

/**
 * Print CLI usage guidance.
 */
const printHelp = () => {
    console.log(
        [
            "Validate a Docusaurus site contract.",
            "",
            "Usage:",
            "  docusaurus-site-contract [options]",
            "  docusaurus-site-contract init [options]",
            "",
            "Options:",
            `  --config <path>  Contract module path relative to --root. Default: ${defaultContractPath}`,
            "  --root <path>    Repository root to validate. Default: current working directory.",
            "  --dry-run        Preview init changes without writing files.",
            "  --force          Overwrite generated init files when they already exist.",
            "  --json           Emit a machine-readable JSON report.",
            "  --skip-docs-guide  Do not generate the maintainer guide markdown file during init.",
            "  --skip-docs-registration  Do not patch sidebars.ts or developer index docs during init.",
            "  --skip-vendor-package  Assume the package is already vendored locally or installed via npm and do not copy it into the target repo during init.",
            "  -h, --help       Show this help text and exit.",
        ].join("\n")
    );
};

/**
 * Convert an unknown thrown value into a stable error message.
 *
 * @param {unknown} error
 *
 * @returns {string}
 */
const toErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
};

/**
 * Emit a validation result in either JSON or human-readable form.
 *
 * @param {Readonly<{
 *     contractPath: string;
 *     rootDirectoryPath: string;
 *     useJsonOutput: boolean;
 *     violations: readonly import("./index.mjs").ContractViolation[];
 * }>} report
 */
const printValidationReport = ({
    contractPath,
    rootDirectoryPath,
    useJsonOutput,
    violations,
}) => {
    if (useJsonOutput) {
        console.log(
            JSON.stringify(
                {
                    contractPath,
                    ok: violations.length === 0,
                    rootDirectoryPath,
                    violationCount: violations.length,
                    violations,
                },
                null,
                2
            )
        );
        return;
    }

    console.log(
        formatDocusaurusSiteContractViolations(violations, rootDirectoryPath)
    );
};

/**
 * Emit a CLI error in either JSON or human-readable form.
 *
 * @param {Readonly<{
 *     contractPath: string;
 *     rootDirectoryPath: string;
 *     errorMessage: string;
 *     useJsonOutput: boolean;
 * }>} errorReport
 */
const printValidationError = ({
    contractPath,
    errorMessage,
    rootDirectoryPath,
    useJsonOutput,
}) => {
    if (useJsonOutput) {
        console.error(
            JSON.stringify(
                {
                    contractPath,
                    error: errorMessage,
                    ok: false,
                    rootDirectoryPath,
                    violationCount: 0,
                    violations: [],
                },
                null,
                2
            )
        );
        return;
    }

    console.error(
        `❌ Failed to validate Docusaurus site contract: ${errorMessage}`
    );
};

/**
 * Execute the CLI.
 *
 * @param {readonly string[]} argv
 */
const runCli = async (argv = process.argv.slice(2)) => {
    const subcommand = argv[0]?.startsWith("-") ? undefined : argv[0];
    const commandArguments = subcommand === undefined ? argv : argv.slice(1);
    const showHelp = argv.includes("--help") || argv.includes("-h");
    const useJsonOutput = argv.includes("--json");
    /**
     * @param {string} flagName
     *
     * @returns {string | undefined}
     */
    const readCliFlagValue = (flagName) => {
        const equalsPrefix = `${flagName}=`;
        const equalsArgument = commandArguments.find((argument) =>
            argument.startsWith(equalsPrefix)
        );

        if (equalsArgument !== undefined) {
            return equalsArgument.slice(equalsPrefix.length);
        }

        const flagIndex = commandArguments.indexOf(flagName);

        if (flagIndex === -1) {
            return undefined;
        }

        return commandArguments[flagIndex + 1];
    };

    if (showHelp) {
        printHelp();
        return;
    }

    if (subcommand === "init") {
        const requestedRootDirectoryPath =
            readCliFlagValue("--root") ?? process.cwd();
        const dryRun = commandArguments.includes("--dry-run");
        const actions = await runInitCommand({
            dryRun,
            force: commandArguments.includes("--force"),
            packageName: readCliFlagValue("--package-name"),
            repoName: readCliFlagValue("--repo"),
            repositoryOwner: readCliFlagValue("--owner"),
            rootDirectoryPath: requestedRootDirectoryPath,
            skipDocsGuide: commandArguments.includes("--skip-docs-guide"),
            skipDocsRegistration: commandArguments.includes(
                "--skip-docs-registration"
            ),
            skipVendorPackage: commandArguments.includes(
                "--skip-vendor-package"
            ),
        });

        if (useJsonOutput) {
            console.log(
                JSON.stringify(
                    {
                        actionCount: actions.length,
                        actions,
                        dryRun,
                        ok: true,
                        rootDirectoryPath: requestedRootDirectoryPath,
                        subcommand: "init",
                    },
                    null,
                    2
                )
            );
            return;
        }

        console.log(
            dryRun
                ? "✅ Docusaurus site contract dry-run complete."
                : "✅ Docusaurus site contract bootstrap complete."
        );

        if (actions.length === 0) {
            console.log(
                dryRun ? "No changes would be made." : "No files changed."
            );
            return;
        }

        for (const action of actions) {
            console.log(`- ${action.action}: ${action.path}`);
        }

        return;
    }

    const requestedRootDirectoryPath =
        readCliFlagValue("--root") ?? process.cwd();
    const requestedContractPath =
        readCliFlagValue("--config") ?? defaultContractPath;
    const absoluteContractPath = resolve(
        requestedRootDirectoryPath,
        requestedContractPath
    );

    try {
        const contractModuleSpecifier =
            pathToFileURL(absoluteContractPath).href;
        const contractModule =
            // eslint-disable-next-line no-unsanitized/method -- Controlled local file path resolved from --config/--root for repository tooling.
            await import(contractModuleSpecifier);
        const loadedContract =
            contractModule.default ?? contractModule.siteContract;

        if (loadedContract === undefined || loadedContract === null) {
            throw new TypeError(
                `Contract file '${requestedContractPath}' must export either 'default' or 'siteContract'.`
            );
        }

        const siteContract = {
            ...loadedContract,
            rootDirectoryPath:
                loadedContract.rootDirectoryPath ?? requestedRootDirectoryPath,
        };
        const violations = await validateDocusaurusSiteContract(siteContract);

        printValidationReport({
            contractPath: requestedContractPath,
            rootDirectoryPath: siteContract.rootDirectoryPath,
            useJsonOutput,
            violations,
        });

        if (violations.length > 0) {
            process.exitCode = 1;
        }
    } catch (error) {
        printValidationError({
            contractPath: requestedContractPath,
            errorMessage: toErrorMessage(error),
            rootDirectoryPath: requestedRootDirectoryPath,
            useJsonOutput,
        });
        process.exitCode = 1;
    }
};

export { runCli };

if (
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
    await runCli(process.argv.slice(2));
}
