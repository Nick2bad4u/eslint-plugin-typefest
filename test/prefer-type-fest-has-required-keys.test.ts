/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-has-required-keys` behavior.
 */
import parser from "@typescript-eslint/parser";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-has-required-keys";
const docsDescription =
    "require TypeFest HasRequiredKeys over RequiredKeysOf<T> emptiness checks.";
const message =
    "Prefer `HasRequiredKeys<T>` from type-fest over `RequiredKeysOf<T> extends never ? false : true` required-key checks.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const generatedGenericNameArbitrary = fc.constantFrom(
    "T",
    "Entity",
    "Options",
    "Input"
);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferHasRequiredKeys: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-has-required-keys parse-safety guards", () => {
    it("fast-check: HasRequiredKeys replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedGenericNameArbitrary,
                fc.boolean(),
                (genericName, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { RequiredKeysOf } from "type-fest";',
                        `type Result<${genericName} extends object> = RequiredKeysOf<${genericName}> extends never ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { RequiredKeysOf } from "type-fest";',
                        'import type { HasRequiredKeys } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = HasRequiredKeys<${genericName}>;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    expect(() => {
                        parser.parseForESLint(generatedCode, parserOptions);
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: [
                'import type { RequiredKeysOf } from "type-fest";',
                "",
                "type Result<T extends object> = RequiredKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasRequiredKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports direct RequiredKeysOf emptiness checks",
            output: [
                'import type { RequiredKeysOf } from "type-fest";',
                'import type { HasRequiredKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasRequiredKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { RequiredKeysOf as RequiredKeys, HasRequiredKeys } from "type-fest";',
                "",
                "type Result<T extends object> = RequiredKeys<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasRequiredKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased RequiredKeysOf emptiness checks",
            output: [
                'import type { RequiredKeysOf as RequiredKeys, HasRequiredKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasRequiredKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasRequiredKeys } from "type-fest";',
                "",
                "type Result<T extends object> = TypeFest.RequiredKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasRequiredKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified RequiredKeysOf emptiness checks",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasRequiredKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasRequiredKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { RequiredKeysOf } from "type-fest";',
                "",
                "type Result<HasRequiredKeys, T extends object> = RequiredKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasRequiredKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when HasRequiredKeys is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { HasRequiredKeys } from "type-fest"; type Result<T extends object> = HasRequiredKeys<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing HasRequiredKeys usage",
        },
        {
            code: "type Result<T extends object> = RequiredKeysOf<T> extends never ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local RequiredKeysOf helpers",
        },
        {
            code: 'import type { RequiredKeysOf } from "type-fest"; type Result<T extends object> = RequiredKeysOf<T> extends never ? true : false;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted emptiness checks",
        },
        {
            code: 'import type { RequiredKeysOf } from "type-fest"; type Result<T extends object> = RequiredKeysOf<T> extends string ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-never checks",
        },
    ],
});
