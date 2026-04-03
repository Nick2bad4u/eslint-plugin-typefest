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
 * Create a reusable CLI flag reader.
 *
 * @param {readonly string[]} commandArguments
 *
 * @returns {(flagName: string) => string | undefined}
 */
const createCliFlagValueReader = (commandArguments) => (flagName) => {
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

/**
 * Build init options from CLI arguments.
 *
 * @param {readonly string[]} commandArguments
 *
 * @returns {Readonly<{
 *     dryRun: boolean;
 *     force: boolean;
 *     packageName?: string;
 *     repoName?: string;
 *     repositoryOwner?: string;
 *     rootDirectoryPath: string;
 *     skipDocsGuide: boolean;
 *     skipDocsRegistration: boolean;
 *     skipVendorPackage: boolean;
 * }>}
 */
const createInitOptionsFromCli = (commandArguments) => {
    const readCliFlagValue = createCliFlagValueReader(commandArguments);

    return {
        dryRun: commandArguments.includes("--dry-run"),
        force: commandArguments.includes("--force"),
        packageName: readCliFlagValue("--package-name"),
        repoName: readCliFlagValue("--repo"),
        repositoryOwner: readCliFlagValue("--owner"),
        rootDirectoryPath: readCliFlagValue("--root") ?? process.cwd(),
        skipDocsGuide: commandArguments.includes("--skip-docs-guide"),
        skipDocsRegistration: commandArguments.includes(
            "--skip-docs-registration"
        ),
        skipVendorPackage: commandArguments.includes("--skip-vendor-package"),
    };
};

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
 * Print init results in either JSON or human-readable form.
 *
 * @param {Readonly<{
 *     actions: readonly import("./init.mjs").InitAction[];
 *     dryRun: boolean;
 *     rootDirectoryPath: string;
 *     useJsonOutput: boolean;
 * }>} report
 */
const printInitReport = ({
    actions,
    dryRun,
    rootDirectoryPath,
    useJsonOutput,
}) => {
    if (useJsonOutput) {
        console.log(
            JSON.stringify(
                {
                    actionCount: actions.length,
                    actions,
                    dryRun,
                    ok: true,
                    rootDirectoryPath,
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
        console.log(dryRun ? "No changes would be made." : "No files changed.");
        return;
    }

    for (const action of actions) {
        console.log(`- ${action.action}: ${action.path}`);
    }
};

/**
 * Handle the `init` CLI subcommand.
 *
 * @param {readonly string[]} commandArguments
 * @param {boolean} useJsonOutput
 *
 * @returns {Promise<void>}
 */
const handleInitSubcommand = async (commandArguments, useJsonOutput) => {
    const initOptions = createInitOptionsFromCli(commandArguments);
    const actions = await runInitCommand(initOptions);

    printInitReport({
        actions,
        dryRun: initOptions.dryRun,
        rootDirectoryPath: initOptions.rootDirectoryPath,
        useJsonOutput,
    });
};

/**
 * Load a site contract module from disk.
 *
 * @param {string} rootDirectoryPath
 * @param {string} contractPath
 *
 * @returns {Promise<import("./index.mjs").DocusaurusSiteContract>}
 */
const loadSiteContractFromFile = async (rootDirectoryPath, contractPath) => {
    const absoluteContractPath = resolve(rootDirectoryPath, contractPath);
    const contractModuleSpecifier = pathToFileURL(absoluteContractPath).href;
    const contractModule =
        // eslint-disable-next-line no-unsanitized/method -- Controlled local file path resolved from --config/--root for repository tooling.
        await import(contractModuleSpecifier);
    const loadedContract =
        contractModule.default ?? contractModule.siteContract;

    if (loadedContract === undefined || loadedContract === null) {
        throw new TypeError(
            `Contract file '${contractPath}' must export either 'default' or 'siteContract'.`
        );
    }

    return {
        ...loadedContract,
        rootDirectoryPath:
            loadedContract.rootDirectoryPath ?? rootDirectoryPath,
    };
};

/**
 * Validate a site contract file and print the result.
 *
 * @param {readonly string[]} commandArguments
 * @param {boolean} useJsonOutput
 *
 * @returns {Promise<void>}
 */
const handleValidationCommand = async (commandArguments, useJsonOutput) => {
    const readCliFlagValue = createCliFlagValueReader(commandArguments);
    const requestedRootDirectoryPath =
        readCliFlagValue("--root") ?? process.cwd();
    const requestedContractPath =
        readCliFlagValue("--config") ?? defaultContractPath;

    try {
        const siteContract = await loadSiteContractFromFile(
            requestedRootDirectoryPath,
            requestedContractPath
        );
        const violations = await validateDocusaurusSiteContract(siteContract);

        printValidationReport({
            contractPath: requestedContractPath,
            rootDirectoryPath:
                siteContract.rootDirectoryPath ?? requestedRootDirectoryPath,
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

    if (showHelp) {
        printHelp();
        return;
    }

    if (subcommand === "init") {
        await handleInitSubcommand(commandArguments, useJsonOutput);
        return;
    }

    await handleValidationCommand(commandArguments, useJsonOutput);
};

export { runCli };

if (
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
    await runCli(process.argv.slice(2));
}
