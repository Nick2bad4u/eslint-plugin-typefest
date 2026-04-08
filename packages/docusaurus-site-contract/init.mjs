// @ts-check

/**
 * @packageDocumentation
 * Project bootstrap helpers for vendoring and scaffolding the local
 * Docusaurus site contract tooling into another repository.
 */

import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {Readonly<{ readonly action: string; readonly path: string }>} InitAction */

/**
 * @typedef {Readonly<{
 *     dryRun?: boolean;
 *     force?: boolean;
 *     packageName?: string;
 *     repoName?: string;
 *     repositoryOwner?: string;
 *     rootDirectoryPath: string;
 *     skipDocsGuide?: boolean;
 *     skipDocsRegistration?: boolean;
 *     skipVendorPackage?: boolean;
 * }>} InitOptions
 */

/**
 * @type {readonly Readonly<{
 *     destinationFileName: string;
 *     sourceFileName: string;
 * }>[]}
 */
const packageFilesToVendor = [
    {
        destinationFileName: "README.md",
        sourceFileName: "README.md",
    },
    {
        destinationFileName: "cli.d.mts",
        sourceFileName: "cli.d.mts",
    },
    {
        destinationFileName: "cli.mjs",
        sourceFileName: "cli.mjs",
    },
    {
        destinationFileName: "index.d.mts",
        sourceFileName: "index.d.mts",
    },
    {
        destinationFileName: "index.mjs",
        sourceFileName: "index.mjs",
    },
    {
        destinationFileName: "init.mjs",
        sourceFileName: "init.mjs",
    },
    {
        destinationFileName: "package.json",
        sourceFileName: "manifest.template.json",
    },
    {
        destinationFileName: "tsconfig.json",
        sourceFileName: "tsconfig.json",
    },
];

/** Directory containing the vendorable package sources. */
const packageDirectoryPath = dirname(fileURLToPath(import.meta.url));
/** Relative destination directory used when vendoring this package. */
const vendoredPackageDirectoryRelativePath =
    "packages/docusaurus-site-contract";
/** Default generated site contract file location. */
const defaultContractRelativePath = join(
    "docs",
    "docusaurus",
    "site-contract.config.mjs"
);
/** Default generated maintainer guide location. */
const defaultGuideRelativePath = join(
    "docs",
    "docusaurus",
    "site-docs",
    "developer",
    "docusaurus-site-contract.md"
);
/** Default Docusaurus sidebar location. */
const defaultSidebarRelativePath = join("docs", "docusaurus", "sidebars.ts");
/** Default developer docs index location. */
const defaultDeveloperIndexRelativePath = join(
    "docs",
    "docusaurus",
    "site-docs",
    "developer",
    "index.md"
);
/** Default repository-local API wrapper path. */
const defaultScriptApiWrapperRelativePath = join(
    "scripts",
    "docusaurus-site-contract.mjs"
);
/** Default repository-local validation wrapper path. */
const defaultScriptValidateWrapperRelativePath = join(
    "scripts",
    "validate-docusaurus-site-contract.mjs"
);
/** Default repository-local init wrapper path. */
const defaultScriptInitWrapperRelativePath = join(
    "scripts",
    "init-docusaurus-site-contract.mjs"
);

/**
 * Convert an absolute or relative path to a normalized slash path for generated
 * JavaScript imports and npm scripts.
 *
 * @param {string} pathValue
 *
 * @returns {string}
 */
const toSlashPath = (pathValue) => pathValue.replaceAll("\\", "/");

/**
 * Record an init action, optionally as a dry-run preview.
 *
 * @param {InitAction[]} actions
 * @param {"created" | "overwrote" | "updated"} action
 * @param {string} path
 * @param {boolean} dryRun
 */
const recordInitAction = (actions, action, path, dryRun) => {
    const normalizedAction = dryRun
        ? {
              created: "would-create",
              overwrote: "would-overwrite",
              updated: "would-update",
          }[action]
        : action;

    actions.push({
        action: normalizedAction,
        path: toSlashPath(path),
    });
};

/**
 * Check whether a path exists.
 *
 * @param {string} absolutePath
 *
 * @returns {Promise<boolean>}
 */
const pathExists = async (absolutePath) => {
    try {
        await stat(absolutePath);
        return true;
    } catch {
        return false;
    }
};

/**
 * Read a JSON file.
 *
 * @template T
 *
 * @param {string} absolutePath
 *
 * @returns {Promise<T>}
 */
