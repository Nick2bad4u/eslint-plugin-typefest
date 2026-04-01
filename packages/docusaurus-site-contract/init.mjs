// @ts-check

/**
 * @packageDocumentation
 * Project bootstrap helpers for vendoring and wiring the local Docusaurus site
 * contract package into another repository.
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

/** @type {readonly string[]} */
const packageFilesToVendor = [
    "README.md",
    "cli.d.mts",
    "cli.mjs",
    "index.d.mts",
    "index.mjs",
    "init.mjs",
    "package.json",
    "tsconfig.json",
];

/** Directory containing the workspace package sources. */
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
 * Upsert a string into an array if it is not already present.
 *
 * @param {unknown} currentValue
 * @param {string} entry
 *
 * @returns {string[]}
 */
const upsertStringArrayEntry = (currentValue, entry) => {
    const arrayValue = Array.isArray(currentValue)
        ? currentValue.filter((item) => typeof item === "string")
        : [];

    if (!arrayValue.includes(entry)) {
        arrayValue.push(entry);
    }

    return arrayValue;
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
 *     cliInvocationSnippet: string;
 *     packageImportPath: string;
 *     packageName: string;
 *     repositoryOwner: string;
 *     repoName: string;
 * }>} options
 *
 * @returns {string}
 */
const createSiteContractTemplate = ({
    cliInvocationSnippet,
    packageImportPath,
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

import { defineDocusaurusSiteContract } from ${JSON.stringify(packageImportPath)};

const siteContract = defineDocusaurusSiteContract({
    docusaurusConfig: {
        path: "docs/docusaurus/docusaurus.config.ts",
        requireFavicon: true,
        requiredTopLevelProperties: [
            "themeConfig",
        ],
    },
    packageJsonFiles: [
        {
            path: "package.json",
            requiredScripts: [
                {
                    includes: ${JSON.stringify(cliInvocationSnippet)},
                    name: "docs:check-site-contract",
                },
            ],
        },
        {
            path: "docs/docusaurus/package.json",
            requiredScripts: [
                {
                    includes: "docs:check-site-contract",
                    name: "build",
                },
            ],
        },
    ],
    requiredFiles: [
        "docs/docusaurus/docusaurus.config.ts",
        "docs/docusaurus/site-contract.config.mjs",
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
 *     useVendoredPackage: boolean;
 *     packageName: string;
 * }>} options
 *
 * @returns {string}
 */
const createGuideTemplate = ({ packageName, useVendoredPackage }) =>
    [
        "---",
        "title: Docusaurus site contract",
        `description: Maintainer guide for the docs-site contract bootstrap in ${packageName}.`,
        "---",
        "",
        "# Docusaurus site contract",
        "",
        "This repository uses the private local `docusaurus-site-contract` workspace package to validate docs-site structure before docs builds and release checks.",
        "",
        "## Quick start",
        "",
        useVendoredPackage
            ? "If this repository already contains the private workspace package, run the initializer from the repository root:"
            : "If this repository already has the package installed from npm or linked locally, run the initializer from the repository root:",
        "",
        "```bash",
        useVendoredPackage
            ? "node packages/docusaurus-site-contract/cli.mjs init --root . --skip-vendor-package"
            : "docusaurus-site-contract init --root . --skip-vendor-package",
        "```",
        "",
        "If the repository exposes a root npm script for initialization, you can use that instead.",
        "",
        "To bootstrap a different ESLint-plugin repository from a template repo that already contains this package, run the command from the source repo and point `--root` at the target repo:",
        "",
        "```bash",
        "node packages/docusaurus-site-contract/cli.mjs init --root ../your-eslint-plugin-repo",
        "```",
        "",
        "Preview the bootstrap plan without mutating files:",
        "",
        "```bash",
        useVendoredPackage
            ? "node packages/docusaurus-site-contract/cli.mjs init --root . --skip-vendor-package --dry-run --json"
            : "docusaurus-site-contract init --root . --skip-vendor-package --dry-run --json",
        "```",
        "",
        "## What init writes",
        "",
        "The init command can scaffold and patch the following surfaces:",
        "",
        "- `docs/docusaurus/site-contract.config.mjs`",
        "- `docs/docusaurus/site-docs/developer/docusaurus-site-contract.md`",
        "- root `package.json` script wiring",
        "- docs workspace build-script wiring",
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
        "4. Run `npm run docs:check-site-contract`.",
        "5. Run the repo's docs build and link validation.",
        "6. Commit the generated package, contract file, and docs updates together.",
        "",
    ].join("\n");

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
 * Prefix a script with another command when it is not already present.
 *
 * @param {string} commandPrefix
 * @param {string | undefined} existingScript
 *
 * @returns {string}
 */
const prefixScript = (commandPrefix, existingScript) => {
    if (existingScript === undefined || existingScript.trim().length === 0) {
        return commandPrefix;
    }

    if (existingScript.includes(commandPrefix)) {
        return existingScript;
    }

    return `${commandPrefix} && ${existingScript}`;
};

/**
 * Remove an exact command fragment from an `&&`-chained npm script.
 *
 * @param {string} existingScript
 * @param {string} fragment
 *
 * @returns {string}
 */
const removeChainedCommandFragment = (existingScript, fragment) =>
    existingScript
        .split(" && ")
        .filter((command) => command.trim() !== fragment)
        .join(" && ");

/**
 * Create the vendored workspace package manifest for a target repository.
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
            "Workspace package for validating Docusaurus docs-site contracts in this repository.",
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
 * Copy the local workspace package into another repository.
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

    for (const fileName of packageFilesToVendor) {
        const sourcePath = resolve(packageDirectoryPath, fileName);
        const destinationPath = resolve(targetPackageDirectoryPath, fileName);

        if (sourcePath === destinationPath) {
            continue;
        }

        const destinationExists = await pathExists(destinationPath);

        if (destinationExists && !force) {
            continue;
        }

        if (!dryRun) {
            if (fileName === "package.json") {
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
 * Update the target repository root package.json.
 *
 * @param {string} targetRootDirectoryPath
 * @param {boolean} useVendoredPackage
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const patchRootPackageJson = async (
    targetRootDirectoryPath,
    useVendoredPackage,
    actions,
    dryRun
) => {
    const packageJsonPath = resolve(targetRootDirectoryPath, "package.json");
    const originalContents = await readFile(packageJsonPath, "utf8");
    /** @type {Record<string, unknown>} */
    const packageJson = JSON.parse(originalContents);
    const scripts =
        typeof packageJson["scripts"] === "object" &&
        packageJson["scripts"] !== null
            ? /** @type {Record<string, string>} */ (packageJson["scripts"])
            : {};
    const checkCommand = useVendoredPackage
        ? "node packages/docusaurus-site-contract/cli.mjs --config docs/docusaurus/site-contract.config.mjs"
        : "docusaurus-site-contract --config docs/docusaurus/site-contract.config.mjs";

    scripts["docs:check-site-contract"] = checkCommand;
    scripts["docs:site-contract:init"] = useVendoredPackage
        ? "node packages/docusaurus-site-contract/cli.mjs init --root . --skip-vendor-package"
        : "docusaurus-site-contract init --root . --skip-vendor-package";

    if (typeof scripts["typecheck"] === "string") {
        const workspaceTypecheckCommand =
            "npm run --workspace packages/docusaurus-site-contract typecheck";

        if (useVendoredPackage) {
            if (!scripts["typecheck"].includes(workspaceTypecheckCommand)) {
                scripts["typecheck"] =
                    `${scripts["typecheck"]} && ${workspaceTypecheckCommand}`;
            }
        } else {
            scripts["typecheck"] = removeChainedCommandFragment(
                scripts["typecheck"],
                workspaceTypecheckCommand
            );
        }
    }

    /**
     * @param {string} scriptName
     */
    const updatePackageSortScript = (scriptName) => {
        const scriptValue = scripts[scriptName];

        if (typeof scriptValue !== "string") {
            return;
        }

        const packagePath =
            '"./packages/docusaurus-site-contract/package.json"';

        if (useVendoredPackage && !scriptValue.includes(packagePath)) {
            scripts[scriptName] = `${scriptValue} ${packagePath}`;
            return;
        }

        if (!useVendoredPackage && scriptValue.includes(packagePath)) {
            scripts[scriptName] = scriptValue.replace(` ${packagePath}`, "");
        }
    };

    updatePackageSortScript("lint:package-sort");
    updatePackageSortScript("lint:package-sort-check");

    packageJson["scripts"] = scripts;

    if (useVendoredPackage) {
        packageJson["workspaces"] = upsertStringArrayEntry(
            packageJson["workspaces"],
            vendoredPackageDirectoryRelativePath
        );
    }

    const nextContents = `${JSON.stringify(packageJson, null, 4)}\n`;

    if (nextContents === originalContents) {
        return;
    }

    if (!dryRun) {
        await writeJsonFile(packageJsonPath, packageJson);
    }

    recordInitAction(actions, "updated", "package.json", dryRun);
};

/**
 * Update the docs workspace package.json when present.
 *
 * @param {string} targetRootDirectoryPath
 * @param {InitAction[]} actions
 * @param {boolean} dryRun
 *
 * @returns {Promise<void>}
 */
const patchDocsWorkspacePackageJson = async (
    targetRootDirectoryPath,
    actions,
    dryRun
) => {
    const docsPackageJsonRelativePath = join(
        "docs",
        "docusaurus",
        "package.json"
    );
    const docsPackageJsonPath = resolve(
        targetRootDirectoryPath,
        docsPackageJsonRelativePath
    );

    if (!(await pathExists(docsPackageJsonPath))) {
        return;
    }

    const originalContents = await readFile(docsPackageJsonPath, "utf8");
    /** @type {Record<string, unknown>} */
    const packageJson = JSON.parse(originalContents);
    const scripts =
        typeof packageJson["scripts"] === "object" &&
        packageJson["scripts"] !== null
            ? /** @type {Record<string, string>} */ (packageJson["scripts"])
            : {};
    const checkCommand = "npm --prefix ../.. run docs:check-site-contract";

    for (const scriptName of [
        "build",
        "build:fast",
        "build:local",
    ]) {
        scripts[scriptName] = prefixScript(checkCommand, scripts[scriptName]);
    }

    packageJson["scripts"] = scripts;
    const nextContents = `${JSON.stringify(packageJson, null, 4)}\n`;

    if (nextContents === originalContents) {
        return;
    }

    if (!dryRun) {
        await writeJsonFile(docsPackageJsonPath, packageJson);
    }

    recordInitAction(actions, "updated", docsPackageJsonRelativePath, dryRun);
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
        ? "../../packages/docusaurus-site-contract/index.mjs"
        : "docusaurus-site-contract";
    const cliInvocationSnippet = useVendoredPackage
        ? "packages/docusaurus-site-contract/cli.mjs"
        : "docusaurus-site-contract";
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

    await patchRootPackageJson(
        targetRootDirectoryPath,
        useVendoredPackage,
        actions,
        dryRun
    );
    await patchDocsWorkspacePackageJson(
        targetRootDirectoryPath,
        actions,
        dryRun
    );
    await writeGeneratedFile(
        targetRootDirectoryPath,
        defaultContractRelativePath,
        createSiteContractTemplate({
            cliInvocationSnippet,
            packageImportPath,
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
            createGuideTemplate({
                packageName,
                useVendoredPackage,
            }),
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
