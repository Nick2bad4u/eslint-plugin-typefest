/**
 * Optimized ESLint configuration
 *
 * @see {@link https://www.schemastore.org/eslintrc.json} for JSON schema validation
 */
/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- Eslint doesn't use default */
/* eslint-disable import-x/no-named-as-default-member -- Rule wants packages not in dev, doesn't apply, eslint doesnt use default import */

import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import html from "@html-eslint/eslint-plugin";
import * as htmlParser from "@html-eslint/parser";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import gitignore from "eslint-config-flat-gitignore";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import arrayFunc from "eslint-plugin-array-func";
import pluginCanonical from "eslint-plugin-canonical";
import pluginCasePolice from "eslint-plugin-case-police";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
import pluginCompat from "eslint-plugin-compat";
import depend from "eslint-plugin-depend";
import eslintPluginEslintPlugin from "eslint-plugin-eslint-plugin";
import etc from "eslint-plugin-etc";
import progress from "eslint-plugin-file-progress";
import pluginFunctional from "eslint-plugin-functional";
import { importX } from "eslint-plugin-import-x";
import jsdocPlugin from "eslint-plugin-jsdoc";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import listeners from "eslint-plugin-listeners";
import eslintPluginMath from "eslint-plugin-math";
import moduleInterop from "eslint-plugin-module-interop";
import nodePlugin from "eslint-plugin-n";
import nitpick from "eslint-plugin-nitpick";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
import noConstructorBind from "eslint-plugin-no-constructor-bind";
import noExplicitTypeExports from "eslint-plugin-no-explicit-type-exports";
import * as pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
import noSecrets from "eslint-plugin-no-secrets";
import nounsanitized from "eslint-plugin-no-unsanitized";
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import nodeDependencies from "eslint-plugin-node-dependencies";
import packageJson from "eslint-plugin-package-json";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPreferArrow from "eslint-plugin-prefer-arrow";
import pluginPrettier from "eslint-plugin-prettier";
import pluginPromise from "eslint-plugin-promise";
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
import * as pluginJSDoc from "eslint-plugin-require-jsdoc";
import pluginSecurity from "eslint-plugin-security";
import sonarjs, { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import storybook from "eslint-plugin-storybook";
import styledA11y from "eslint-plugin-styled-components-a11y";
import eslintPluginToml from "eslint-plugin-toml";
import pluginTotalFunctions from "eslint-plugin-total-functions";
import pluginTsdoc from "eslint-plugin-tsdoc";
import pluginTSDocRequire from "eslint-plugin-tsdoc-require";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
// import * as cssPlugin from "eslint-plugin-css"
import pluginWriteGood from "eslint-plugin-write-good-comments";
import xss from "eslint-plugin-xss";
import eslintPluginYml from "eslint-plugin-yml";
import zod from "eslint-plugin-zod";
import globals from "globals";
import jsoncEslintParser from "jsonc-eslint-parser";
import { createRequire } from "node:module";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as tomlEslintParser from "toml-eslint-parser";
import * as yamlEslintParser from "yaml-eslint-parser";
// import github from 'eslint-plugin-github' -- unused for now

// NOTE: eslint-plugin-json-schema-validator may attempt to fetch remote schemas
// at lint time. That makes linting flaky/offline-hostile.
// Keep it opt-in via UW_ENABLE_JSON_SCHEMA_VALIDATION=1.
const enableJsonSchemaValidation =
    globalThis.process.env["UW_ENABLE_JSON_SCHEMA_VALIDATION"] === "1";

const jsonSchemaValidatorPackageName = "eslint-plugin-json-schema-validator";

let eslintPluginJsonSchemaValidator = undefined;

if (enableJsonSchemaValidation) {
    eslintPluginJsonSchemaValidator =
        // eslint-disable-next-line no-unsanitized/method -- Controlled package name constant; no user input reaches dynamic import.
        (await import(jsonSchemaValidatorPackageName)).default;
}

const jsonSchemaValidatorPlugins = enableJsonSchemaValidation
    ? { "json-schema-validator": eslintPluginJsonSchemaValidator }
    : {};

const jsonSchemaValidatorRules = enableJsonSchemaValidation
    ? { "json-schema-validator/no-invalid": "error" }
    : {};

const canonicalPlugin = fixupPluginRules(pluginCanonical);
const functionalPlugin = fixupPluginRules(pluginFunctional);
const noConstructorBindPlugin = fixupPluginRules(noConstructorBind);
const noExplicitTypeExportsPlugin = fixupPluginRules(noExplicitTypeExports);
const noUnsanitizedPlugin = fixupPluginRules(nounsanitized);
const preferArrowPlugin = fixupPluginRules(pluginPreferArrow);
const securityPlugin = fixupPluginRules(pluginSecurity);
const sortClassMembersPlugin = fixupPluginRules(pluginSortClassMembers);
const styledA11yPlugin = fixupPluginRules(styledA11y);
const writeGoodCommentsPlugin = fixupPluginRules(pluginWriteGood);

/** @typedef {import("eslint").Linter.Config} EslintConfig */
/** @typedef {import("eslint").Linter.BaseConfig} BaseEslintConfig */
/** @typedef {import("eslint").Linter.LinterOptions} LinterOptions */

const require = createRequire(import.meta.url);
// eslint-disable-next-line unicorn/prefer-import-meta-properties -- n/no-unsupported-features reports import.meta.dirname as unsupported in this config context.
const configDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
// eslint-disable-next-line sonarjs/no-require-or-define -- Runtime ESLint major detection is required to conditionally disable incompatible third-party presets.
const eslintVersion = require("eslint/package.json").version;
const eslintMajorVersion = Number.parseInt(
    eslintVersion.split(".")[0] ?? "0",
    10
);
const isEslintV10OrNewer = eslintMajorVersion >= 10;
const processEnvironment = globalThis.process.env;

/**
 * Controls eslint-plugin-file-progress behavior.
 *
 * @remarks
 * The file-progress rule is great for interactive CLI runs, but it produces
 * extremely large logs when output is redirected to a file.
 *
 * Supported values:
 *
 * - (unset) / "on": enable progress and show file names
 * - "nofile": enable progress but hide file names
 * - "off" / "0" / "false": disable progress
 */
const UW_ESLINT_PROGRESS_MODE = (
    processEnvironment["UW_ESLINT_PROGRESS"] ?? "on"
).toLowerCase();

const IS_CI = (processEnvironment["CI"] ?? "").toLowerCase() === "true";
const DISABLE_PROGRESS =
    UW_ESLINT_PROGRESS_MODE === "off" ||
    UW_ESLINT_PROGRESS_MODE === "0" ||
    UW_ESLINT_PROGRESS_MODE === "false";
const HIDE_PROGRESS_FILENAMES = UW_ESLINT_PROGRESS_MODE === "nofile";

/** @type {import("eslint").Linter.Config} */
const fileProgressOverridesConfig = {
    name: "CLI: file progress overrides",
    rules: {
        // The preset already auto-hides on CI, but we also support explicit
        // local toggles.
        "progress/activate": DISABLE_PROGRESS ? 0 : 1,
    },
    settings: {
        progress: {
            hide: IS_CI || DISABLE_PROGRESS,
            hideFileName: HIDE_PROGRESS_FILENAMES,
        },
    },
};

if (!processEnvironment["RECHECK_JAR"]) {
    const resolvedRecheckJarPath = (() => {
        try {
            return require.resolve("recheck-jar/recheck.jar");
        } catch {
            console.warn(
                '[eslint.config] Unable to resolve "recheck-jar/recheck.jar". eslint-plugin-redos will rely on its internal resolution logic.'
            );
            return undefined;
        }
    })();
    if (resolvedRecheckJarPath) {
        processEnvironment["RECHECK_JAR"] = path.normalize(
            resolvedRecheckJarPath
        );
    }
}

import { defineConfig, globalIgnores } from "@eslint/config-helpers";

// ═══════════════════════════════════════════════════════════════════════════════
// #region 🌍 Global Configs and Rules
// MARK: Global Configs and Rules
// ═══════════════════════════════════════════════════════════════════════════════
export default defineConfig([
    globalIgnores(["**/CHANGELOG.md", ".remarkrc.mjs"]),
    gitignore({
        name: "Global - .gitignore Rules",
        root: true,
        strict: true,
    }),
    // Stylistic.configs.customize({
    //     arrowParens: true,
    //     blockSpacing: true,
    //     braceStyle: "stroustrup",
    //     commaDangle: "always-multiline",
    //     experimental: true,
    //     // The following options are the default values
    //     indent: 4,
    //     jsx: true,
    //     pluginName: "@stylistic",
    //     quoteProps: "as-needed",
    //     quotes: 'double',
    //     semi: true,
    //     severity: "warn",
    //     // ...
    //   }),
    {
        // NOTE: In ESLint flat config, ignore-only entries are safest when
        // placed near the start of the config array.
        // ═══════════════════════════════════════════════════════════════════════════════
        // MARK: Global Ignore Patterns
        // Add patterns here to ignore files and directories globally
        // ═══════════════════════════════════════════════════════════════════════════════
        ignores: [
            "**/**-instructions.md",
            "**/**.instructions.md",
            "**/**dist**/**",
            "**/.agentic-tools*",
            "**/.cache/**",
            "**/Coverage/**",
            "**/_ZENTASKS*",
            "**/chatproject.md",
            "**/coverage-results.json",
            "**/coverage/**",
            "**/dist-scripts/**",
            "**/dist/**",
            "**/*.css.d.ts",
            "**/*.module.css.d.ts",
            "**/html/**",
            "**/node_modules/**",
            "**/package-lock.json",
            "**/release/**",
            ".devskim.json",
            ".github/ISSUE_TEMPLATE/**",
            ".github/PULL_REQUEST_TEMPLATE/**",
            ".github/chatmodes/**",
            ".github/instructions/**",
            ".github/prompts/**",
            ".stryker-tmp/**",
            "**/CHANGELOG.md",
            "coverage-report.json",
            "config/testing/types/**/*.d.ts",
            "docs/Archive/**",
            "docs/Logger-Error-report.md",
            "docs/Packages/**",
            "docs/Reviews/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/docs/**",
            "docs/docusaurus/static/eslint-inspector/**",
            "report/**",
            "reports/**",
            "scripts/devtools-snippets/**",
            "storybook-static/**",
            "playwright/reports/**",
            "playwright/test-results/**",
            "public/mockServiceWorker.js",
            "temp/**",
            ".temp/**",
        ],
        name: "Global: Ignore Patterns **/**",
    },
    // #endregion
    // #region 🧱 Base Flat Configs
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK:  Base Flat Configs
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        ...importX.flatConfigs.typescript,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Import-X TypeScript (code files only)",
    },
    ...(isEslintV10OrNewer
        ? []
        : [progress.configs["recommended-ci"], fileProgressOverridesConfig]),
    {
        ...noBarrelFiles.flat,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "No barrel files (code files only)",
    },
    // @ts-expect-error: nitpick.configs.recommended may not have correct types, but runtime usage is verified and safe
    {
        ...nitpick.configs.recommended,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Nitpick recommended (code files only)",
    },
    {
        ...comments.recommended,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "ESLint comments recommended (code files only)",
    },
    {
        ...arrayFunc.configs.all,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Array func all (code files only)",
    },
    ...storybook.configs["flat/recommended"],
    ...fixupConfigRules(pluginCasePolice.configs.recommended).map((config) => ({
        ...config,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: config.name
            ? `Case police (code files only): ${config.name}`
            : "Case police (code files only)",
    })),
    ...jsdocPlugin.configs["examples-and-default-expressions"].map((config) => ({
        ...config,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: config.name
            ? `JSDoc examples/default expressions (code files only): ${config.name}`
            : "JSDoc examples/default expressions (code files only)",
    })),
    // #endregion
    // #region 🧩 Custom Flat Configs
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK:  Github Config Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    // NOTE:
    // `eslint-plugin-github` rules are written for JS/TS and assume the ESLint
    // rule context supports scope analysis (e.g. `context.getScope`). When
    // ESLint is linting non-JS languages (YAML via `yaml-eslint-parser`, TOML,
    // etc.), that API surface is not available and @eslint/compat will crash
    // while trying to bind missing methods.
    //
    // Scope GitHub rules to code files only so they never run on `.yml` like
    // `.codecov.yml`.
    // {
    //     ...github.getFlatConfigs().recommended,
    //     files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
    //     name: "GitHub: recommended (code files only)",
    // },
    // {
    //     ...github.getFlatConfigs().react,
    //     files: ["**/*.{jsx,tsx}"],
    //     name: "GitHub: react (jsx/tsx only)",
    // },
    // ...github.getFlatConfigs().typescript.map(
    //     /**
    //      * @param {EslintConfig} config
    //      */
    //     (config) => ({
    //     ...config,
    //     files: ["**/*.{ts,tsx,cts,mts}"],
    //     name: config.name
    //         ? `GitHub: typescript (${config.name})`
    //         : "GitHub: typescript (ts/tsx only)",
    //     })
    // ),
    // #endregion
    // #region 🧭 Custom Global Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Custom Global Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["storybook/**/*.{ts,tsx,js,jsx,mts,mjs}"],
        name: "Storybook: Dev Helpers - storybook/**/*.{ts,tsx,js,jsx,mts,mjs}",
        rules: {
            "import-x/no-extraneous-dependencies": "off",
            "n/no-extraneous-import": "off",
            "sonarjs/no-implicit-dependencies": "off",
        },
    },
    {
        name: "Array conversion: prefer spread",
        rules: {
            // Conflicts with `unicorn/prefer-spread` and can cause circular
            // autofix loops. We prefer spread (`[...iterable]`) for iterables
            // and only reach for Array.from when we specifically need its
            // mapping function or array-like support.
            "array-func/prefer-array-from": "off",
        },
    },
    // #endregion
    // #region 🗣️ Global Language Options
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK:  Global Language Options
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                __dirname: "readonly",
                __filename: "readonly",
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                Buffer: "readonly",
                describe: "readonly",
                document: "readonly",
                expect: "readonly",
                global: "readonly",
                globalThis: "readonly",
                it: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
                test: "readonly",
                vi: "readonly",
                window: "readonly",
            },
        },
        name: "Global Language Options **/**",
    },
    // #endregion
    // #region ⚙️ Global Settings
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK:  Global Settings
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        name: "Global Settings Options **/**",
        settings: {
            "import-x/resolver": {
                node: true,
                noWarnOnMultipleProjects: true, // Don't warn about multiple projects
            },
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)
                    noWarnOnMultipleProjects: true, // Don't warn about multiple projects
                    // Use an array
                    project: ["./tsconfig.eslint.json"],
                }),
            ],
        },
    },
    // #endregion
    // #region 🔌 ESLint Plugin config
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: ESLint Plugin config
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "*.{js,mjs,cjs,ts,mts,cts,tsx}",
            "src/**/*.{js,mjs,cjs,ts,mts,cts,tsx}",
            "test/**/*.{js,mjs,cjs,ts,mts,cts,tsx}",
        ],
        ignores: [],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                document: "readonly",
                globalThis: "readonly",
                window: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: ["./tsconfig.eslint.json"],
                sourceType: "module",
                tsconfigRootDir: configDirectoryPath,
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "ESLint Plugin Source Files - project/**/*.*",
        plugins: {
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@typescript-eslint": tseslint,
            canonical: canonicalPlugin,
            "comment-length": eslintPluginCommentLength,
            "eslint-comments": comments,
            "eslint-plugin": eslintPluginEslintPlugin,
            etc: fixupPluginRules(etc),
            "import-x": importX,
            jsdoc: jsdocPlugin,
            listeners,
            math: eslintPluginMath,
            "module-interop": moduleInterop,
            n: nodePlugin,
            "no-function-declare-after-return": pluginNFDAR,
            "no-lookahead-lookbehind-regexp": pluginRegexLook,
            "no-use-extend-native": eslintPluginNoUseExtendNative,
            perfectionist: pluginPerfectionist,
            promise: pluginPromise,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            security: securityPlugin,
            sonarjs,
            "sort-class-members": sortClassMembersPlugin,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            unicorn: eslintPluginUnicorn,
            xss,
            zod,
        },
        rules: {
            // TypeScript backend rules
            ...js.configs.all.rules,
            ...tseslint.configs["recommendedTypeChecked"],
            ...tseslint.configs["recommended"].rules,
            ...tseslint.configs["strictTypeChecked"],
            ...tseslint.configs["strict"].rules,
            ...tseslint.configs["stylisticTypeChecked"],
            ...tseslint.configs["stylistic"].rules,
            ...pluginRegexp.configs.all.rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...eslintPluginUnicorn.configs.all.rules,
            ...sonarjsConfigs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/all"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            ...comments.recommended.rules,
            ...pluginCanonical.configs.recommended.rules,
            ...pluginSortClassMembers.configs["flat/recommended"].rules,
            ...eslintPluginNoUseExtendNative.configs.recommended.rules,
            ...pluginMicrosoftSdl.configs.required.rules,
            ...listeners.configs.strict.rules,
            ...moduleInterop.configs.recommended.rules,
            ...pluginTotalFunctions.configs.recommended.rules,
            ...etc.configs.recommended.rules,
            ...zod.configs.recommended.rules,

            "@microsoft/sdl/no-insecure-random": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",

            "comment-length/limit-multi-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],
            "comment-length/limit-single-line-comments": [
                "warn",
                {
                    ignoreCommentsWithCode: true,
                    ignoreUrls: true,
                    logicalWrap: true,
                    maxLength: 120,
                    mode: "compact-on-overflow",
                    tabSize: 2,
                },
            ],

            "eslint-plugin/consistent-output": "error",
            "eslint-plugin/fixer-return": "error",
            "eslint-plugin/meta-property-ordering": "warn",
            "eslint-plugin/no-deprecated-context-methods": "error",
            "eslint-plugin/no-deprecated-report-api": "error",
            "eslint-plugin/no-identical-tests": "error",
            "eslint-plugin/no-matching-violation-suggest-message-ids": "error",
            "eslint-plugin/no-meta-replaced-by": "error",
            "eslint-plugin/no-meta-schema-default": "error",
            "eslint-plugin/no-missing-message-ids": "error",
            "eslint-plugin/no-missing-placeholders": "error",
            "eslint-plugin/no-only-tests": "error",
            "eslint-plugin/no-property-in-node": "error",
            "eslint-plugin/no-unused-message-ids": "error",
            "eslint-plugin/no-unused-placeholders": "error",
            "eslint-plugin/no-useless-token-range": "error",
            "eslint-plugin/prefer-message-ids": "error",
            "eslint-plugin/prefer-object-rule": "error",
            "eslint-plugin/prefer-output-null": "error",
            "eslint-plugin/prefer-placeholders": "warn",
            "eslint-plugin/prefer-replace-text": "error",
            "eslint-plugin/report-message-format": "warn",
            "eslint-plugin/require-meta-default-options": "error",
            "eslint-plugin/require-meta-docs-description": "warn",
            "eslint-plugin/require-meta-docs-recommended": "warn",
            "eslint-plugin/require-meta-docs-url": "error",
            "eslint-plugin/require-meta-fixable": "error",
            "eslint-plugin/require-meta-has-suggestions": "error",
            "eslint-plugin/require-meta-schema": "error",
            "eslint-plugin/require-meta-schema-description": "error",
            "eslint-plugin/require-meta-type": "error",
            "eslint-plugin/require-test-case-name": "warn",
            "eslint-plugin/test-case-property-ordering": "warn",
            "eslint-plugin/test-case-shorthand-strings": "error",
            "eslint-plugin/unique-test-case-names": "error",

            "import-x/dynamic-import-chunkname": "off",
            "import-x/no-nodejs-modules": "off",
            "import-x/no-unresolved": "off",
            "import-x/order": "off",

            "jsdoc/require-description": "warn",
            "jsdoc/require-param-description": "warn",
            "jsdoc/require-returns-description": "warn",

            "n/file-extension-in-import": "off",
            "n/no-missing-file-extension": "off",
            "n/no-missing-import": "off",

            "security/detect-non-literal-fs-filename": "off",
            "security/detect-object-injection": "off",

            "sort-class-members/sort-class-members": [
                "warn",
                {
                    accessorPairPositioning: "together",
                    order: [
                        "[static-properties]",
                        "[properties]",
                        "[conventional-private-properties]",
                        "[arrow-function-properties]",
                        "[everything-else]",
                        "[accessor-pairs]",
                        "[getters]",
                        "[setters]",
                        "[static-methods]",
                        "[async-methods]",
                        "[methods]",
                        "[conventional-private-methods]",
                    ],
                    sortInterfaces: true,
                    stopAfterFirstProblem: false,
                },
            ],

            "total-functions/no-hidden-type-assertions": "off",
            "total-functions/no-nested-fp-ts-effects": "off",
            "total-functions/no-partial-division": "off",
            "total-functions/no-partial-url-constructor": "off",
            "total-functions/no-unsafe-mutable-readonly-assignment": "off",
            "total-functions/no-unsafe-readonly-mutable-assignment": "off",
            "total-functions/no-unsafe-type-assertion": "off",
            "total-functions/require-strict-mode": "off",

            "xss/no-mixed-html": [
                "off",
                {
                    encoders: [
                        "utils.htmlEncode()",
                        "CSS.escape()",
                        "Number()",
                    ],
                    unsafe: [".html()"],
                },
            ],
        },
    },
    {
        files: [
            "eslint.config.mjs",
            "plugin.mjs",
            "src/**/*.{js,mjs,cjs,ts,mts,cts,tsx}",
        ],
        name: "ESLint Plugin Source - internal rule authoring overrides",
        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            canonical: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/id-match": "off",
            "canonical/import-specifier-newline": "off",
            complexity: "off",
            "consistent-return": "off",
            "eslint-plugin/meta-property-ordering": "off",
            "eslint-plugin/require-meta-docs-recommended": "off",
            "func-style": "off",
            "id-length": "off",
            "import-x/no-named-as-default": "off",
            "import-x/no-named-as-default-member": "off",
            "init-declarations": "off",
            "jsdoc/require-description": "off",
            "jsdoc/require-param-description": "off",
            "jsdoc/require-returns-description": "off",
            "max-lines": "off",
            "max-lines-per-function": "off",
            "max-statements": "off",
            "n/no-extraneous-import": "off",
            "n/no-mixed-requires": "off",
            "n/no-sync": "off",
            "n/no-unsupported-features/node-builtins": "off",
            "new-cap": "off",
            "no-continue": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-ternary": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off",
            "one-var": "off",
            "perfectionist/sort-imports": "off",
            "perfectionist/sort-object-types": "off",
            "perfectionist/sort-objects": "off",
            "perfectionist/sort-union-types": "off",
            "prefer-destructuring": "off",
            "regexp/require-unicode-regexp": "off",
            "regexp/require-unicode-sets-regexp": "off",
            "require-unicode-regexp": "off",
            "security/detect-non-literal-fs-filename": "off",
            "security/detect-object-injection": "off",
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/different-types-comparison": "off",
            "sonarjs/no-nested-conditional": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "sort-vars": "off",
            "unicorn/consistent-destructuring": "off",
            "unicorn/consistent-function-scoping": "off",
            "unicorn/import-style": "off",
            "unicorn/no-nested-ternary": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-import-meta-properties": "off",
            "unicorn/prevent-abbreviations": "off",
        },
    },
    {
        files: ["test/**/*.{test,spec}.{ts,tsx}", "test/**/*.{ts,tsx}"],
        name: "ESLint Plugin Tests - internal tooling",
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            canonical: "off",
            "canonical/id-match": "off",
            eqeqeq: "off",
            "filenames/no-relative-paths": "off",
            "func-style": "off",
            "max-statements": "off",
            "n/no-missing-import": "off",
            "n/no-sync": "off",
            "n/no-unpublished-import": "off",
            "no-magic-numbers": "off",
            "no-ternary": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off",
            "one-var": "off",
            "sort-imports": "off",
            "unicorn/import-style": "off",
            "unicorn/no-array-callback-reference": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-at": "off",
            "unicorn/prefer-spread": "off",
            "unicorn/prevent-abbreviations": "off",
        },
    },
    {
        files: ["test/_internal/ruleTester.ts"],
        name: "ESLint Plugin Tests - internal helper filename",
        rules: {
            "unicorn/filename-case": "off",
        },
    },
    // #endregion
    // #region 📦 Package.json Linting
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Package.json Linting
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/package.json"],
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        name: "Package - **/Package.json",
        plugins: {
            json: json,
            "node-dependencies": nodeDependencies,
            "package-json": packageJson,
        },
        rules: {
            ...json.configs.recommended.rules,
            // NOTE: Keeping node-dependencies scoped to package.json avoids perf + parser issues.
            "node-dependencies/absolute-version": [
                "error",
                "never", // Or always
            ],
            // Can be noisy depending on how transitive deps declare engines.
            "node-dependencies/compat-engines": "off",
            "node-dependencies/no-deprecated": [
                "error",
                {
                    // User-request: you'll uninstall these; keep lint green in the meantime.
                    allows: [],
                    devDependencies: true,
                },
            ],
            "node-dependencies/no-dupe-deps": "error",
            "node-dependencies/no-restricted-deps": "off",
            "node-dependencies/prefer-caret-range-version": "error",
            "node-dependencies/prefer-tilde-range-version": "off",
            // This rule is currently not viable for most ecosystems (many packages
            // do not publish provenance metadata consistently).
            "node-dependencies/require-provenance-deps": "off",
            // Deprecated rule (replaced by node-dependencies/compat-engines)
            "node-dependencies/valid-engines": "off",
            "node-dependencies/valid-semver": "error",
            // Package.json Plugin Rules (package-json/*)
            "package-json/bin-name-casing": "warn",
            "package-json/exports-subpaths-style": "warn",
            "package-json/no-empty-fields": "warn",
            "package-json/no-redundant-files": "warn",
            "package-json/no-redundant-publishConfig": "warn",
            "package-json/order-properties": "warn",
            "package-json/repository-shorthand": "warn",
            "package-json/require-attribution": "warn",
            "package-json/require-author": "warn",
            "package-json/require-bugs": "warn",
            "package-json/require-bundleDependencies": "off",
            "package-json/require-dependencies": "warn",
            "package-json/require-description": "warn",
            "package-json/require-devDependencies": "warn",
            "package-json/require-engines": "warn",
            "package-json/require-exports": [
                "error",
                {
                    ignorePrivate: true,
                },
            ],
            "package-json/require-files": "off",
            "package-json/require-homepage": "warn",
            "package-json/require-keywords": "warn",
            "package-json/require-license": "warn",
            "package-json/require-name": "warn",
            "package-json/require-optionalDependencies": "off",
            "package-json/require-peerDependencies": "off",
            "package-json/require-repository": "error",
            "package-json/require-scripts": "warn",
            "package-json/require-sideEffects": "off",
            // Not needed for Electron applications and Breaks Docusaurus
            "package-json/require-type": [
                "error",
                {
                    ignorePrivate: true,
                },
            ],
            "package-json/require-types": [
                "error",
                {
                    ignorePrivate: true,
                },
            ],
            "package-json/require-version": "warn",
            "package-json/restrict-dependency-ranges": "warn",
            "package-json/restrict-private-properties": "off",
            // This repo intentionally uses stable camelCase script names.
            "package-json/scripts-name-casing": "warn",
            "package-json/sort-collections": [
                "warn",
                [
                    "config",
                    "dependencies",
                    "devDependencies",
                    "exports",
                    "optionalDependencies",
                    // "overrides",
                    "peerDependencies",
                    "peerDependenciesMeta",
                    "scripts",
                ],
            ],
            "package-json/specify-peers-locally": "warn",
            "package-json/unique-dependencies": "warn",
            "package-json/valid-author": "warn",
            "package-json/valid-bin": "warn",
            "package-json/valid-bundleDependencies": "warn",
            "package-json/valid-config": "warn",
            "package-json/valid-contributors": "warn",
            "package-json/valid-cpu": "warn",
            "package-json/valid-dependencies": "warn",
            "package-json/valid-description": "warn",
            "package-json/valid-devDependencies": "warn",
            "package-json/valid-directories": "warn",
            "package-json/valid-engines": "warn",
            "package-json/valid-exports": "warn",
            "package-json/valid-files": "warn",
            "package-json/valid-homepage": "warn",
            "package-json/valid-keywords": "warn",
            "package-json/valid-license": "warn",
            "package-json/valid-local-dependency": "off",
            "package-json/valid-main": "warn",
            "package-json/valid-man": "warn",
            "package-json/valid-module": "warn",
            "package-json/valid-name": "warn",
            "package-json/valid-optionalDependencies": "warn",
            "package-json/valid-os": "warn",
            "package-json/valid-peerDependencies": "warn",
            "package-json/valid-private": "warn",
            "package-json/valid-publishConfig": "warn",
            "package-json/valid-repository": "warn",
            "package-json/valid-repository-directory": "warn",
            "package-json/valid-scripts": "warn",
            "package-json/valid-sideEffects": "warn",
            "package-json/valid-type": "warn",
            "package-json/valid-version": "warn",
            "package-json/valid-workspaces": "warn",
        },
    },
    // #endregion
    // #region 📝 Markdown files (with Remark linting)
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Markdown (md/*, markdown/*, markup/*, atom/*, rss/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{md,markup,atom,rss,markdown}"],
        ignores: [
            "**/docs/packages/**",
            "**/docs/TSDoc/**",
            "**/.github/agents/**",
        ],
        language: "markdown/gfm",
        name: "MD - **/*.{MD,MARKUP,ATOM,RSS,MARKDOWN} (with Remark)",
        plugins: {
            markdown: markdown,
        },
        rules: {
            // Markdown Plugin Eslint Rules (markdown/*)
            "markdown/fenced-code-language": "warn",
            "markdown/heading-increment": "warn",
            "markdown/no-bare-urls": "warn",
            "markdown/no-duplicate-definitions": "warn",
            "markdown/no-duplicate-headings": "warn",
            "markdown/no-empty-definitions": "warn",
            "markdown/no-empty-images": "warn",
            "markdown/no-empty-links": "warn",
            "markdown/no-html": "off",
            "markdown/no-invalid-label-refs": "warn",
            "markdown/no-missing-atx-heading-space": "warn",
            "markdown/no-missing-label-refs": "warn",
            "markdown/no-missing-link-fragments": "warn",
            "markdown/no-multiple-h1": "warn",
            "markdown/no-reference-like-urls": "warn",
            "markdown/no-reversed-media-syntax": "warn",
            "markdown/no-space-in-emphasis": "warn",
            "markdown/no-unused-definitions": "warn",
            "markdown/require-alt-text": "warn",
            "markdown/table-column-count": "warn",
        },
    },
    // #endregion
    // #region 🧾 YAML/YML files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: YAML/YML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{yaml,yml}"],
        ignores: [],
        language: "yml/yaml",
        languageOptions: {
            parser: yamlEslintParser,
            // Options used with yaml-eslint-parser.
            parserOptions: {
                defaultYAMLVersion: "1.2",
            },
        },
        name: "YAML/YML - **/*.{YAML,YML}",
        plugins: {
            ...jsonSchemaValidatorPlugins,
            yml: eslintPluginYml,
        },
        rules: {
            ...jsonSchemaValidatorRules,
            "yml/block-mapping": "warn",
            "yml/block-mapping-colon-indicator-newline": "error",
            "yml/block-mapping-question-indicator-newline": "error",
            "yml/block-sequence": "warn",
            "yml/block-sequence-hyphen-indicator-newline": "error",
            "yml/file-extension": "off",
            "yml/flow-mapping-curly-newline": "error",
            "yml/flow-mapping-curly-spacing": "error",
            "yml/flow-sequence-bracket-newline": "error",
            "yml/flow-sequence-bracket-spacing": "error",
            "yml/indent": "off",
            "yml/key-name-casing": "off",
            "yml/key-spacing": "error",
            "yml/no-empty-document": "error",
            "yml/no-empty-key": "error",
            "yml/no-empty-mapping-value": "error",
            "yml/no-empty-sequence-entry": "error",
            "yml/no-irregular-whitespace": "error",
            "yml/no-multiple-empty-lines": "error",
            "yml/no-tab-indent": "error",
            "yml/no-trailing-zeros": "error",
            "yml/plain-scalar": "off",
            "yml/quotes": "error",
            "yml/require-string-key": "error",
            // Re-enabled: eslint-plugin-yml v2.0.1 fixes the diff-sequences
            // import crash (TypeError: diff is not a function).
            "yml/sort-keys": "error",
            "yml/sort-sequence-values": "off",
            "yml/spaced-comment": "warn",
            "yml/vue-custom-block/no-parsing-error": "warn",
        },
    },
    // #endregion
    // #region 🌐 HTML files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: HTML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{html,htm,xhtml}"],
        ignores: ["report/**"],
        languageOptions: {
            parser: htmlParser,
        },
        name: "HTML - **/*.{HTML,HTM,XHTML}",
        plugins: {
            html: html,
            "styled-components-a11y": styledA11yPlugin,
            xss: xss,
        },
        rules: {
            ...html.configs.recommended.rules,
            "html/class-spacing": "warn",
            "html/css-no-empty-blocks": "warn",
            "html/id-naming-convention": "warn",
            "html/indent": "error",
            "html/lowercase": "warn",
            "html/max-element-depth": "warn",
            "html/no-abstract-roles": "warn",
            "html/no-accesskey-attrs": "warn",
            "html/no-aria-hidden-body": "warn",
            "html/no-aria-hidden-on-focusable": "warn",
            "html/no-duplicate-class": "warn",
            "html/no-empty-headings": "warn",
            "html/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
            "html/no-extra-spacing-text": "warn",
            "html/no-heading-inside-button": "warn",
            "html/no-ineffective-attrs": "warn",
            // HTML Eslint Plugin Rules (html/*)
            "html/no-inline-styles": "warn",
            "html/no-invalid-entity": "warn",
            "html/no-invalid-role": "warn",
            "html/no-multiple-empty-lines": "warn",
            "html/no-nested-interactive": "warn",
            "html/no-non-scalable-viewport": "warn",
            "html/no-positive-tabindex": "warn",
            "html/no-restricted-attr-values": "warn",
            "html/no-restricted-attrs": "warn",
            "html/no-restricted-tags": "warn",
            "html/no-script-style-type": "warn",
            "html/no-skip-heading-levels": "warn",
            "html/no-target-blank": "warn",
            "html/no-trailing-spaces": "warn",
            "html/no-whitespace-only-children": "warn",
            "html/prefer-https": "warn",
            "html/require-attrs": "warn",
            "html/require-button-type": "warn",
            "html/require-closing-tags": "off",
            "html/require-explicit-size": "warn",
            "html/require-form-method": "warn",
            "html/require-frame-title": "warn",
            "html/require-input-label": "warn",
            "html/require-meta-charset": "warn",
            "html/require-meta-description": "warn",
            "html/require-meta-viewport": "warn",
            "html/require-open-graph-protocol": "warn",
            "html/sort-attrs": "warn",
            "styled-components-a11y/lang": "off",
            "xss/no-mixed-html": [
                "off",
                {
                    encoders: [
                        "utils.htmlEncode()",
                        "CSS.escape()",
                        "Number()",
                    ],
                    unsafe: [".html()"],
                },
            ],
        },
    },
    // #endregion
    // #region 🧾 JSONC/JSON files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JSONC (jsonc/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.jsonc", ".vscode/*.json"],
        ignores: [],
        name: "JSONC - **/*.JSONC",
        // ═══════════════════════════════════════════════════════════════════════════════
        // Plugin Config for eslint-plugin-jsonc to enable Prettier formatting
        // ═══════════════════════════════════════════════════════════════════════════════
        ...eslintPluginJsonc.configs["flat/prettier"][0],
        language: "json/jsonc",
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        plugins: {
            json: json,
            jsonc: eslintPluginJsonc,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            "jsonc/array-bracket-newline": "warn",
            "jsonc/array-bracket-spacing": "warn",
            "jsonc/array-element-newline": "off", // Handled by Prettier
            "jsonc/auto": "warn",
            "jsonc/comma-dangle": "warn",
            "jsonc/comma-style": "warn",
            "jsonc/indent": "off", // Handled by Prettier
            "jsonc/key-name-casing": "off",
            "jsonc/key-spacing": "warn",
            "jsonc/no-bigint-literals": "warn",
            "jsonc/no-binary-expression": "warn",
            "jsonc/no-binary-numeric-literals": "warn",
            "jsonc/no-comments": "warn",
            "jsonc/no-dupe-keys": "warn",
            "jsonc/no-escape-sequence-in-identifier": "warn",
            "jsonc/no-floating-decimal": "warn",
            "jsonc/no-hexadecimal-numeric-literals": "warn",
            "jsonc/no-infinity": "warn",
            "jsonc/no-irregular-whitespace": "warn",
            "jsonc/no-multi-str": "warn",
            "jsonc/no-nan": "warn",
            "jsonc/no-number-props": "warn",
            "jsonc/no-numeric-separators": "warn",
            "jsonc/no-octal": "warn",
            "jsonc/no-octal-escape": "warn",
            "jsonc/no-octal-numeric-literals": "warn",
            "jsonc/no-parenthesized": "warn",
            "jsonc/no-plus-sign": "warn",
            "jsonc/no-regexp-literals": "warn",
            "jsonc/no-sparse-arrays": "warn",
            "jsonc/no-template-literals": "warn",
            "jsonc/no-undefined-value": "warn",
            "jsonc/no-unicode-codepoint-escapes": "warn",
            "jsonc/no-useless-escape": "warn",
            "jsonc/object-curly-newline": "warn",
            "jsonc/object-curly-spacing": "warn",
            "jsonc/object-property-newline": "warn",
            "jsonc/quote-props": "warn",
            "jsonc/quotes": "warn",
            "jsonc/sort-array-values": [
                "error",
                {
                    order: { type: "asc" },
                    pathPattern: "^files$", // Hits the files property
                },
                {
                    order: [
                        "eslint",
                        "eslintplugin",
                        "eslint-plugin",
                        {
                            // Fallback order
                            order: { type: "asc" },
                        },
                    ],
                    pathPattern: "^keywords$", // Hits the keywords property
                },
            ],
            "jsonc/sort-keys": [
                "error",
                // For example, a definition for package.json
                {
                    order: [
                        "name",
                        "version",
                        "private",
                        "publishConfig",
                        // ...
                    ],
                    pathPattern: "^$", // Hits the root properties
                },
                {
                    order: { type: "asc" },
                    pathPattern:
                        "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
                },
                // ...
            ],
            "jsonc/space-unary-ops": "warn",
            "jsonc/valid-json-number": "warn",
            "jsonc/vue-custom-block/no-parsing-error": "warn",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // #endregion
    // #region 🧾 JSON files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JSON (json/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json"],
        // Package.json has a dedicated config block above that uses jsonc-eslint-parser
        // (needed for some package.json-specific tooling rules).
        ignores: ["**/package.json"],
        language: "json/json",
        name: "JSON - **/*.JSON",
        plugins: {
            json: json,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            ...jsonSchemaValidatorRules,
            "json/sort-keys": ["warn"],
            "json/top-level-interop": "warn",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // #endregion
    // #region 🧾 JSON5 files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JSON5 (json5/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json5"],
        language: "json/json5",
        name: "JSON5 - **/*.JSON5",
        plugins: {
            json: json,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            ...jsonSchemaValidatorRules,
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // #endregion
    // #region 🧾 TOML files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: TOML (toml/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: { tomlVersion: "1.0.0" },
        },
        name: "TOML - **/*.TOML",
        plugins: { toml: eslintPluginToml },
        rules: {
            // TOML Eslint Plugin Rules (toml/*)
            "toml/array-bracket-newline": "warn",
            "toml/array-bracket-spacing": "warn",
            "toml/array-element-newline": "warn",
            "toml/comma-style": "warn",
            "toml/indent": "off",
            "toml/inline-table-curly-spacing": "warn",
            "toml/key-spacing": "off",
            "toml/keys-order": "warn",
            "toml/no-mixed-type-in-array": "warn",
            "toml/no-non-decimal-integer": "warn",
            "toml/no-space-dots": "warn",
            "toml/no-unreadable-number-separator": "warn",
            "toml/padding-line-between-pairs": "warn",
            "toml/padding-line-between-tables": "warn",
            "toml/precision-of-fractional-seconds": "warn",
            "toml/precision-of-integer": "warn",
            "toml/quoted-keys": "warn",
            "toml/spaced-comment": "warn",
            "toml/table-bracket-spacing": "warn",
            "toml/tables-order": "warn",
            "toml/vue-custom-block/no-parsing-error": "warn",
        },
    },
    // #endregion
    // #region 📚 JS JsDoc
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JS JsDoc
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["scripts/**/*.{js,cjs,mjs}", "storybook/**/*.{js,cjs,mjs}"],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
        },
        name: "JS JSDoc - **/*.{JS,CJS,MJS}",
        plugins: {
            jsdoc: jsdocPlugin,
        },
        rules: {
            // Start from upstream defaults for JS so new recommended rules are
            // picked up automatically when eslint-plugin-jsdoc updates.
            ...jsdocPlugin.configs["flat/recommended"].rules,
            "jsdoc/check-access": "warn", // Recommended
            "jsdoc/check-alignment": "warn", // Recommended
            "jsdoc/check-indentation": "off",
            "jsdoc/check-line-alignment": "off",
            "jsdoc/check-param-names": "warn", // Recommended
            "jsdoc/check-property-names": "warn", // Recommended
            "jsdoc/check-syntax": "warn",
            "jsdoc/check-tag-names": "off", // Recommended
            "jsdoc/check-template-names": "warn",
            "jsdoc/check-types": "warn", // Recommended
            "jsdoc/check-values": "warn", // Recommended
            "jsdoc/convert-to-jsdoc-comments": "warn",
            "jsdoc/empty-tags": "warn", // Recommended
            "jsdoc/escape-inline-tags": "warn", // Recommended for TS configs
            "jsdoc/implements-on-classes": "warn", // Recommended
            "jsdoc/imports-as-dependencies": "warn",
            "jsdoc/informative-docs": "off",
            "jsdoc/lines-before-block": "warn",
            "jsdoc/match-description": "off",
            "jsdoc/match-name": "off",
            "jsdoc/multiline-blocks": "warn", // Recommended
            "jsdoc/no-bad-blocks": "warn",
            "jsdoc/no-blank-block-descriptions": "warn",
            "jsdoc/no-blank-blocks": "off",
            "jsdoc/no-defaults": "warn", // Recommended
            "jsdoc/no-missing-syntax": "off",
            "jsdoc/no-multi-asterisks": "warn", // Recommended
            "jsdoc/no-restricted-syntax": "off",
            "jsdoc/no-types": "off", // Recommended for TS configs
            "jsdoc/no-undefined-types": "off", // Too noisy for tooling scripts
            "jsdoc/prefer-import-tag": "off",
            "jsdoc/reject-any-type": "off",
            "jsdoc/reject-function-type": "off",
            "jsdoc/require-asterisk-prefix": "warn",
            "jsdoc/require-description": "off",
            "jsdoc/require-description-complete-sentence": "off",
            "jsdoc/require-example": "off",
            "jsdoc/require-file-overview": "off",
            "jsdoc/require-hyphen-before-param-description": "warn",
            "jsdoc/require-jsdoc": "warn", // Recommended
            "jsdoc/require-next-description": "warn",
            "jsdoc/require-next-type": "warn", // Recommended
            "jsdoc/require-param": "off", // Too noisy for tooling scripts
            "jsdoc/require-param-description": "off", // Too noisy for tooling scripts
            "jsdoc/require-param-name": "warn", // Recommended
            "jsdoc/require-param-type": "off",
            "jsdoc/require-property": "warn", // Recommended
            "jsdoc/require-property-description": "warn", // Recommended
            "jsdoc/require-property-name": "warn", // Recommended
            "jsdoc/require-property-type": "warn", // Recommended in non-TS configs
            "jsdoc/require-rejects": "off", // Too noisy for tooling scripts
            "jsdoc/require-returns": "off", // Too noisy for tooling scripts
            "jsdoc/require-returns-check": "warn", // Recommended
            "jsdoc/require-returns-description": "off", // Too noisy for tooling scripts
            "jsdoc/require-returns-type": "off",
            "jsdoc/require-tags": "off",
            "jsdoc/require-template": "warn",
            "jsdoc/require-template-description": "warn",
            "jsdoc/require-throws": "off",
            "jsdoc/require-throws-description": "warn",
            "jsdoc/require-throws-type": "off",
            "jsdoc/require-yields": "warn", // Recommended
            "jsdoc/require-yields-check": "warn", // Recommended
            "jsdoc/require-yields-description": "warn",
            "jsdoc/require-yields-type": "warn", // Recommended
            "jsdoc/sort-tags": "off",
            "jsdoc/tag-lines": "off", // Recommended
            "jsdoc/text-escaping": [
                "warn",
                {
                    escapeHTML: true,
                },
            ],
            "jsdoc/ts-method-signature-style": "warn",
            "jsdoc/ts-no-empty-object-type": "warn",
            "jsdoc/ts-no-unnecessary-template-expression": "warn",
            "jsdoc/ts-prefer-function-type": "warn",
            "jsdoc/type-formatting": [
                "off",
                {
                    enableFixer: false,
                    objectFieldIndent: "  ",
                },
            ],
            "jsdoc/valid-types": "off", // Tooling scripts frequently use TS-style imports/types
            // "jsdoc/check-examples": "warn", // Deprecated and not for ESLint >= 8
            // "jsdoc/rejct-any-type": "warn", // broken
        },
        settings: {
            jsdoc: {
                // JS files in this repo use classic JSDoc.
                mode: "jsdoc",
            },
        },
    },
    // #endregion
    // #region 🧾 JS/MJS Configuration files
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: JS/MJS Configuration files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/*.config.{js,mjs,cts,cjs}",
            "**/*.config.**.*.{js,mjs,cts,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
        },
        name: "JS/MJS Config - **/*.config.{JS,MJS,CTS,CJS}",
        plugins: {
            "@typescript-eslint": tseslint,
            compat: pluginCompat,
            css: css,
            depend: depend,
            functional: functionalPlugin,
            "import-x": importX,
            js: js,
            "jsx-a11y": jsxA11y,
            math: eslintPluginMath,
            n: nodePlugin,
            "no-unsanitized": noUnsanitizedPlugin,
            perfectionist: pluginPerfectionist,
            "prefer-arrow": preferArrowPlugin,
            prettier: pluginPrettier,
            promise: pluginPromise,
            redos: pluginRedos,
            regexp: pluginRegexp,
            security: securityPlugin,
            sonarjs: sonarjs,
            "sort-class-members": sortClassMembersPlugin,
            tsdoc: pluginTsdoc,
            "tsdoc-require": pluginTSDocRequire,
            unicorn: eslintPluginUnicorn,
            "unused-imports": pluginUnusedImports,
            "write-good-comments": writeGoodCommentsPlugin,
        },
        rules: {
            ...js.configs.all.rules,
            ...pluginRegexp.configs.all.rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...eslintPluginUnicorn.configs.all.rules,
            ...jsxA11y.flatConfigs.strict.rules,
            ...sonarjsConfigs.recommended.rules,
            ...pluginPerfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*",
                },
            ],
            "class-methods-use-this": "off",
            "depend/ban-dependencies": [
                "warn",
                {
                    allowed: ["eslint-plugin-react", "axios"],
                },
            ],
            "dot-notation": "off",
            "func-style": "off",
            "id-length": "off",
            "max-classes-per-file": "off",
            "max-lines": "off",
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "no-console": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": ["warn", 30],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off", // Configs often use different scoping
            "unicorn/filename-case": "off", // Allow config files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
            "unicorn/no-await-expression-member": "off", // Allow await in config expressions
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-null": "off", // Null is common in config setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in config setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in config setups
            "unicorn/prevent-abbreviations": "off", // Too many false positives in configs
            "unused-imports/no-unused-imports": "error",
        },
        settings: {
            "import-x/resolver": {
                node: true,
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
        },
    },
    // #endregion
    // #region 🤖 GitHub Workflows YAML/YML
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Github Workflows YAML/YML
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/.github/workflows/**/*.{yaml,yml}",
            "config/tools/flatpak-build.yml",
            "**/dependabot.yml",
            "**/.spellcheck.yml",
            "**/.pre-commit-config.yaml",
        ],
        name: "YAML/YML GitHub Workflows - Disables",
        rules: {
            "yml/block-mapping-colon-indicator-newline": "off",
            "yml/no-empty-key": "off",
            "yml/no-empty-mapping-value": "off",
            "yml/sort-keys": "off",
        },
    },
    // #endregion
    // #region 📴 Disables
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Disables
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/package.json", "**/package-lock.json"],
        name: "JSON: Files - Disables",
        rules: {
            "json/sort-keys": "off",
        },
    },
    {
        files: ["**/.vscode/**"],
        name: "VS Code Files - Disables",
        rules: {
            "jsonc/array-bracket-newline": "off",
        },
    },
    // #endregion
    // #region 📐 @Stylistic Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: @Stylistic Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    // NOTE: uptime-watcher drift-guard and utility-type convention rules are
    // enabled (and scoped) by the internal repo presets:
    // `...uptimeWatcherRepoConfigs` and
    // `...uptimeWatcherTypeUtilsRepoConfigs`.
    // Keep them centralized there to avoid config drift.
    {
        files: ["**/**"],
        name: "Global: Stylistic Overrides",
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/curly-newline": "off",
            "@stylistic/exp-jsx-props-style": "off",
            "@stylistic/exp-list-style": "off",
            "@stylistic/line-comment-position": "off",
            "@stylistic/multiline-comment-style": "off",
            "@stylistic/spaced-comment": [
                "error",
                "always",
                {
                    exceptions: ["-", "+"],
                },
            ],
        },
    },
    // #endregion
    // #region 🛠️ Global Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    // MARK: Global Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Global: Globals",
        plugins: {
            canonical: canonicalPlugin,
            functional: functionalPlugin,
            "no-constructor-bind": noConstructorBindPlugin,
            "no-explicit-type-exports": noExplicitTypeExportsPlugin,
            "no-secrets": noSecrets,
            "no-unsanitized": noUnsanitizedPlugin,
            "prefer-arrow": preferArrowPlugin,
            "styled-components-a11y": styledA11yPlugin,
            "write-good-comments": writeGoodCommentsPlugin,
        },
        rules: {
            "callback-return": "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/import-specifier-newline": "off",
            // Deprecated rules - to be removed in future
            "functional/no-promise-reject": "off",
            "functional/no-this-expressions": "off",
            "functional/no-try-statements": "off",
            "functional/prefer-property-signatures": "off",
            // Functional
            "functional/prefer-tacit": "off",
            "functional/readonly-type": "off",
            "functional/type-declaration-immutability": "off",
            "no-console": "off",
            "no-constructor-bind/no-constructor-bind": "error",
            "no-constructor-bind/no-constructor-state": "error",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "no-empty-character-class": "error",
            "no-explicit-type-exports/no-explicit-type-exports": "error",
            "no-inline-comments": "off",
            "no-invalid-regexp": "error",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unexpected-multiline": "error",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-backreference": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow/prefer-arrow-functions": "off", // Too strict
            // Styled-components-a11y (and jsx-a11y equivalents)
            "styled-components-a11y/lang": "off",
            "write-good-comments/write-good-comments": "off", // Too strict,
        },
    },
    {
        files: [
            "electron/**/*.{ts,tsx}",
            "shared/**/*.{ts,tsx}",
            "src/**/*.{ts,tsx}",
        ],
        ignores: [
            "electron/test/**",
            "shared/test/**",
            "src/test/**",
            "tests/**",
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
            "benchmarks/**",
            "scripts/**",
            "storybook/**",
            "docs/**",
        ],
        name: "Global: AI Agent Guardrails (production)",
        plugins: {
            "@typescript-eslint": tseslint,
            canonical: canonicalPlugin,
        },
        rules: {
            // Encourage consistent typing; allow tests to be pragmatic.
            "@typescript-eslint/no-explicit-any": "error",
            // Prevent accidental barrel layers and cross-module drift.
            "canonical/no-re-export": "error",
        },
    },
    {
        files: [
            "electron/test/**/*.{ts,tsx}",
            "shared/test/**/*.{ts,tsx}",
            "src/test/**/*.{ts,tsx}",
            "tests/**/*.{ts,tsx}",
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
        ],
        name: "Global: AI Agent Guardrails (tests)",
        plugins: {
            "@typescript-eslint": tseslint,
            canonical: canonicalPlugin,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/strict-void-return": "warn",
            "canonical/no-re-export": "off",
        },
    },
    {
        files: [
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
            "src/test/**/*.{ts,tsx}",
            "tests/**/*.{ts,tsx}",
        ],
        name: "Tests: relax strict void rules",
        rules: {
            // This rule is extremely noisy in tests (especially property-based
            // tests) where callback return values are often incidental.
            "@typescript-eslint/strict-void-return": "off",
        },
    },
    {
        files: [
            "benchmarks/**/*.{ts,tsx}",
            "electron/test/**/*.{ts,tsx}",
            "scripts/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}",
        ],
        name: "Benchmarks/Scripts: relax strict void rules",
        rules: {
            // Benchmarks frequently return measurement values from callbacks.
            // Scripts commonly use void/Promise-returning callbacks where the
            // return value is intentionally ignored.
            "@typescript-eslint/strict-void-return": "off",
        },
    },
    // Ensure Electron override wins over any later preset configs.
    {
        files: ["electron/**/*.{ts,tsx}"],
        ignores: ["electron/test/**/*"],
        name: "Electron: disable unicorn import.meta suggestions",
        rules: {
            "unicorn/prefer-import-meta-properties": "off",
        },
    },
    // #endregion
    // #region 🧹 Prettier Disable Config
    eslintConfigPrettier,
    // #endregion
]);
