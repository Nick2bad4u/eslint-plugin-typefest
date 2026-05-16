/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-required-keys-of` behavior.
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
const ruleId = "prefer-type-fest-required-keys-of";
const docsDescription =
    "require TypeFest RequiredKeysOf over expanded required-key extraction helpers.";
const message =
    "Prefer `RequiredKeysOf<T>` from type-fest over expanded required-key extraction helpers.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const genericNameArbitrary = fc.constantFrom("Type", "Entity", "Options");

const toRequiredKeysOfHelper = (
    genericName: string,
    optionalKeysName = "OptionalKeysOf"
): string =>
    `${genericName} extends unknown ? Exclude<keyof ${genericName}, ${optionalKeysName}<${genericName}>> : never`;

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferRequiredKeysOf: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-required-keys-of parse-safety guards", () => {
    it("fast-check: RequiredKeysOf replacement remains parseable", () => {
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
                        'import type { OptionalKeysOf } from "type-fest";',
                        `type Result<${genericName} extends object> = ${toRequiredKeysOfHelper(genericName)};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { OptionalKeysOf } from "type-fest";',
                        'import type { RequiredKeysOf } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = RequiredKeysOf<${genericName}>;`,
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
                `type Result<Type extends object> = ${toRequiredKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferRequiredKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports exact OptionalKeysOf exclusion extraction",
            output: [
                'import type { OptionalKeysOf } from "type-fest";',
                'import type { RequiredKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = RequiredKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { OptionalKeysOf as Optionals, RequiredKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toRequiredKeysOfHelper("Type", "Optionals")};`,
            ].join("\n"),
            errors: [{ messageId: "preferRequiredKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased OptionalKeysOf exclusion extraction",
            output: [
                'import type { OptionalKeysOf as Optionals, RequiredKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = RequiredKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { RequiredKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toRequiredKeysOfHelper("Type", "TypeFest.OptionalKeysOf")};`,
            ].join("\n"),
            errors: [{ messageId: "preferRequiredKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified OptionalKeysOf exclusion extraction",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { RequiredKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = RequiredKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { OptionalKeysOf } from "type-fest";',
                "",
                `type Result<RequiredKeysOf, Type extends object> = ${toRequiredKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferRequiredKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when RequiredKeysOf is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { RequiredKeysOf } from "type-fest"; type Result<Type extends object> = RequiredKeysOf<Type>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing RequiredKeysOf usage",
        },
        {
            code: `type Result<Type extends object> = ${toRequiredKeysOfHelper("Type")};`,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local OptionalKeysOf helpers",
        },
        {
            code: 'import type { OptionalKeysOf } from "type-fest"; type Result<Type extends object> = Exclude<keyof Type, OptionalKeysOf<Type>>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores helpers without distributive TypeFest wrapper",
        },
        {
            code: 'import type { OptionalKeysOf } from "type-fest"; type Result<Type extends object> = Type extends unknown ? Exclude<OptionalKeysOf<Type>, keyof Type> : never;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores reversed exclusion helpers",
        },
    ],
});
