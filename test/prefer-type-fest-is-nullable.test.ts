/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-nullable` behavior.
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
const ruleId = "prefer-type-fest-is-nullable";
const docsDescription =
    "require TypeFest IsNullable over equivalent any-safe nullable conditional type guards.";
const message =
    "Prefer `IsNullable<T>` from type-fest over equivalent any-safe nullable conditional type guards.";

const invalidCode = [
    'import type { IsAny } from "type-fest";',
    "",
    "type Result<T> = IsAny<T> extends true ? true : Extract<T, null> extends never ? false : true;",
].join("\n");
const invalidOutput = [
    'import type { IsAny } from "type-fest";',
    'import type { IsNullable } from "type-fest";',
    "",
    "type Result<T> = IsNullable<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Result<IsNullable, T> = 0 extends 1 & T ? true : Extract<T, null> extends never ? false : true;";
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;
const generatedParameterNameArbitrary = fc.constantFrom(
    "T",
    "Value",
    "Input",
    "Candidate"
);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferIsNullable: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-nullable parse-safety guards", () => {
    it("fast-check: IsNullable replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedParameterNameArbitrary,
                fc.boolean(),
                (parameterName, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        `type Result<${parameterName}> = 0 extends 1 & ${parameterName} ? true : Extract<${parameterName}, null> extends never ? false : true;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsNullable } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName}> = IsNullable<${parameterName}>;`,
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
            code: invalidCode,
            errors: [{ messageId: "preferIsNullable" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports TypeFest IsAny plus Extract null guards",
            output: invalidOutput,
        },
        {
            code: [
                'import type { IsAny as IsAnything, IsNullable } from "type-fest";',
                "",
                "type Result<T> = IsAnything<T> extends true ? true : Extract<T, null> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferIsNullable" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports aliased TypeFest IsAny guards",
            output: [
                'import type { IsAny as IsAnything, IsNullable } from "type-fest";',
                "",
                "type Result<T> = IsNullable<T>;",
            ].join("\n"),
        },
        {
            code: [
                'import type * as TypeFest from "type-fest";',
                'import type { IsNullable } from "type-fest";',
                "",
                "type Result<T> = TypeFest.IsAny<T> extends true ? true : Extract<T, null> extends never ? false : true;",
            ].join("\n"),
            errors: [{ messageId: "preferIsNullable" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports namespace-qualified TypeFest IsAny guards",
            output: [
                'import type * as TypeFest from "type-fest";',
                'import type { IsNullable } from "type-fest";',
                "",
                "type Result<T> = IsNullable<T>;",
            ].join("\n"),
        },
        {
            code: "type Result<T> = 0 extends 1 & T ? true : Extract<T, null> extends never ? false : true;",
            errors: [{ messageId: "preferIsNullable" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports canonical manual any-safe nullable guards",
            output: [
                'import type { IsNullable } from "type-fest";',
                "type Result<T> = IsNullable<T>;",
            ].join("\n"),
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsNullable" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsNullable is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsNullable } from "type-fest"; type Result<T> = IsNullable<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsNullable usage",
        },
        {
            code: "type Result<T> = Extract<T, null> extends never ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores nullable checks without any-safe handling",
        },
        {
            code: 'import type { IsAny } from "type-fest"; type Result<T> = IsAny<T> extends true ? true : Extract<T, undefined> extends never ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores undefined extraction",
        },
        {
            code: [
                "type IsAny<T> = true;",
                "type Result<T> = IsAny<T> extends true ? true : Extract<T, null> extends never ? false : true;",
            ].join("\n"),
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores local IsAny helpers",
        },
        {
            code: 'import type { IsAny } from "type-fest"; type Result<T, U> = IsAny<T> extends true ? true : Extract<U, null> extends never ? false : true;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores mismatched outer and inner inputs",
        },
    ],
});