const readJsonFile = async (absolutePath) =>
    JSON.parse(await readFile(absolutePath, "utf8"));

/**
 * Copy selected package metadata fields from one manifest into another.
 *
 * @param {Record<string, unknown>} targetPackageJson
 * @param {Readonly<Record<string, unknown>>} sourcePackageJson
 * @param {readonly string[]} fieldNames
 */
const copyPackageJsonFields = (
    targetPackageJson,
    sourcePackageJson,
    fieldNames
) => {
    for (const fieldName of fieldNames) {
        const value = sourcePackageJson[fieldName];

        if (value === undefined) {
            delete targetPackageJson[fieldName];
            continue;
        }

        targetPackageJson[fieldName] = value;
    }
};

/**
 * Write JSON with stable indentation and trailing newline.
 *
 * @param {string} absolutePath
 * @param {unknown} value
 *
 * @returns {Promise<void>}
 */
const writeJsonFile = async (absolutePath, value) => {
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(
        absolutePath,
        `${JSON.stringify(value, null, 4)}\n`,
        "utf8"
    );
};

/**
 * Check whether an unknown value is a plain record.
 *
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
const isUnknownRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Extract a URL-like string from repository metadata.
 *
 * @param {unknown} value
 *
 * @returns {string | undefined}
 */
const getRepositoryMetadataUrl = (value) => {
    if (typeof value === "string") {
        return value;
    }

    if (isUnknownRecord(value) && typeof value["url"] === "string") {
        return value["url"];
    }

    return undefined;
};

/**
 * Extract a GitHub owner/repository tuple from repository-like metadata.
 *
 * @param {Readonly<Record<string, unknown>>} packageJson
 *
 * @returns {Readonly<{ owner?: string; repo?: string }>}
 */
