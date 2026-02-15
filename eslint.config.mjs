import comments from "@eslint-community/eslint-plugin-eslint-comments";
import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";
import tseslintParser from "@typescript-eslint/parser";
import pluginCanonical from "eslint-plugin-canonical";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
import eslintPluginEslintPlugin from "eslint-plugin-eslint-plugin";
import etc from "eslint-plugin-etc";
import importX from "eslint-plugin-import-x";
import jsdocPlugin from "eslint-plugin-jsdoc";
import listeners from "eslint-plugin-listeners";
import eslintPluginMath from "eslint-plugin-math";
import moduleInterop from "eslint-plugin-module-interop";
import nodePlugin from "eslint-plugin-n";
import pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import pluginPerfectionist from "eslint-plugin-perfectionist";
import pluginPromise from "eslint-plugin-promise";
import pluginReact from "eslint-plugin-react";
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
import pluginJSDoc from "eslint-plugin-require-jsdoc";
import pluginSecurity from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import pluginSortClassMembers from "eslint-plugin-sort-class-members";
import pluginTotalFunctions from "eslint-plugin-total-functions";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import xss from "eslint-plugin-xss";
import zod from "eslint-plugin-zod";
import globals from "globals";
import path from "node:path";
import tseslint from "typescript-eslint";

/**
 * @param {unknown} configLike
 * @returns {Record<string, unknown>}
 */
const /**
 * @param {...unknown} configLikes
 * @returns {Record<string, unknown>}
 */
 mergePresetRules = (...configLikes) =>
    Object.assign({}, ...configLikes.map((configLike) => rulesFrom(configLike))),

rulesFrom = (configLike) => {
    const configs = Array.isArray(configLike) ? configLike : [configLike];

    return Object.assign(
        {},
        ...configs.map((configItem) => {
            if (
                typeof configItem === "object" &&
                configItem !== null &&
                "rules" in configItem &&
                typeof configItem.rules === "object" &&
                configItem.rules !== null
            ) {
                return configItem.rules;
            }

            return {};
        })
    );
},

 sonarjsConfigs = sonarjs.configs ?? {},
 tsConfigs = tseslint.configs ?? {};

export default [
    {
        ignores: [
            ".cache/**",
            "coverage/**",
            "dist/**",
            "node_modules/**",
        ],
    },
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
                tsconfigRootDir: path.resolve(import.meta.dirname),
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "ESLint Plugin Source Files - project/**/*.*",
        plugins: {
            "@eslint-community/eslint-comments": comments,
            "@microsoft/sdl": pluginMicrosoftSdl,
            "@typescript-eslint": tseslint.plugin ?? tseslint,
            canonical: pluginCanonical,
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
            react: pluginReact,
            redos: pluginRedos,
            regexp: pluginRegexp,
            "require-jsdoc": pluginJSDoc,
            security: pluginSecurity,
            sonarjs,
            "sort-class-members": pluginSortClassMembers,
            "total-functions": fixupPluginRules(pluginTotalFunctions),
            unicorn: eslintPluginUnicorn,
            xss,
            zod,
        },
        rules: {
            ...mergePresetRules(
                eslintPluginEslintPlugin.configs?.["all-type-checked"],
                js.configs?.all,
                tsConfigs.recommendedTypeChecked ??
                    tsConfigs.recommendedTypeChecked,
                tsConfigs.recommended ?? tsConfigs.recommended,
                tsConfigs.strictTypeChecked ?? tsConfigs.strictTypeChecked,
                tsConfigs.strict ?? tsConfigs.strict,
                tsConfigs.stylisticTypeChecked ??
                    tsConfigs.stylisticTypeChecked,
                tsConfigs.stylistic ?? tsConfigs.stylistic,
                pluginRegexp.configs?.all,
                importX.flatConfigs?.recommended,
                importX.flatConfigs?.typescript,
                pluginPromise.configs?.["flat/recommended"],
                eslintPluginUnicorn.configs?.all,
                sonarjsConfigs.recommended,
                pluginPerfectionist.configs?.["recommended-natural"],
                pluginSecurity.configs?.recommended,
                nodePlugin.configs?.["flat/all"],
                eslintPluginMath.configs?.recommended,
                comments.configs?.recommended,
                pluginCanonical.configs?.recommended,
                pluginSortClassMembers.configs?.["flat/recommended"],
                eslintPluginNoUseExtendNative.configs?.recommended,
                pluginMicrosoftSdl.configs?.required,
                listeners.configs?.strict,
                moduleInterop.configs?.recommended,
                pluginTotalFunctions.configs?.recommended,
                etc.configs?.recommended,
                zod.configs?.recommended
            ),

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
                    encoders: ["utils.htmlEncode()", "CSS.escape()", "Number()"],
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
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            canonical: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/import-specifier-newline": "off",
            "canonical/id-match": "off",
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
            "new-cap": "off",
            "n/no-mixed-requires": "off",
            "n/no-extraneous-import": "off",
            "n/no-sync": "off",
            "n/no-unsupported-features/node-builtins": "off",
            "no-continue": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-ternary": "off",
            "no-underscore-dangle": "off",
            "no-undefined": "off",
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
            "unicorn/prevent-abbreviations": "off",
        },
    },
    {
        files: ["test/**/*.{test,spec}.{ts,tsx}", "test/**/*.{ts,tsx}"],
        name: "ESLint Plugin Tests - internal tooling",
        rules: {
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            canonical: "off",
            "canonical/id-match": "off",
            eqeqeq: "off",
            "func-style": "off",
            "max-statements": "off",
            "n/no-sync": "off",
            "n/no-missing-import": "off",
            "n/no-unpublished-import": "off",
            "no-magic-numbers": "off",
            "no-ternary": "off",
            "no-underscore-dangle": "off",
            "no-undefined": "off",
            "no-use-before-define": "off",
            "one-var": "off",
            "sort-imports": "off",
            "unicorn/import-style": "off",
            "unicorn/no-array-callback-reference": "off",
            "unicorn/no-null": "off",
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
];
