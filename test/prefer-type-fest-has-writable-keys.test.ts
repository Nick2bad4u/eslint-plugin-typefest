/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-has-writable-keys` behavior.
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
const ruleId = "prefer-type-fest-has-writable-keys";
const docsDescription =
    "require TypeFest HasWritableKeys over WritableKeysOf<T> emptiness checks.";
const message =
    "Prefer `HasWritableKeys<T>` from type-fest over `WritableKeysOf<T> extends never ? false : true` writable-key checks.";
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
        preferHasWritableKeys: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-has-writable-keys parse-safety guards", () => {
    it("fast-check: HasWritableKeys replacement remains parseable", () => {
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
                        'import type { WritableKeysOf } from "type-fest";',
                        `type Result<${genericName} extends object> = WritableKeysOf<${genericName}> extends never ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { WritableKeysOf } from "type-fest";',
                        'import type { HasWritableKeys } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = HasWritableKeys<${genericName}>;`,
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
                'import type { WritableKeysOf } from "type-fest";',
                "",
                "type Result<T extends object> = WritableKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasWritableKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports direct WritableKeysOf emptiness checks",
            output: [
                'import type { WritableKeysOf } from "type-fest";',
                'import type { HasWritableKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasWritableKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { WritableKeysOf as WritableKeys, HasWritableKeys } from "type-fest";',
                "",
                "type Result<T extends object> = WritableKeys<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasWritableKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased WritableKeysOf emptiness checks",
            output: [
                'import type { WritableKeysOf as WritableKeys, HasWritableKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasWritableKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasWritableKeys } from "type-fest";',
                "",
                "type Result<T extends object> = TypeFest.WritableKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasWritableKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified WritableKeysOf emptiness checks",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasWritableKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasWritableKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { WritableKeysOf } from "type-fest";',
                "",
                "type Result<HasWritableKeys, T extends object> = WritableKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasWritableKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when HasWritableKeys is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { HasWritableKeys } from "type-fest"; type Result<T extends object> = HasWritableKeys<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing HasWritableKeys usage",
        },
        {
            code: "type Result<T extends object> = WritableKeysOf<T> extends never ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local WritableKeysOf helpers",
        },
        {
            code: 'import type { WritableKeysOf } from "type-fest"; type Result<T extends object> = WritableKeysOf<T> extends never ? true : false;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted emptiness checks",
        },
        {
            code: 'import type { WritableKeysOf } from "type-fest"; type Result<T extends object> = WritableKeysOf<T> extends string ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-never checks",
        },
    ],
});
