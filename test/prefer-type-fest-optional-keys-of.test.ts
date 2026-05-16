/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-optional-keys-of` behavior.
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
const ruleId = "prefer-type-fest-optional-keys-of";
const docsDescription =
    "require TypeFest OptionalKeysOf over expanded optional-key extraction helpers.";
const message =
    "Prefer `OptionalKeysOf<T>` from type-fest over expanded optional-key extraction helpers.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const genericNameArbitrary = fc.constantFrom("Type", "Entity", "Options");

const toOptionalKeysOfHelper = (
    genericName: string,
    guardName = "IsOptionalKeyOf"
): string =>
    `${genericName} extends unknown ? (keyof {[Key in keyof ${genericName} as ${guardName}<${genericName}, Key> extends false ? never : Key]: never}) & keyof ${genericName} : never`;

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferOptionalKeysOf: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-optional-keys-of parse-safety guards", () => {
    it("fast-check: OptionalKeysOf replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                genericNameArbitrary,
                fc.boolean(),
                (genericName, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { IsOptionalKeyOf } from "type-fest";',
                        `type Result<${genericName} extends object> = ${toOptionalKeysOfHelper(genericName)};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsOptionalKeyOf } from "type-fest";',
                        'import type { OptionalKeysOf } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = OptionalKeysOf<${genericName}>;`,
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
                'import type { IsOptionalKeyOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toOptionalKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferOptionalKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports exact IsOptionalKeyOf mapped extraction",
            output: [
                'import type { IsOptionalKeyOf } from "type-fest";',
                'import type { OptionalKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = OptionalKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { IsOptionalKeyOf as IsOptional, OptionalKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toOptionalKeysOfHelper("Type", "IsOptional")};`,
            ].join("\n"),
            errors: [{ messageId: "preferOptionalKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased IsOptionalKeyOf mapped extraction",
            output: [
                'import type { IsOptionalKeyOf as IsOptional, OptionalKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = OptionalKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { OptionalKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toOptionalKeysOfHelper("Type", "TypeFest.IsOptionalKeyOf")};`,
            ].join("\n"),
            errors: [{ messageId: "preferOptionalKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified IsOptionalKeyOf mapped extraction",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { OptionalKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = OptionalKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { IsOptionalKeyOf } from "type-fest";',
                "",
                `type Result<OptionalKeysOf, Type extends object> = ${toOptionalKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferOptionalKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when OptionalKeysOf is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { OptionalKeysOf } from "type-fest"; type Result<Type extends object> = OptionalKeysOf<Type>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing OptionalKeysOf usage",
        },
        {
            code: `type Result<Type extends object> = ${toOptionalKeysOfHelper("Type")};`,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local IsOptionalKeyOf helpers",
        },
        {
            code: 'import type { IsOptionalKeyOf } from "type-fest"; type Result<Type extends object> = keyof {[Key in keyof Type as IsOptionalKeyOf<Type, Key> extends false ? never : Key]: never};',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores helpers without distributive TypeFest wrapper",
        },
        {
            code: 'import type { IsOptionalKeyOf } from "type-fest"; type Result<Type extends object> = Type extends unknown ? (keyof {[Key in keyof Type as IsOptionalKeyOf<Type, Key> extends true ? never : Key]: never}) & keyof Type : never;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted mapped-name checks",
        },
    ],
});
