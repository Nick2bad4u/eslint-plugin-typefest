import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

// eslint-disable-next-line import-x/no-relative-packages -- The site contract intentionally lives alongside the docs workspace blueprint.
import siteContract from "../docs/docusaurus/site-contract.config.mjs";
import {
    type DocusaurusSiteContract,
    formatDocusaurusSiteContractViolations,
    validateDocusaurusSiteContract,
} from "../scripts/docusaurus-site-contract.mjs";

const temporaryDirectories: string[] = [];
const currentSiteContract = siteContract as unknown as DocusaurusSiteContract;

interface DocsFixturePackageJson {
    readonly scripts?: Record<string, string>;
}

interface ExecFileFailure extends Error {
    readonly stderr: string;
    readonly stdout: string;
}

interface ExecFileOutput {
    readonly stderr: string;
    readonly stdout: string;
}

interface ParsedCliReport {
    readonly contractPath: string;
    readonly ok: boolean;
    readonly rootDirectoryPath: string;
    readonly violationCount: number;
    readonly violations: readonly { readonly code: string }[];
}

interface RootFixturePackageJson {
    readonly homepage?: string;
    readonly repository?: Readonly<{
        readonly type?: string;
        readonly url?: string;
    }>;
    readonly scripts?: Record<string, string>;
    readonly workspaces?: readonly string[];
}

interface VendoredPackageJson {
    readonly description?: string;
    readonly homepage?: string;
    readonly repository?: Readonly<{
        readonly type?: string;
        readonly url?: string;
    }>;
}

/**
 * Execute a Node.js file with typed stdout/stderr capture.
 *
 * @param filePath - Script file path.
 * @param args - CLI arguments.
 *
 * @returns Process output.
 */
const runNodeFile = async (
    filePath: string,
    args: readonly string[]
): Promise<ExecFileOutput> =>
    new Promise((resolve, reject) => {
        execFile(
            process.execPath,
            [filePath, ...args],
            (error, stdout, stderr) => {
                if (error !== null) {
                    const failure = Object.assign(error, {
                        stderr,
                        stdout,
                    }) as ExecFileFailure;

                    reject(failure);
                    return;
                }

                resolve({ stderr, stdout });
            }
        );
    });

/**
 * Parse JSON into a typed value.
 *
 * @param jsonText - JSON source.
 *
 * @returns Parsed JSON value.
 */
const parseJson = (jsonText: string): unknown =>
    JSON.parse(jsonText) as unknown;

/**
 * Check whether a caught error carries captured stdout from {@link runNodeFile}.
 *
 * @param error - Unknown caught value.
 *
 * @returns True when stdout/stderr are available.
 */
const isExecFileFailure = (error: unknown): error is ExecFileFailure =>
    error instanceof Error &&
    "stdout" in error &&
    typeof error.stdout === "string" &&
    "stderr" in error &&
    typeof error.stderr === "string";

/**
 * Create a temporary repository fixture root.
 *
 * @returns Absolute temporary directory path.
 */
const createTemporaryRepositoryRoot = async (): Promise<string> => {
    const temporaryDirectoryPath = await fs.mkdtemp(
        path.join(os.tmpdir(), "docusaurus-site-contract-")
    );

    temporaryDirectories.push(temporaryDirectoryPath);

    return temporaryDirectoryPath;
};

/**
 * Write a UTF-8 file under a temporary repository root.
 *
 * @param repositoryRootPath - Fixture repository root.
 * @param relativeFilePath - Repository-relative file path.
 * @param contents - UTF-8 file contents.
 */
const writeFixtureFile = async (
    repositoryRootPath: string,
    relativeFilePath: string,
    contents: string
): Promise<void> => {
    const absoluteFilePath = path.join(repositoryRootPath, relativeFilePath);

    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await fs.writeFile(absoluteFilePath, contents, "utf8");
};

/**
 * Remove all temporary repository roots created during the test file.
 */
