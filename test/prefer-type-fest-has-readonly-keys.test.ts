/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-has-readonly-keys` behavior.
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
const ruleId = "prefer-type-fest-has-readonly-keys";
const docsDescription =
    "require TypeFest HasReadonlyKeys over ReadonlyKeysOf<T> emptiness checks.";
const message =
    "Prefer `HasReadonlyKeys<T>` from type-fest over `ReadonlyKeysOf<T> extends never ? false : true` readonly-key checks.";
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
        preferHasReadonlyKeys: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-has-readonly-keys parse-safety guards", () => {
    it("fast-check: HasReadonlyKeys replacement remains parseable", () => {
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
                        'import type { ReadonlyKeysOf } from "type-fest";',
                        `type Result<${genericName} extends object> = ReadonlyKeysOf<${genericName}> extends never ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { ReadonlyKeysOf } from "type-fest";',
                        'import type { HasReadonlyKeys } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = HasReadonlyKeys<${genericName}>;`,
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
                'import type { ReadonlyKeysOf } from "type-fest";',
                "",
                "type Result<T extends object> = ReadonlyKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasReadonlyKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports direct ReadonlyKeysOf emptiness checks",
            output: [
                'import type { ReadonlyKeysOf } from "type-fest";',
                'import type { HasReadonlyKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasReadonlyKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { ReadonlyKeysOf as ReadonlyKeys, HasReadonlyKeys } from "type-fest";',
                "",
                "type Result<T extends object> = ReadonlyKeys<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasReadonlyKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased ReadonlyKeysOf emptiness checks",
            output: [
                'import type { ReadonlyKeysOf as ReadonlyKeys, HasReadonlyKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasReadonlyKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasReadonlyKeys } from "type-fest";',
                "",
                "type Result<T extends object> = TypeFest.ReadonlyKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasReadonlyKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified ReadonlyKeysOf emptiness checks",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasReadonlyKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasReadonlyKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { ReadonlyKeysOf } from "type-fest";',
                "",
                "type Result<HasReadonlyKeys, T extends object> = ReadonlyKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasReadonlyKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when HasReadonlyKeys is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { HasReadonlyKeys } from "type-fest"; type Result<T extends object> = HasReadonlyKeys<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing HasReadonlyKeys usage",
        },
        {
            code: "type Result<T extends object> = ReadonlyKeysOf<T> extends never ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local ReadonlyKeysOf helpers",
        },
        {
            code: 'import type { ReadonlyKeysOf } from "type-fest"; type Result<T extends object> = ReadonlyKeysOf<T> extends never ? true : false;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted emptiness checks",
        },
        {
            code: 'import type { ReadonlyKeysOf } from "type-fest"; type Result<T extends object> = ReadonlyKeysOf<T> extends string ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-never checks",
        },
    ],
});
