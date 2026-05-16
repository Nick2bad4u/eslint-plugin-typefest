/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-readonly-keys-of` behavior.
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
const ruleId = "prefer-type-fest-readonly-keys-of";
const docsDescription =
    "require TypeFest ReadonlyKeysOf over expanded readonly-key extraction helpers.";
const message =
    "Prefer `ReadonlyKeysOf<T>` from type-fest over expanded readonly-key extraction helpers.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const genericNameArbitrary = fc.constantFrom("Type", "Entity", "Options");

const toReadonlyKeysOfHelper = (
    genericName: string,
    guardName = "IsReadonlyKeyOf"
): string =>
    `${genericName} extends unknown ? (keyof {[Key in keyof ${genericName} as ${guardName}<${genericName}, Key> extends false ? never : Key]: never}) & keyof ${genericName} : never`;

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferReadonlyKeysOf: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-readonly-keys-of parse-safety guards", () => {
    it("fast-check: ReadonlyKeysOf replacement remains parseable", () => {
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
                        'import type { IsReadonlyKeyOf } from "type-fest";',
                        `type Result<${genericName} extends object> = ${toReadonlyKeysOfHelper(genericName)};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsReadonlyKeyOf } from "type-fest";',
                        'import type { ReadonlyKeysOf } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = ReadonlyKeysOf<${genericName}>;`,
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
                'import type { IsReadonlyKeyOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toReadonlyKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferReadonlyKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports exact IsReadonlyKeyOf mapped extraction",
            output: [
                'import type { IsReadonlyKeyOf } from "type-fest";',
                'import type { ReadonlyKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = ReadonlyKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { IsReadonlyKeyOf as IsReadonly, ReadonlyKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toReadonlyKeysOfHelper("Type", "IsReadonly")};`,
            ].join("\n"),
            errors: [{ messageId: "preferReadonlyKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased IsReadonlyKeyOf mapped extraction",
            output: [
                'import type { IsReadonlyKeyOf as IsReadonly, ReadonlyKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = ReadonlyKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { ReadonlyKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toReadonlyKeysOfHelper("Type", "TypeFest.IsReadonlyKeyOf")};`,
            ].join("\n"),
            errors: [{ messageId: "preferReadonlyKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified IsReadonlyKeyOf mapped extraction",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { ReadonlyKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = ReadonlyKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { IsReadonlyKeyOf } from "type-fest";',
                "",
                `type Result<ReadonlyKeysOf, Type extends object> = ${toReadonlyKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferReadonlyKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when ReadonlyKeysOf is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { ReadonlyKeysOf } from "type-fest"; type Result<Type extends object> = ReadonlyKeysOf<Type>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing ReadonlyKeysOf usage",
        },
        {
            code: `type Result<Type extends object> = ${toReadonlyKeysOfHelper("Type")};`,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local IsReadonlyKeyOf helpers",
        },
        {
            code: 'import type { IsReadonlyKeyOf } from "type-fest"; type Result<Type extends object> = keyof {[Key in keyof Type as IsReadonlyKeyOf<Type, Key> extends false ? never : Key]: never};',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores helpers without distributive TypeFest wrapper",
        },
        {
            code: 'import type { IsReadonlyKeyOf } from "type-fest"; type Result<Type extends object> = Type extends unknown ? (keyof {[Key in keyof Type as IsReadonlyKeyOf<Type, Key> extends true ? never : Key]: never}) & keyof Type : never;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted mapped-name checks",
        },
    ],
});
