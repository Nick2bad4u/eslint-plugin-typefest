/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-has-optional-keys` behavior.
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
const ruleId = "prefer-type-fest-has-optional-keys";
const docsDescription =
    "require TypeFest HasOptionalKeys over OptionalKeysOf<T> emptiness checks.";
const message =
    "Prefer `HasOptionalKeys<T>` from type-fest over `OptionalKeysOf<T> extends never ? false : true` optional-key checks.";
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
        preferHasOptionalKeys: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-has-optional-keys parse-safety guards", () => {
    it("fast-check: HasOptionalKeys replacement remains parseable", () => {
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
                        'import type { OptionalKeysOf } from "type-fest";',
                        `type Result<${genericName} extends object> = OptionalKeysOf<${genericName}> extends never ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { OptionalKeysOf } from "type-fest";',
                        'import type { HasOptionalKeys } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = HasOptionalKeys<${genericName}>;`,
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
                'import type { OptionalKeysOf } from "type-fest";',
                "",
                "type Result<T extends object> = OptionalKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasOptionalKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports direct OptionalKeysOf emptiness checks",
            output: [
                'import type { OptionalKeysOf } from "type-fest";',
                'import type { HasOptionalKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasOptionalKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { OptionalKeysOf as OptionalKeys, HasOptionalKeys } from "type-fest";',
                "",
                "type Result<T extends object> = OptionalKeys<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasOptionalKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased OptionalKeysOf emptiness checks",
            output: [
                'import type { OptionalKeysOf as OptionalKeys, HasOptionalKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasOptionalKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasOptionalKeys } from "type-fest";',
                "",
                "type Result<T extends object> = TypeFest.OptionalKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasOptionalKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified OptionalKeysOf emptiness checks",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { HasOptionalKeys } from "type-fest";',
                "",
                "type Result<T extends object> = HasOptionalKeys<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { OptionalKeysOf } from "type-fest";',
                "",
                "type Result<HasOptionalKeys, T extends object> = OptionalKeysOf<T> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferHasOptionalKeys" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when HasOptionalKeys is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { HasOptionalKeys } from "type-fest"; type Result<T extends object> = HasOptionalKeys<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing HasOptionalKeys usage",
        },
        {
            code: "type Result<T extends object> = OptionalKeysOf<T> extends never ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local OptionalKeysOf helpers",
        },
        {
            code: 'import type { OptionalKeysOf } from "type-fest"; type Result<T extends object> = OptionalKeysOf<T> extends never ? true : false;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted emptiness checks",
        },
        {
            code: 'import type { OptionalKeysOf } from "type-fest"; type Result<T extends object> = OptionalKeysOf<T> extends string ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-never checks",
        },
    ],
});
