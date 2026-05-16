/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable-keys-of` behavior.
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
const ruleId = "prefer-type-fest-writable-keys-of";
const docsDescription =
    "require TypeFest WritableKeysOf over expanded writable-key extraction helpers.";
const message =
    "Prefer `WritableKeysOf<T>` from type-fest over expanded writable-key extraction helpers.";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const genericNameArbitrary = fc.constantFrom("Type", "Entity", "Options");

const toWritableKeysOfHelper = (
    genericName: string,
    readonlyKeysName = "ReadonlyKeysOf"
): string =>
    `${genericName} extends unknown ? Exclude<keyof ${genericName}, ${readonlyKeysName}<${genericName}>> : never`;

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferWritableKeysOf: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-writable-keys-of parse-safety guards", () => {
    it("fast-check: WritableKeysOf replacement remains parseable", () => {
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
                        'import type { ReadonlyKeysOf } from "type-fest";',
                        `type Result<${genericName} extends object> = ${toWritableKeysOfHelper(genericName)};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { ReadonlyKeysOf } from "type-fest";',
                        'import type { WritableKeysOf } from "type-fest";',
                        unicodeLine,
                        `type Result<${genericName} extends object> = WritableKeysOf<${genericName}>;`,
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
                `type Result<Type extends object> = ${toWritableKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferWritableKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports exact ReadonlyKeysOf exclusion extraction",
            output: [
                'import type { ReadonlyKeysOf } from "type-fest";',
                'import type { WritableKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = WritableKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { ReadonlyKeysOf as ReadonlyKeys, WritableKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toWritableKeysOfHelper("Type", "ReadonlyKeys")};`,
            ].join("\n"),
            errors: [{ messageId: "preferWritableKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased ReadonlyKeysOf exclusion extraction",
            output: [
                'import type { ReadonlyKeysOf as ReadonlyKeys, WritableKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = WritableKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { WritableKeysOf } from "type-fest";',
                "",
                `type Result<Type extends object> = ${toWritableKeysOfHelper("Type", "TypeFest.ReadonlyKeysOf")};`,
            ].join("\n"),
            errors: [{ messageId: "preferWritableKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified ReadonlyKeysOf exclusion extraction",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { WritableKeysOf } from "type-fest";',
                "",
                "type Result<Type extends object> = WritableKeysOf<Type>;",
            ].join("\n"),
        },
        {
            code: [
                'import type { ReadonlyKeysOf } from "type-fest";',
                "",
                `type Result<WritableKeysOf, Type extends object> = ${toWritableKeysOfHelper("Type")};`,
            ].join("\n"),
            errors: [{ messageId: "preferWritableKeysOf" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when WritableKeysOf is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { WritableKeysOf } from "type-fest"; type Result<Type extends object> = WritableKeysOf<Type>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing WritableKeysOf usage",
        },
        {
            code: `type Result<Type extends object> = ${toWritableKeysOfHelper("Type")};`,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local ReadonlyKeysOf helpers",
        },
        {
            code: 'import type { ReadonlyKeysOf } from "type-fest"; type Result<Type extends object> = Exclude<keyof Type, ReadonlyKeysOf<Type>>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores helpers without distributive TypeFest wrapper",
        },
        {
            code: 'import type { ReadonlyKeysOf } from "type-fest"; type Result<Type extends object> = Type extends unknown ? Exclude<ReadonlyKeysOf<Type>, keyof Type> : never;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores reversed exclusion helpers",
        },
    ],
});