const inferRepositoryMetadata = (packageJson) => {
    const candidates = [
        typeof packageJson["homepage"] === "string"
            ? packageJson["homepage"]
            : undefined,
        getRepositoryMetadataUrl(packageJson["repository"]),
        getRepositoryMetadataUrl(packageJson["bugs"]),
    ];

    for (const candidate of candidates) {
        if (candidate === undefined) {
            continue;
        }

        const normalizedCandidate = candidate.replace(/^git\+/v, "");
        const match =
            /github\.com[\/:](?<owner>[^\/]+)\/(?<repo>[^\/.?#]+)(?:\.git)?/v.exec(
                normalizedCandidate
            );

        if (match?.groups?.["owner"] && match.groups["repo"]) {
            return {
                owner: match.groups["owner"],
                repo: match.groups["repo"],
            };
        }
    }

    return {};
};

/**
 * Create the generated contract file contents.
 *
 * @param {Readonly<{
 *     packageName: string;
 *     repositoryOwner: string;
 *     repoName: string;
 * }>} options
 *
 * @returns {string}
 */
const createSiteContractTemplate = ({
    packageName,
    repoName,
    repositoryOwner,
}) => `/**
 * @packageDocumentation
 * Generated starter contract for validating this repository's Docusaurus site.
 *
 * Review and tighten these defaults to match the repo's actual docs-site UX.
 *
 * This file is intentionally a starter, not a final strict policy.
 * Update the optional naming and navigation assumptions here before treating
 * failures as authoritative for the target repository.
 *
 * Suggested identity values to review:
 * - package: ${packageName}
 * - owner: ${repositoryOwner}
 * - repo: ${repoName}
 */

import { defineDocusaurusSiteContract } from "../../scripts/docusaurus-site-contract.mjs";

const siteContract = defineDocusaurusSiteContract({
    docusaurusConfig: {
        path: "docs/docusaurus/docusaurus.config.ts",
        requireFavicon: true,
        requiredTopLevelProperties: [
            "themeConfig",
        ],
    },
    requiredFiles: [
        "docs/docusaurus/docusaurus.config.ts",
        "docs/docusaurus/site-contract.config.mjs",
        "scripts/docusaurus-site-contract.mjs",
        "scripts/init-docusaurus-site-contract.mjs",
        "scripts/validate-docusaurus-site-contract.mjs",
    ],
    // Optional once the repository settles on stronger docs-site conventions:
    // manifestFiles: [
    //     {
    //         minimumIcons: 1,
    //         path: "docs/docusaurus/static/manifest.json",
    //         requireExistingIconFiles: true,
    //     },
    // ],
    // sourceFiles: [
    //     {
    //         path: "docs/docusaurus/src/js/modernEnhancements.ts",
    //         requiredSnippets: [
    //             'window.addEventListener("load", handleWindowLoad, { once: true });',
    //         ],
    //     },
    // ],
});

export { siteContract };
export default siteContract;
`;

/**
 * Create the generated maintainer guide contents.
 *
 * @param {Readonly<{
 *     packageName: string;
 * }>} options
 *
 * @returns {string}
 */
const createGuideTemplate = ({ packageName }) =>
    [
        "---",
        "title: Docusaurus site contract",
        `description: Maintainer guide for the docs-site contract bootstrap in ${packageName}.`,
        "---",
        "",
        "# Docusaurus site contract",
        "",
        "This repository keeps the Docusaurus site contract runnable through repository-local scripts so template-derived repos can remove the package cleanly without first editing npm package files.",
        "",
        "## Quick start",
        "",
        "If this repository already contains the vendored package or has it installed from npm, run the initializer from the repository root:",
        "",
        "```bash",
        "node scripts/init-docusaurus-site-contract.mjs --root . --skip-vendor-package",
        "```",
        "",
        "To bootstrap a different ESLint-plugin repository from a template repo that already contains this package, run the command from the source repo and point `--root` at the target repo:",
        "",
        "```bash",
        "node scripts/init-docusaurus-site-contract.mjs --root ../your-eslint-plugin-repo",
        "```",
        "",
        "Preview the bootstrap plan without mutating files:",
        "",
        "```bash",
        "node scripts/init-docusaurus-site-contract.mjs --root . --skip-vendor-package --dry-run --json",
        "```",
        "",
        "## What init writes",
        "",
        "The init command can scaffold and patch the following surfaces:",
        "",
        "- `scripts/docusaurus-site-contract.mjs`",
        "- `scripts/init-docusaurus-site-contract.mjs`",
        "- `scripts/validate-docusaurus-site-contract.mjs`",
        "- `docs/docusaurus/site-contract.config.mjs`",
        "- `docs/docusaurus/site-docs/developer/docusaurus-site-contract.md`",
        "- developer docs registration in `sidebars.ts` and `site-docs/developer/index.md` when those files follow recognizable template structure",
        "- the local private package under `packages/docusaurus-site-contract` when vendoring is enabled",
        "",
        "## Follow-up",
        "",
        "After running init:",
        "",
        "1. Review the generated contract and tighten it to match the repo's actual UX.",
        "2. Update any repo-specific names before trusting failures as final policy:",
        "   - preset names",
        "   - footer section titles",
        "   - navbar labels",
        "   - package-specific links and badges",
        "   - optional search-plugin and manifest requirements",
        "3. Confirm that `sidebars.ts` and the developer docs index were patched the way you want. If their layout was too custom for automatic registration, add the guide link manually.",
        "4. Run `node scripts/validate-docusaurus-site-contract.mjs`.",
        "5. Run the repo's docs build and link validation.",
        "6. Commit the generated package, contract file, and docs updates together.",
        "",
    ].join("\n");

/**
 * Create the generated repository-local API wrapper.
 *
 * @param {Readonly<{
 *     packageImportPath: string;
 * }>} options
 *
 * @returns {string}
 */
const createApiWrapperTemplate = ({ packageImportPath }) => `/**
 * @packageDocumentation
 * Repository-local compatibility wrapper that re-exports the Docusaurus site
 * contract implementation.
 */

import {
    defineDocusaurusSiteContract as defineDocusaurusSiteContractFromPackage,
    formatDocusaurusSiteContractViolations as formatDocusaurusSiteContractViolationsFromPackage,
    validateDocusaurusSiteContract as validateDocusaurusSiteContractFromPackage,
} from ${JSON.stringify(packageImportPath)};

/**
 * @param {import(${JSON.stringify(packageImportPath)}).DocusaurusSiteContract} siteContract
 */
const defineDocusaurusSiteContract = (siteContract) =>
    defineDocusaurusSiteContractFromPackage(siteContract);

/**
 * @param {readonly import(${JSON.stringify(packageImportPath)}).ContractViolation[]} violations
 * @param {string} rootDirectoryPath
 */
const formatDocusaurusSiteContractViolations = (
    violations,
    rootDirectoryPath
) =>
    formatDocusaurusSiteContractViolationsFromPackage(
        violations,
        rootDirectoryPath
    );

/**
 * @param {import(${JSON.stringify(packageImportPath)}).DocusaurusSiteContract} siteContract
 */
const validateDocusaurusSiteContract = async (siteContract) =>
    validateDocusaurusSiteContractFromPackage(siteContract);

export {
    defineDocusaurusSiteContract,
    formatDocusaurusSiteContractViolations,
    validateDocusaurusSiteContract,
};
`;

/**
 * Create the generated repository-local validation wrapper.
 *
 * @param {Readonly<{
 *     cliImportPath: string;
 * }>} options
 *
 * @returns {string}
 */
const createValidateWrapperTemplate = ({
    cliImportPath,
}) => `#!/usr/bin/env node

/**
 * @packageDocumentation
 * Repository-local wrapper that runs the Docusaurus site contract validator
 * manually without package.json script wiring.
 */

import { runCli } from ${JSON.stringify(cliImportPath)};

await runCli(process.argv.slice(2));
`;

/**
 * Create the generated repository-local init wrapper.
 *
 * @param {Readonly<{
 *     cliImportPath: string;
 * }>} options
 *
 * @returns {string}
 */
const createInitWrapperTemplate = ({ cliImportPath }) => `#!/usr/bin/env node

/**
 * @packageDocumentation
 * Repository-local wrapper that runs the Docusaurus site contract initializer
 * manually without package.json script wiring.
 */

import { runCli } from ${JSON.stringify(cliImportPath)};

await runCli(["init", ...process.argv.slice(2)]);
`;

/**
 * Update a text file when present using a string transformer.
 *
 * @param {string} targetRootDirectoryPath
 * @param {string} relativeFilePath
 * @param {(currentContents: string) => string | undefined} updater
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const updateTextFileIfPresent = async (
    targetRootDirectoryPath,
    relativeFilePath,
    updater,
    actions,
    dryRun
) => {
    const absolutePath = resolve(targetRootDirectoryPath, relativeFilePath);

    if (!(await pathExists(absolutePath))) {
        return;
    }

    const currentContents = await readFile(absolutePath, "utf8");
    const nextContents = updater(currentContents);

    if (nextContents === undefined || nextContents === currentContents) {
        return;
    }

    if (!dryRun) {
        await writeFile(absolutePath, nextContents, "utf8");
    }

    recordInitAction(actions, "updated", relativeFilePath, dryRun);
};

/**
 * Patch a recognizable `sidebars.ts` developer section to register the guide.
 *
 * @param {string} targetRootDirectoryPath
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const patchDeveloperSidebarRegistration = async (
    targetRootDirectoryPath,
    actions,
    dryRun
) => {
    await updateTextFileIfPresent(
        targetRootDirectoryPath,
        defaultSidebarRelativePath,
        (currentContents) => {
            if (
                currentContents.includes(
                    'id: "developer/docusaurus-site-contract"'
                )
            ) {
                return currentContents;
            }

            const anchorSnippet = '            id: "developer/index",';
            const anchorIndex = currentContents.indexOf(anchorSnippet);

            if (anchorIndex === -1) {
                return undefined;
            }

            const objectEndSnippet = "\n        },";
            const objectEndIndex = currentContents.indexOf(
                objectEndSnippet,
                anchorIndex
            );

            if (objectEndIndex === -1) {
                return undefined;
            }

            const insertAt = objectEndIndex + objectEndSnippet.length;
            const insertion =
                "\n        {\n" +
                '            className: "sb-doc-site-contract",\n' +
                '            id: "developer/docusaurus-site-contract",\n' +
                '            label: "🧭 Docs Site Contract",\n' +
                '            type: "doc",\n' +
                "        },";

            return `${currentContents.slice(0, insertAt)}${insertion}${currentContents.slice(insertAt)}`;
        },
        actions,
        dryRun
    );
};

/**
 * Patch a recognizable developer docs index to link the generated guide.
 *
 * @param {string} targetRootDirectoryPath
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const patchDeveloperIndexRegistration = async (
    targetRootDirectoryPath,
    actions,
    dryRun
) => {
    await updateTextFileIfPresent(
        targetRootDirectoryPath,
        defaultDeveloperIndexRelativePath,
        (currentContents) => {
            if (currentContents.includes("](./docusaurus-site-contract.md)")) {
                return currentContents;
            }

            const quickNavigationEntry =
                "- [🧭 Docusaurus site contract](./docusaurus-site-contract.md)\n";
            const operationsEntry =
                "- [Docusaurus site contract bootstrap and validator](./docusaurus-site-contract.md)\n";
            let nextContents = currentContents;
            let changed = false;

            if (!nextContents.includes(quickNavigationEntry.trim())) {
                const quickNavigationHeading = "## Quick navigation\n\n";

                if (nextContents.includes(quickNavigationHeading)) {
                    nextContents = nextContents.replace(
                        quickNavigationHeading,
                        `${quickNavigationHeading}${quickNavigationEntry}`
                    );
                    changed = true;
                }
            }

            if (!nextContents.includes(operationsEntry.trim())) {
                const operationsHeading = "## Maintainer operations guides\n\n";

                if (nextContents.includes(operationsHeading)) {
                    nextContents = nextContents.replace(
                        operationsHeading,
                        `${operationsHeading}${operationsEntry}`
                    );
                    changed = true;
                } else {
                    nextContents = `${nextContents.trimEnd()}\n\n## Maintainer operations guides\n\n${operationsEntry}`;
                    changed = true;
                }
            }

            return changed ? nextContents : currentContents;
        },
        actions,
        dryRun
    );
};

/**
 * Create the vendored package manifest for a target repository.
 *
 * @param {Readonly<Record<string, unknown>>} sourcePackageJson
 * @param {Readonly<Record<string, unknown>>} targetRootPackageJson
 *
 * @returns {Record<string, unknown>}
 */
const createVendoredPackageJson = (
    sourcePackageJson,
    targetRootPackageJson
) => {
    /** @type {Record<string, unknown>} */
    const vendoredPackageJson = {
        ...sourcePackageJson,
        description:
            "Local package for validating Docusaurus docs-site contracts in this repository.",
        private: true,
    };

    copyPackageJsonFields(vendoredPackageJson, targetRootPackageJson, [
        "author",
        "bugs",
        "contributors",
        "homepage",
        "license",
        "repository",
    ]);

    return vendoredPackageJson;
};

/**
 * Copy the local vendorable package into another repository.
 *
 * @param {string} targetRootDirectoryPath
 * @param {Readonly<Record<string, unknown>>} targetRootPackageJson
 * @param {boolean} force
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const vendorWorkspacePackage = async (
    targetRootDirectoryPath,
    targetRootPackageJson,
    force,
    actions,
    dryRun
) => {
    const targetPackageDirectoryPath = resolve(
        targetRootDirectoryPath,
        vendoredPackageDirectoryRelativePath
    );

    if (!dryRun) {
        await mkdir(targetPackageDirectoryPath, { recursive: true });
    }

    for (const {
        destinationFileName,
        sourceFileName,
    } of packageFilesToVendor) {
        const sourcePath = resolve(packageDirectoryPath, sourceFileName);
        const destinationPath = resolve(
            targetPackageDirectoryPath,
            destinationFileName
        );

        if (sourcePath === destinationPath) {
            continue;
        }

        const destinationExists = await pathExists(destinationPath);

        if (destinationExists && !force) {
            continue;
        }

        if (!dryRun) {
            if (destinationFileName === "package.json") {
                const sourcePackageJson = await readJsonFile(sourcePath);
                const vendoredPackageJson = createVendoredPackageJson(
                    sourcePackageJson,
                    targetRootPackageJson
                );

                await writeJsonFile(destinationPath, vendoredPackageJson);
            } else {
                await copyFile(sourcePath, destinationPath);
            }
        }

        recordInitAction(
            actions,
            destinationExists ? "overwrote" : "created",
            relative(targetRootDirectoryPath, destinationPath),
            dryRun
        );
    }
};

/**
 * Write a generated file unless it already exists and force is disabled.
 *
 * @param {string} targetRootDirectoryPath
 * @param {string} relativeFilePath
 * @param {string} contents
 * @param {boolean} force
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const writeGeneratedFile = async (
    targetRootDirectoryPath,
    relativeFilePath,
    contents,
    force,
    actions,
    dryRun
) => {
    const absolutePath = resolve(targetRootDirectoryPath, relativeFilePath);
    const exists = await pathExists(absolutePath);

    if (exists && !force) {
        return;
    }

    if (!dryRun) {
        await mkdir(dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, contents, "utf8");
    }

    recordInitAction(
        actions,
        exists ? "overwrote" : "created",
        relativeFilePath,
        dryRun
    );
};

/**
 * Write repository-local script wrappers that delegate to the package CLI and
 * library entrypoints.
 *
 * @param {string} targetRootDirectoryPath
 * @param {Readonly<{
 *     cliImportPath: string;
 *     packageImportPath: string;
 * }>} options
 * @param {boolean} force
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const writeScriptWrappers = async (
    targetRootDirectoryPath,
    { cliImportPath, packageImportPath },
    force,
    actions,
    dryRun
) => {
    await writeGeneratedFile(
        targetRootDirectoryPath,
        defaultScriptApiWrapperRelativePath,
        createApiWrapperTemplate({ packageImportPath }),
        force,
        actions,
        dryRun
    );
    await writeGeneratedFile(
        targetRootDirectoryPath,
        defaultScriptValidateWrapperRelativePath,
        createValidateWrapperTemplate({ cliImportPath }),
        force,
        actions,
        dryRun
    );
    await writeGeneratedFile(
        targetRootDirectoryPath,
        defaultScriptInitWrapperRelativePath,
        createInitWrapperTemplate({ cliImportPath }),
        force,
        actions,
        dryRun
    );
};

/**
 * Run the init command.
 *
 * @param {InitOptions} options
 *
 * @returns {Promise<readonly InitAction[]>}
 */
const runInitCommand = async (options) => {
    const targetRootDirectoryPath = resolve(options.rootDirectoryPath);
    const rootPackageJsonPath = resolve(
        targetRootDirectoryPath,
        "package.json"
    );

    if (!(await pathExists(rootPackageJsonPath))) {
        throw new TypeError(
            `Cannot initialize Docusaurus site contract tooling because '${toSlashPath(relative(process.cwd(), rootPackageJsonPath))}' does not exist.`
        );
    }

    /** @type {Record<string, unknown>} */
    const rootPackageJson = await readJsonFile(rootPackageJsonPath);
    const inferredRepositoryMetadata = inferRepositoryMetadata(rootPackageJson);
    const packageName =
        options.packageName ??
        (typeof rootPackageJson["name"] === "string"
            ? rootPackageJson["name"]
            : "eslint-plugin-example");
    const repositoryOwner =
        options.repositoryOwner ??
        inferredRepositoryMetadata.owner ??
        "your-github-owner";
    const repoName =
        options.repoName ??
        inferredRepositoryMetadata.repo ??
        "your-repository-name";
    const dryRun = options.dryRun === true;
    const force = options.force === true;
    const shouldVendorPackage = options.skipVendorPackage !== true;
    const shouldWriteDocsGuide = options.skipDocsGuide !== true;
    const shouldRegisterDocs = options.skipDocsRegistration !== true;
    const localVendoredPackageAlreadyExists = await pathExists(
        resolve(
            targetRootDirectoryPath,
            vendoredPackageDirectoryRelativePath,
            "package.json"
        )
    );
    const useVendoredPackage =
        shouldVendorPackage || localVendoredPackageAlreadyExists;
    const packageImportPath = useVendoredPackage
        ? "../packages/docusaurus-site-contract/index.mjs"
        : "docusaurus-site-contract";
    const cliImportPath = useVendoredPackage
        ? "../packages/docusaurus-site-contract/cli.mjs"
        : "docusaurus-site-contract/cli";
    /** @type {InitAction[]} */
    const actions = [];

    if (shouldVendorPackage) {
        await vendorWorkspacePackage(
            targetRootDirectoryPath,
            rootPackageJson,
            force,
            actions,
            dryRun
        );
    }

    await writeScriptWrappers(
        targetRootDirectoryPath,
        {
            cliImportPath,
            packageImportPath,
        },
        force,
        actions,
        dryRun
    );
    await writeGeneratedFile(
        targetRootDirectoryPath,
        defaultContractRelativePath,
        createSiteContractTemplate({
            packageName,
            repoName,
            repositoryOwner,
        }),
        force,
        actions,
        dryRun
    );

    if (shouldWriteDocsGuide) {
        await writeGeneratedFile(
            targetRootDirectoryPath,
            defaultGuideRelativePath,
            createGuideTemplate({ packageName }),
            force,
            actions,
            dryRun
        );
    }

    if (shouldRegisterDocs) {
        await patchDeveloperSidebarRegistration(
            targetRootDirectoryPath,
            actions,
            dryRun
        );
        await patchDeveloperIndexRegistration(
            targetRootDirectoryPath,
            actions,
            dryRun
        );
    }

    return actions;
};

export { runInitCommand };
