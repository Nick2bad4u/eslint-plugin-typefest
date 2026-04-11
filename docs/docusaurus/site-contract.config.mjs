/**
 * @packageDocumentation
 * Repository-local Docusaurus site blueprint.
 *
 * The validator is generic; this file is the repo-specific contract that copied
 * plugin repos can adapt when they need the same docs-site guardrails.
 *
 * Unlike the `init`-generated starter contract, this file is intentionally
 * strict and tailored to eslint-plugin-typefest specifically.
 */

import { defineDocusaurusSiteContract } from "../../scripts/docusaurus-site-contract.mjs";

const presetPageSlugs = [
    "all",
    "experimental",
    "minimal",
    "recommended",
    "recommended-type-checked",
    "strict",
    "ts-extras-type-guards",
    "type-fest-types",
];

const sharedPresetPageSnippets = [
    "## Config key",
    "## Flat Config example",
    "## Rules in this preset",
];

const siteContract = defineDocusaurusSiteContract({
    docusaurusConfig: {
        footer: {
            maxItemCountDelta: 1,
            minColumns: 3,
            requiredLinkLabelPatterns: [
                /Overview/v,
                /Getting Started/v,
                /ESLint Inspector/v,
                /Stylelint Inspector/v,
            ],
            requiredTitles: [
                /Explore/v,
                /Project/v,
                /Support/v,
            ],
            requireLogo: true,
        },
        navbar: {
            orderedItems: [
                {
                    labelPattern: /Docs/v,
                    minDropdownItems: 3,
                    position: "left",
                    toPattern: /^\/docs\/rules\/overview$/v,
                    type: "dropdown",
                },
                {
                    labelPattern: /Rules/v,
                    minDropdownItems: 3,
                    position: "left",
                    toPattern: /^\/docs\/rules$/v,
                    type: "dropdown",
                },
                {
                    labelPattern: /Presets/v,
                    minDropdownItems: 8,
                    position: "left",
                    requiredDropdownLabelPatterns: [
                        /Minimal/v,
                        /Recommended/v,
                        /Experimental/v,
                        /type-fest/v,
                        /ts-extras/v,
                    ],
                    toPattern: /^\/docs\/rules\/presets$/v,
                    type: "dropdown",
                },
                {
                    hrefPattern: /^https:\/\/github\.com\//v,
                    labelPattern: /GitHub/v,
                    minDropdownItems: 6,
                    position: "right",
                    type: "dropdown",
                },
                {
                    labelPattern: /Dev/v,
                    minDropdownItems: 6,
                    position: "right",
                    toPattern: /^\/docs\/developer$/v,
                    type: "dropdown",
                },
                {
                    labelPattern: /Blog/v,
                    minDropdownItems: 2,
                    position: "right",
                    toPattern: /^\/blog$/v,
                    type: "dropdown",
                },
            ],
            requireLogo: true,
        },
        path: "docs/docusaurus/docusaurus.config.ts",
        requiredClientModuleIdentifiers: ["modernEnhancementsClientModule"],
        requiredPluginNames: [
            "docusaurus-plugin-image-zoom",
            "@docusaurus/plugin-pwa",
            "@docusaurus/plugin-content-docs",
        ],
        requiredThemeNames: [
            "@docusaurus/theme-mermaid",
            "@easyops-cn/docusaurus-search-local",
        ],
        requiredTopLevelProperties: [
            "clientModules",
            "favicon",
            "plugins",
            "presets",
            "themeConfig",
            "themes",
        ],
        requireFavicon: true,
        requireThemeImage: true,
        searchPlugin: {
            packageName: "@easyops-cn/docusaurus-search-local",
            requiredOptions: {
                indexBlog: true,
                indexDocs: true,
                searchBarPosition: "left",
                searchBarShortcut: true,
            },
        },
    },
    manifestFiles: [
        {
            minimumIcons: 2,
            path: "docs/docusaurus/static/manifest.json",
            requiredFields: {
                name: "eslint-plugin-typefest Documentation",
                short_name: "Typefest Docs",
            },
            requireExistingIconFiles: true,
        },
    ],
    packageJsonFiles: [
        {
            path: "package.json",
            requiredScripts: [
                {
                    includes: "docs/docusaurus/static/eslint-inspector",
                    name: "build:eslint-inspector",
                },
                {
                    includes: "docs/docusaurus/static/stylelint-inspector",
                    name: "build:stylelint-inspector",
                },
            ],
        },
    ],
    requiredFiles: [
        "docs/docusaurus/docusaurus.config.ts",
        "docs/docusaurus/sidebars.rules.ts",
        "docs/docusaurus/sidebars.ts",
        "docs/docusaurus/site-docs/developer/docusaurus-site-contract.md",
        "docs/docusaurus/src/components/GitHubStats.tsx",
        "docs/docusaurus/src/css/custom.css",
        "docs/docusaurus/src/js/modernEnhancements.ts",
        "docs/docusaurus/src/pages/index.module.css",
        "docs/docusaurus/src/pages/index.tsx",
        "docs/docusaurus/static/img/favicon.ico",
        "docs/docusaurus/static/img/logo.png",
        "docs/docusaurus/static/img/logo.svg",
        "docs/docusaurus/static/img/logo_192x192.png",
        "docs/docusaurus/static/manifest.json",
        "docs/rules/presets/all.md",
        "docs/rules/presets/experimental.md",
        "docs/rules/presets/index.md",
        "docs/rules/presets/minimal.md",
        "docs/rules/presets/recommended-type-checked.md",
        "docs/rules/presets/recommended.md",
        "docs/rules/presets/strict.md",
        "docs/rules/presets/ts-extras-type-guards.md",
        "docs/rules/presets/type-fest-types.md",
        "packages/docusaurus-site-contract/cli.mjs",
        "packages/docusaurus-site-contract/index.mjs",
        "scripts/docusaurus-site-contract.mjs",
        "scripts/init-docusaurus-site-contract.mjs",
        "scripts/validate-docusaurus-site-contract.mjs",
    ],
    sourceFiles: [
        {
            forbiddenSnippets: ["/tree/", "/blog/blog/"],
            path: "docs/docusaurus/docusaurus.config.ts",
            requiredPatterns: [
                {
                    description: "canonical docs editUrl base",
                    pattern:
                        /editUrl:\s*`https:\/\/github\.com\/\$\{organizationName\}\/\$\{projectName\}\/blob\/main\/docs\/`/v,
                },
                {
                    description: "canonical docs workspace editUrl base",
                    pattern:
                        /editUrl:\s*`https:\/\/github\.com\/\$\{organizationName\}\/\$\{projectName\}\/blob\/main\/docs\/docusaurus\/`/v,
                },
            ],
            requiredSnippets: [
                'favicon: "img/favicon.ico"',
                'searchBarPosition: "left"',
                'label: "🧪 Experimental"',
            ],
        },
        {
            path: "docs/docusaurus/src/components/GitHubStats.tsx",
            requiredSnippets: [
                "const liveBadges =",
                "flat.badgen.net",
                "className={styles.liveBadgeImage}",
                'href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/releases"',
            ],
        },
        {
            path: "docs/docusaurus/src/pages/index.tsx",
            requiredSnippets: [
                "const heroBadges =",
                "const heroStats =",
                "const homeCards =",
                "<GitHubStats className={styles.heroLiveBadges} />",
                "Start with Overview",
                "Compare Presets",
            ],
        },
        {
            path: "docs/docusaurus/src/pages/index.module.css",
            requiredSnippets: [
                ".heroBadgeRow",
                ".heroActionButton",
                ".heroStats",
                ".liveBadgeList",
                ".cardGrid",
            ],
        },
        {
            forbiddenSnippets: [
                'document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);',
            ],
            path: "docs/docusaurus/src/js/modernEnhancements.ts",
            requiredSnippets: [
                "function applySidebarLabelTokenColoring()",
                "function createScrollIndicator()",
                "function applyThemeToggleAnimation()",
                'window.addEventListener("load", handleWindowLoad, { once: true });',
                "window.initializeAdvancedFeatures = initializeAdvancedFeatures;",
            ],
        },
        {
            path: "docs/docusaurus/src/css/custom.css",
            requiredSnippets: [
                "--sb-accent-overview",
                "--sb-accent-developer-ops",
                "--sb-preset-experimental",
                ".navbar .dropdown__menu .navbar-dropdown-divider",
                ".sb-doc-site-contract > .menu__link",
                ".sb-inline-rule-number",
                ".sb-cat-rules-ts-extras",
                ".sb-cat-rules-type-fest",
                ".sb-cat-presets .sb-preset-experimental > .menu__link",
            ],
        },
        {
            path: "docs/docusaurus/sidebars.ts",
            requiredSnippets: [
                'className: "sb-cat-developer"',
                'className: "sb-doc-site-contract"',
                'id: "developer/docusaurus-site-contract"',
                'className: "sb-cat-developer-adr"',
                'className: "sb-cat-dev-links"',
                'badge: "adr"',
                'badge: "links"',
            ],
        },
        {
            path: "docs/docusaurus/site-docs/developer/index.md",
            requiredSnippets: [
                "./docusaurus-site-contract.md",
                "Docusaurus site contract blueprint and validator",
                "docs site contract",
            ],
        },
        {
            orderedPatterns: [
                {
                    description: "why-this-exists heading",
                    pattern: /^## Why this exists$/mv,
                },
                {
                    description: "cli-usage heading",
                    pattern: /^## CLI usage$/mv,
                },
                {
                    description: "contract-anatomy heading",
                    pattern: /^## Contract anatomy$/mv,
                },
                {
                    description: "repo-agnostic-adoption heading",
                    pattern: /^## Repo-agnostic adoption checklist$/mv,
                },
            ],
            path: "docs/docusaurus/site-docs/developer/docusaurus-site-contract.md",
            requiredSnippets: [
                "node scripts/validate-docusaurus-site-contract.mjs",
                "node scripts/init-docusaurus-site-contract.mjs",
                "--json",
                "init --root .",
                "orderedPatterns",
                "not an ESLint rule",
                "scripts/docusaurus-site-contract.mjs",
                "packages/docusaurus-site-contract/index.mjs",
            ],
        },
        {
            path: "docs/docusaurus/sidebars.rules.ts",
            requiredSnippets: [
                "const toNumberedRuleLabel",
                'padStart(2, "0")',
                'className: "sb-cat-presets"',
                'id: "presets/experimental"',
                'className: "sb-preset-experimental"',
                'className: "sb-cat-rules-ts-extras"',
                'className: "sb-cat-rules-type-fest"',
            ],
        },
        {
            path: "docs/rules/presets/index.md",
            requiredPatterns: [
                {
                    description: "experimental preset interlink",
                    pattern: /presets\/experimental/v,
                },
                {
                    description: "recommended-type-checked interlink",
                    pattern: /presets\/recommended-type-checked/v,
                },
            ],
            requiredSnippets: [
                "## Rule matrix",
                "`typefest.configs.experimental`",
            ],
        },
        ...presetPageSlugs.map((presetPageSlug) => ({
            path: `docs/rules/presets/${presetPageSlug}.md`,
            requiredSnippets: sharedPresetPageSnippets,
        })),
        {
            path: "docs/rules/presets/experimental.md",
            requiredSnippets: [
                ...sharedPresetPageSnippets,
                "### Experimental additions over `all`",
                "### Baseline rules inherited from `all`",
            ],
        },
    ],
});

export { siteContract };
export default siteContract;