const cleanupTemporaryDirectories = async (): Promise<void> => {
    await Promise.all(
        temporaryDirectories.splice(0).map(async (temporaryDirectoryPath) =>
            fs.rm(temporaryDirectoryPath, {
                force: true,
                recursive: true,
            })
        )
    );
};

describe("docusaurus site contract validator", () => {
    it("passes for the repository's current docs-site blueprint", async () => {
        const violations =
            await validateDocusaurusSiteContract(currentSiteContract);

        expect(violations).toEqual([]);
    });

    it("reports clear failures for missing assets and drifted config structure", async () => {
        const repositoryRootPath = await createTemporaryRepositoryRoot();

        try {
            await writeFixtureFile(
                repositoryRootPath,
                "package.json",
                JSON.stringify({ scripts: {} }, null, 4)
            );
            await writeFixtureFile(
                repositoryRootPath,
                "docs/docusaurus/static/manifest.json",
                JSON.stringify(
                    {
                        icons: [{ src: "img/missing-logo.png" }],
                        name: "Fixture Docs",
                        short_name: "Fixture",
                    },
                    null,
                    4
                )
            );
            await writeFixtureFile(
                repositoryRootPath,
                "docs/docusaurus/src/js/modernEnhancements.ts",
                [
                    'document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);',
                    "export {};",
                ].join("\n")
            );
            await writeFixtureFile(
                repositoryRootPath,
                "docs/docusaurus/docusaurus.config.ts",
                [
                    "const config = {",
                    "    clientModules: [modernEnhancementsClientModule],",
                    "    themeConfig: {",
                    '        image: "img/logo.png",',
                    "        navbar: {",
                    '            logo: { src: "img/logo.svg" },',
                    "            items: [",
                    '                { label: "Docs", position: "left", type: "dropdown", to: "/docs", items: [{ label: "Overview" }] },',
                    '                { label: "Blog", position: "right", type: "dropdown", to: "/blog", items: [{ label: "Archive" }] },',
                    "            ],",
                    "        },",
                    "        footer: {",
                    "            links: [",
                    '                { title: "Explore", items: [{ label: "Overview", to: "/docs" }] },',
                    '                { title: "Support", items: [{ label: "Issues", href: "https://example.com/issues" }] },',
                    "            ],",
                    "        },",
                    "    },",
                    '    themes: [["@easyops-cn/docusaurus-search-local", { searchBarPosition: "right" }]],',
                    "};",
                    "",
                    "export default config;",
                ].join("\n")
            );

            const fixtureContract = {
                docusaurusConfig: {
                    footer: {
                        maxItemCountDelta: 0,
                        minColumns: 2,
                        requiredLinkLabelPatterns: [/ESLint Inspector/v],
                        requiredTitles: [/Explore/v, /Support/v],
                        requireLogo: true,
                    },
                    navbar: {
                        orderedItems: [
                            {
                                labelPattern: /Docs/v,
                                minDropdownItems: 1,
                                position: "left",
                                toPattern: /^\/docs$/v,
                                type: "dropdown",
                            },
                            {
                                labelPattern: /GitHub/v,
                                minDropdownItems: 1,
                                position: "right",
                                type: "dropdown",
                            },
                        ],
                        requireLogo: true,
                    },
                    path: "docs/docusaurus/docusaurus.config.ts",
                    requiredClientModuleIdentifiers: [
                        "modernEnhancementsClientModule",
                    ],
                    requiredPluginNames: ["docusaurus-plugin-image-zoom"],
                    requiredThemeNames: ["@easyops-cn/docusaurus-search-local"],
                    requiredTopLevelProperties: [
                        "clientModules",
                        "favicon",
                        "themeConfig",
                        "themes",
                    ],
                    requireFavicon: true,
                    requireThemeImage: true,
                    searchPlugin: {
                        packageName: "@easyops-cn/docusaurus-search-local",
                        requiredOptions: {
                            searchBarPosition: "left",
                        },
                    },
                },
                manifestFiles: [
                    {
                        minimumIcons: 1,
                        path: "docs/docusaurus/static/manifest.json",
                        requiredFields: {
                            name: "Fixture Docs",
                        },
                        requireExistingIconFiles: true,
                    },
                ],
                packageJsonFiles: [
                    {
                        path: "package.json",
                        requiredScripts: [
                            {
                                includes: "validate-docusaurus-site-contract",
                                name: "docs:check-site-contract",
                            },
                        ],
                    },
                ],
                requiredFiles: [
                    "docs/docusaurus/src/js/modernEnhancements.ts",
                    "docs/docusaurus/static/img/logo.svg",
                ],
                rootDirectoryPath: repositoryRootPath,
                sourceFiles: [
                    {
                        forbiddenSnippets: [
                            'document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);',
                        ],
                        path: "docs/docusaurus/src/js/modernEnhancements.ts",
                        requiredSnippets: [
                            'window.addEventListener("load", handleWindowLoad, { once: true });',
                        ],
                    },
                ],
            } as const;

            const violations =
                await validateDocusaurusSiteContract(fixtureContract);
            const violationCodes = new Set(
                violations.map((violation) => violation.code)
            );
            const report = formatDocusaurusSiteContractViolations(
                violations,
                repositoryRootPath
            );

            expect(violationCodes).toEqual(
                new Set([
                    "config-favicon-missing",
                    "config-plugin-missing",
                    "config-property-missing",
                    "footer-link-missing",
                    "footer-logo-missing",
                    "manifest-icon-file-missing",
                    "missing-file",
                    "navbar-item-missing",
                    "package-script-missing",
                    "search-plugin-option-mismatch",
                    "source-forbidden-snippet-present",
                    "source-required-snippet-missing",
                ])
            );
            expect(report).toContain("docs/docusaurus/docusaurus.config.ts");
            expect(report).toContain(
                "docs/docusaurus/src/js/modernEnhancements.ts"
            );
        } finally {
            await cleanupTemporaryDirectories();
        }
    });

    it("supports ordered regex pattern checks in source-file contracts", async () => {
        const repositoryRootPath = await createTemporaryRepositoryRoot();

        try {
            await writeFixtureFile(
                repositoryRootPath,
                "docs/example.md",
                [
                    "## Second",
                    "",
                    "## First",
                ].join("\n")
            );

            const violations = await validateDocusaurusSiteContract({
                rootDirectoryPath: repositoryRootPath,
                sourceFiles: [
                    {
                        orderedPatterns: [
                            {
                                description: "first heading",
                                pattern: /^## First$/mv,
                            },
                            {
                                description: "second heading",
                                pattern: /^## Second$/mv,
                            },
                        ],
                        path: "docs/example.md",
                    },
                ],
            });

            expect(violations).toEqual([
                expect.objectContaining({
                    code: "source-pattern-order-violation",
                }),
            ]);
        } finally {
            await cleanupTemporaryDirectories();
        }
    });

    it("emits machine-readable JSON from the CLI", async () => {
        const repositoryRootPath = await createTemporaryRepositoryRoot();

        try {
            await writeFixtureFile(
                repositoryRootPath,
                "contract.mjs",
                [
                    "export default {",
                    '    requiredFiles: ["docs/docusaurus/docusaurus.config.ts"],',
                    "};",
                ].join("\n")
            );

            const cliPath = path.join(
                process.cwd(),
                "packages",
                "docusaurus-site-contract",
                "cli.mjs"
            );
            const { stdout } = await runNodeFile(cliPath, [
                "--root",
                repositoryRootPath,
                "--config",
                "contract.mjs",
                "--json",
            ]);
            const parsedReport = parseJson(stdout) as ParsedCliReport;

            expect(parsedReport.ok).toBeFalsy();
            expect(parsedReport.contractPath).toBe("contract.mjs");
            expect(parsedReport.rootDirectoryPath).toBe(repositoryRootPath);
            expect(parsedReport.violationCount).toBe(1);
            expect(parsedReport.violations[0]?.code).toBe("missing-file");
        } catch (error) {
            if (isExecFileFailure(error)) {
                const parsedReport = parseJson(error.stdout) as Pick<
                    ParsedCliReport,
                    "ok" | "violationCount" | "violations"
                >;

                expect(parsedReport.ok).toBeFalsy();
                expect(parsedReport.violationCount).toBe(1);
                expect(parsedReport.violations[0]?.code).toBe("missing-file");
            } else {
                throw error;
            }
        } finally {
            await cleanupTemporaryDirectories();
        }
    });

    it("bootstraps a target repository with the init subcommand", async () => {
        const repositoryRootPath = await createTemporaryRepositoryRoot();

        try {
            await writeFixtureFile(
                repositoryRootPath,
                "package.json",
                JSON.stringify(
                    {
                        name: "eslint-plugin-example",
                        repository: {
                            type: "git",
                            url: "git+https://github.com/acme/eslint-plugin-example.git",
                        },
                        scripts: {
                            "lint:package-sort":
                                'sort-package-json "./package.json"',
                            "lint:package-sort-check":
                                'sort-package-json --check "./package.json"',
                            typecheck: "tsc --noEmit",
                        },
                    },
                    null,
                    4
                )
            );
            await writeFixtureFile(
                repositoryRootPath,
                path.join("docs", "docusaurus", "package.json"),
                JSON.stringify(
                    {
                        name: "@example/docs",
                        private: true,
                        scripts: {
                            build: "docusaurus build",
                            "build:fast": "docusaurus build",
                            "build:local": "docusaurus build",
                        },
                    },
                    null,
                    4
                )
            );
            await writeFixtureFile(
                repositoryRootPath,
                path.join("docs", "docusaurus", "sidebars.ts"),
                [
                    "const sidebars = {",
                    "    docs: [",
                    "        {",
                    '            id: "developer/index",',
                    '            label: "Dev",',
                    '            type: "doc",',
                    "        },",
                    "    ],",
                    "};",
                    "",
                    "export default sidebars;",
                ].join("\n")
            );
            await writeFixtureFile(
                repositoryRootPath,
                path.join(
                    "docs",
                    "docusaurus",
                    "site-docs",
                    "developer",
                    "index.md"
                ),
                [
                    "# Developer docs",
                    "",
                    "## Quick navigation",
                    "",
                    "- [API Overview](./api/index.md)",
                    "",
                    "## Maintainer operations guides",
                    "",
                    "- [CLI debugging](./cli-debugging-and-print-config.md)",
                ].join("\n")
            );

            const cliPath = path.join(
                process.cwd(),
                "packages",
                "docusaurus-site-contract",
                "cli.mjs"
            );

            await runNodeFile(cliPath, [
                "init",
                "--root",
                repositoryRootPath,
            ]);

            const rootPackageJson = parseJson(
                await fs.readFile(
                    path.join(repositoryRootPath, "package.json"),
                    "utf8"
                )
            ) as RootFixturePackageJson;
            const docsPackageJson = parseJson(
                await fs.readFile(
                    path.join(
                        repositoryRootPath,
                        "docs",
                        "docusaurus",
                        "package.json"
                    ),
                    "utf8"
                )
            ) as DocsFixturePackageJson;
            const generatedContract = await fs.readFile(
                path.join(
                    repositoryRootPath,
                    "docs",
                    "docusaurus",
                    "site-contract.config.mjs"
                ),
                "utf8"
            );
            const generatedGuide = await fs.readFile(
                path.join(
                    repositoryRootPath,
                    "docs",
                    "docusaurus",
                    "site-docs",
                    "developer",
                    "docusaurus-site-contract.md"
                ),
                "utf8"
            );
            const vendoredPackageJson = parseJson(
                await fs.readFile(
                    path.join(
                        repositoryRootPath,
                        "packages",
                        "docusaurus-site-contract",
                        "package.json"
                    ),
                    "utf8"
                )
            ) as VendoredPackageJson;
            const patchedSidebar = await fs.readFile(
                path.join(
                    repositoryRootPath,
                    "docs",
                    "docusaurus",
                    "sidebars.ts"
                ),
                "utf8"
            );
            const patchedDeveloperIndex = await fs.readFile(
                path.join(
                    repositoryRootPath,
                    "docs",
                    "docusaurus",
                    "site-docs",
                    "developer",
                    "index.md"
                ),
                "utf8"
            );

            await expect(
                fs.stat(
                    path.join(
                        repositoryRootPath,
                        "packages",
                        "docusaurus-site-contract",
                        "package.json"
                    )
                )
            ).resolves.toBeDefined();

            expect(rootPackageJson.workspaces).toContain(
                "packages/docusaurus-site-contract"
            );
            expect(rootPackageJson.scripts?.["docs:check-site-contract"]).toBe(
                "node packages/docusaurus-site-contract/cli.mjs --config docs/docusaurus/site-contract.config.mjs"
            );
            expect(rootPackageJson.scripts?.["docs:site-contract:init"]).toBe(
                "node packages/docusaurus-site-contract/cli.mjs init --root . --skip-vendor-package"
            );
            expect(rootPackageJson.scripts?.["typecheck"]).toContain(
                "npm run --workspace packages/docusaurus-site-contract typecheck"
            );
            expect(rootPackageJson.scripts?.["lint:package-sort"]).toContain(
                '"./packages/docusaurus-site-contract/package.json"'
            );
            expect(docsPackageJson.scripts?.["build"]).toContain(
                "npm --prefix ../.. run docs:check-site-contract"
            );
            expect(docsPackageJson.scripts?.["build:fast"]).toContain(
                "npm --prefix ../.. run docs:check-site-contract"
            );
            expect(docsPackageJson.scripts?.["build:local"]).toContain(
                "npm --prefix ../.. run docs:check-site-contract"
            );
            expect(generatedContract).toContain(
                'import { defineDocusaurusSiteContract } from "../../packages/docusaurus-site-contract/index.mjs";'
            );
            expect(generatedContract).toContain(
                "* - package: eslint-plugin-example"
            );
            expect(generatedContract).toContain("* - owner: acme");
            expect(generatedContract).toContain(
                "// Optional once the repository settles on stronger docs-site conventions:"
            );
            expect(generatedContract).not.toContain("    searchPlugin: {");
            expect(generatedContract).not.toContain("    manifestFiles: [");
            expect(generatedContract).not.toContain(
                "        requireThemeImage:"
            );
            expect(generatedGuide).toContain(
                "node packages/docusaurus-site-contract/cli.mjs init --root . --skip-vendor-package"
            );
            expect(vendoredPackageJson.homepage).toBeUndefined();
            expect(vendoredPackageJson.repository?.url).toBe(
                "git+https://github.com/acme/eslint-plugin-example.git"
            );
            expect(vendoredPackageJson.description).toBe(
                "Workspace package for validating Docusaurus docs-site contracts in this repository."
            );
            expect(patchedSidebar).toContain(
                'id: "developer/docusaurus-site-contract"'
            );
            expect(patchedDeveloperIndex).toContain(
                "- [🧭 Docusaurus site contract](./docusaurus-site-contract.md)"
            );
            expect(patchedDeveloperIndex).toContain(
                "- [Docusaurus site contract bootstrap and validator](./docusaurus-site-contract.md)"
            );
        } finally {
            await cleanupTemporaryDirectories();
        }
    });

    it("supports dry-run init previews without mutating the target repository", async () => {
        const repositoryRootPath = await createTemporaryRepositoryRoot();

        try {
            await writeFixtureFile(
                repositoryRootPath,
                "package.json",
                JSON.stringify(
                    {
                        name: "eslint-plugin-preview",
                        scripts: {},
                    },
                    null,
                    4
                )
            );

            const cliPath = path.join(
                process.cwd(),
                "packages",
                "docusaurus-site-contract",
                "cli.mjs"
            );
            const { stdout } = await runNodeFile(cliPath, [
                "init",
                "--root",
                repositoryRootPath,
                "--dry-run",
                "--json",
            ]);
            const parsedReport = parseJson(stdout) as {
                readonly actionCount: number;
                readonly actions: readonly {
                    readonly action: string;
                    readonly path: string;
                }[];
                readonly dryRun: boolean;
                readonly ok: boolean;
                readonly subcommand: string;
            };

            expect(parsedReport.ok).toBeTruthy();
            expect(parsedReport.dryRun).toBeTruthy();
            expect(parsedReport.subcommand).toBe("init");
            expect(parsedReport.actionCount).toBeGreaterThan(0);
            expect(parsedReport.actions).toContainEqual(
                expect.objectContaining({
                    action: "would-create",
                    path: "docs/docusaurus/site-contract.config.mjs",
                })
            );
            await expect(
                fs.stat(
                    path.join(
                        repositoryRootPath,
                        "docs",
                        "docusaurus",
                        "site-contract.config.mjs"
                    )
                )
            ).rejects.toThrow("ENOENT: no such file or directory, stat");
        } finally {
            await cleanupTemporaryDirectories();
        }
    });

    it("supports init for installed-package usage without workspace-specific wiring", async () => {
        const repositoryRootPath = await createTemporaryRepositoryRoot();

        try {
            await writeFixtureFile(
                repositoryRootPath,
                "package.json",
                JSON.stringify(
                    {
                        homepage:
                            "https://github.com/acme/eslint-plugin-installed",
                        name: "eslint-plugin-installed",
                        repository: {
                            type: "git",
                            url: "git+https://github.com/acme/eslint-plugin-installed.git",
                        },
                        scripts: {
                            "lint:package-sort":
                                'sort-package-json "./package.json"',
                            typecheck: "tsc --noEmit",
                        },
                    },
                    null,
                    4
                )
            );
            await writeFixtureFile(
                repositoryRootPath,
                path.join("docs", "docusaurus", "package.json"),
                JSON.stringify(
                    {
                        name: "@installed/docs",
                        private: true,
                        scripts: {
                            build: "docusaurus build",
                        },
                    },
                    null,
                    4
                )
            );

            const cliPath = path.join(
                process.cwd(),
                "packages",
                "docusaurus-site-contract",
                "cli.mjs"
            );

            await runNodeFile(cliPath, [
                "init",
                "--root",
                repositoryRootPath,
                "--skip-vendor-package",
            ]);

            const rootPackageJson = parseJson(
                await fs.readFile(
                    path.join(repositoryRootPath, "package.json"),
                    "utf8"
                )
            ) as RootFixturePackageJson;
            const generatedContract = await fs.readFile(
                path.join(
                    repositoryRootPath,
                    "docs",
                    "docusaurus",
                    "site-contract.config.mjs"
                ),
                "utf8"
            );
            const generatedGuide = await fs.readFile(
                path.join(
                    repositoryRootPath,
                    "docs",
                    "docusaurus",
                    "site-docs",
                    "developer",
                    "docusaurus-site-contract.md"
                ),
                "utf8"
            );

            await expect(
                fs.stat(
                    path.join(
                        repositoryRootPath,
                        "packages",
                        "docusaurus-site-contract",
                        "package.json"
                    )
                )
            ).rejects.toThrow("ENOENT: no such file or directory, stat");

            expect(rootPackageJson.workspaces).toBeUndefined();
            expect(rootPackageJson.scripts?.["docs:check-site-contract"]).toBe(
                "docusaurus-site-contract --config docs/docusaurus/site-contract.config.mjs"
            );
            expect(rootPackageJson.scripts?.["docs:site-contract:init"]).toBe(
                "docusaurus-site-contract init --root . --skip-vendor-package"
            );
            expect(rootPackageJson.scripts?.["typecheck"]).toBe("tsc --noEmit");
            expect(rootPackageJson.scripts?.["lint:package-sort"]).toBe(
                'sort-package-json "./package.json"'
            );
            expect(generatedContract).toContain(
                'import { defineDocusaurusSiteContract } from "docusaurus-site-contract";'
            );
            expect(generatedGuide).toContain(
                "docusaurus-site-contract init --root . --skip-vendor-package"
            );
        } finally {
            await cleanupTemporaryDirectories();
        }
    });
});
