import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

const experimentalConfig = plugin.configs?.["experimental"];

/** @type {import("eslint").Linter.RulesRecord} */
const localExperimentalRules = {};

if (
    !Array.isArray(experimentalConfig) &&
    experimentalConfig?.rules !== undefined
) {
    for (const [ruleName, ruleConfig] of Object.entries(
        experimentalConfig.rules
    )) {
        if (ruleConfig !== undefined) {
            localExperimentalRules[ruleName] = ruleConfig;
        }
    }
}

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.withoutTypefest,

    {
        ignores: [
            // TypeScript project service resolves these `.mjs` modules through
            // their colocated `.d.mts` declarations and refuses to lint the
            // implementations as project files. The public plugin wrappers and
            // declaration contracts remain linted/type-checked.
            "docs/docusaurus/typedoc-plugins/hash-to-bang-links-core.mjs",
            "docs/docusaurus/typedoc-plugins/prefix-doc-links-core.mjs",
            // Runtime bridge to the built plugin in dist/. It is intentionally
            // outside the TypeScript project graph and contains no logic.
            "plugin.mjs",
        ],
        name: "TypeDoc plugin implementation project-service limitation",
    },

    {
        files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
        name: "TypeFest domain naming",
        rules: {
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true,
                },
            ],
            // Guard-heavy AST traversal and DOM enhancement loops are clearer
            // with early `continue` branches than with deep nesting.
            "no-continue": "off",
            // This repository necessarily uses identifiers such as typeName,
            // typeNode, and typefest* throughout TypeScript AST/type utilities.
            "unicorn/no-keyword-prefix": "off",
        },
    },

    {
        files: [".ncurc.json"],
        name: "Renovate-compatible npm-check-updates schema metadata",
        rules: {
            // npm-check-updates accepts `$schema`, but the published schema
            // metadata consumed by json-schema-validator-2 rejects it.
            "json-schema-validator-2/no-invalid": "off",
        },
    },

    {
        files: ["benchmarks/**/*.mjs"],
        name: "Node ESM benchmark imports",
        rules: {
            // Node executes these `.mjs` benchmark entrypoints directly, so
            // local `.mjs` specifiers must keep their runtime extensions.
            "import-x/extensions": "off",
        },
    },

    {
        files: ["docs/docusaurus/sidebars.rules.ts"],
        name: "Docusaurus dynamic sidebar generation",
        rules: {
            // The Docusaurus workspace project-service resolution currently
            // marks Node fs/path values as error typed in this config module.
            // The file remains covered by TypeScript's root project include.
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/restrict-plus-operands": "off",
            // Docusaurus expects sidebars synchronously during config loading;
            // this reads the repository's own docs directory, not user input.
            "n/no-sync": "off",
            "security/detect-non-literal-fs-filename": "off",
            "unicorn/no-array-sort": "off",
            "unicorn/prefer-import-meta-properties": "off",
        },
    },

    {
        files: [
            "docs/docusaurus/src/components/GitHubStats.tsx",
            "docs/docusaurus/src/pages/index.tsx",
        ],
        name: "Docusaurus route and React component filename conventions",
        rules: {
            // Docusaurus requires `src/pages/index.tsx`; React components use
            // PascalCase filenames to match component names.
            "canonical/filename-no-index": "off",
            "unicorn/filename-case": "off",
        },
    },

    {
        files: ["test/__snapshots__/**/*.md"],
        name: "Generated markdown snapshots",
        rules: {
            // Snapshot fragments intentionally preserve the generated section
            // heading level instead of pretending to be standalone documents.
            "remark/remark": "off",
        },
    },

    {
        files: [
            "benchmark/**/*.{js,mjs,cjs,ts,tsx,mts,cts}",
            "benchmarks/**/*.{js,mjs,cjs,ts,tsx,mts,cts}",
            "test/**/*.{ts,tsx,mts,cts}",
        ],
        name: "Repository test and benchmark patterns",
        rules: {
            // RuleTester valid/invalid suites, type assertion files, fixtures,
            // and benchmark modules intentionally use top-level data/setup.
            "vitest/require-hook": "off",
        },
    },

    {
        files: ["benchmark/cases/**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
        name: "Benchmark lint-target fixtures",
        rules: {
            "@typescript-eslint/no-unnecessary-type-conversion": "off",
            // These files intentionally contain baseline and candidate patterns
            // for measuring rules against lint-target code, not production
            // modules.
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "import-x/unambiguous": "off",
            "math/prefer-math-sum-precise": "off",
            "unicorn/prefer-math-sum-precise": "off",
        },
    },

    {
        files: ["*.mjs", ".*.mjs"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json",
                projectService: false,
            },
        },
        name: "Root JavaScript configuration type services",
    },

    {
        files: ["docs/docusaurus/docusaurus.config.ts"],
        name: "Docusaurus environment-backed configuration",
        rules: {
            // Docusaurus config is the correct boundary for reading build-time
            // environment flags. Some Docusaurus plugin rules also require the
            // direct `process.env[...] === "true"` shape.
            "n/no-process-env": "off",
        },
    },

    {
        files: ["docs/docusaurus/src/js/**/*.ts"],
        name: "Docusaurus DOM enhancement scripts",
        rules: {
            // These helpers wrap mutable browser DOM APIs; readonly DOM
            // parameter wrappers add noise without enforcing useful safety.
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            // The docs workspace type-checks this script below ES2024, so the
            // `v` RegExp flag is not portable there.
            "regexp/require-unicode-sets-regexp": "off",
        },
    },

    {
        files: ["docs/docusaurus/typedoc-plugins/*.d.mts"],
        name: "TypeDoc declaration contracts",
        rules: {
            // The helper declaration models TypeDoc objects that are mutated by
            // design during renderer/converter hooks.
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
        },
    },

    {
        files: ["docs/docusaurus/typedoc-plugins/*.mjs"],
        name: "TypeDoc JavaScript plugin entrypoints",
        rules: {
            // These are @ts-check JavaScript plugin entrypoints with JSDoc
            // contracts; TypeScript boundary annotations do not apply cleanly.
            "@typescript-eslint/explicit-module-boundary-types": "off",
        },
    },

    {
        files: ["test/**/*.{ts,tsx,mts,cts}"],
        name: "RuleTester contract tests",
        rules: {
            // These generic signal rules do not understand RuleTester
            // valid/invalid cases or snapshot contract tests in this plugin.
            "test-signal/no-mock-call-only-tests": "off",
            "test-signal/no-snapshot-only-tests": "off",
            "test-signal/require-negative-path": "off",
        },
    },

    {
        files: [
            "test/_internal/import-insertion.test.ts",
            "test/prefer-ts-extras-is-present.test.ts",
        ],
        name: "Large RuleTester contract suites",
        rules: {
            // These suites intentionally keep long scenario tables in one
            // cohesive contract test to preserve shared setup and snapshots.
            "max-lines-per-function": "off",
        },
    },

    {
        files: [
            "src/_internal/rules-registry.ts",
            "src/_internal/typescript-eslint-node-autofix.ts",
            "src/rules/prefer-ts-extras-set-has.ts",
            "src/rules/prefer-ts-extras-string-split.ts",
        ],
        name: "Rule implementation dependency fan-in",
        rules: {
            // ESLint rule modules and registries naturally coordinate parser,
            // type-checker, import-fixer, and reporting helpers. Splitting
            // these imports through artificial barrels would be worse.
            "import-x/max-dependencies": "off",
        },
    },

    {
        files: [
            "src/rules/prefer-ts-extras-set-has.ts",
            "test/_internal/rule-metadata-smoke.ts",
            "test/prefer-ts-extras-array-last.test.ts",
        ],
        name: "High-branch AST/type-analysis contracts",
        rules: {
            // These functions are explicit branch matrices over TypeScript AST,
            // checker, and RuleTester states. Splitting only for the metric
            // would hide the decision table rather than simplify it.
            complexity: "off",
        },
    },

    {
        files: ["**/*.{md,mdx}"],
        name: "Docusaurus and generated markdown documents",
        rules: {
            // Docusaurus/generated docs can intentionally contain multiple H1s.
            "markdown/no-multiple-h1": "off",
        },
    },

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{ts,tsx,mts,cts}"],
        name: "Local Typefest",
        plugins: {
            typefest: plugin,
        },
        rules: {
            ...localExperimentalRules,
        },
    },
    {
        files: [".vscode/settings.json"],
        name: "VS Code workspace settings schema compatibility",
        rules: {
            // The current VS Code workspace settings schema contains an empty enum
            // that json-schema-validator-2 cannot compile.
            "json-schema-validator-2/no-invalid": "off",
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
