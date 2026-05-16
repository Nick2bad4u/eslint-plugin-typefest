/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-is-any` behavior.
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
const ruleId = "prefer-type-fest-is-any";
const docsDescription =
    "require TypeFest IsAny over manual `0 extends 1 & T` conditional type guards.";
const message =
    "Prefer `IsAny<T>` from type-fest over manual `0 extends 1 & T` conditional type guards.";

const invalidCode = "type Result<T> = 0 extends 1 & T ? true : false;";
const invalidOutput = [
    'import type { IsAny } from "type-fest";',
    "type Result<T> = IsAny<T>;",
].join("\n");
const noInferInvalidCode =
    "type Result<T> = 0 extends 1 & NoInfer<T> ? true : false;";
const noInferInvalidOutput = [
    'import type { IsAny } from "type-fest";',
    "type Result<T> = IsAny<T>;",
].join("\n");
const shadowedInvalidCode =
    "type Result<IsAny, T> = 0 extends 1 & T ? true : false;";
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
const anyGuardWrapperArbitrary = fc.constantFrom<"bare" | "noInfer">(
    "bare",
    "noInfer"
);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferIsAny: message,
    },
    name: ruleId,
});

describe("prefer-type-fest-is-any parse-safety guards", () => {
    it("fast-check: IsAny replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedParameterNameArbitrary,
                anyGuardWrapperArbitrary,
                fc.boolean(),
                (parameterName, wrapper, includeUnicodeLine) => {
                    const candidateType =
                        wrapper === "bare"
                            ? parameterName
                            : `NoInfer<${parameterName}>`;
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        `type Result<${parameterName}> = 0 extends 1 & ${candidateType} ? true : false;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");
                    const fixedCode = [
                        'import type { IsAny } from "type-fest";',
                        unicodeLine,
                        `type Result<${parameterName}> = IsAny<${parameterName}>;`,
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
            errors: [{ messageId: "preferIsAny" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports manual any conditional guards",
            output: invalidOutput,
        },
        {
            code: noInferInvalidCode,
            errors: [{ messageId: "preferIsAny" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports manual any guards wrapped in NoInfer",
            output: noInferInvalidOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferIsAny" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports without autofix when IsAny is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { IsAny } from "type-fest"; type Result<T> = IsAny<T>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing IsAny usage",
        },
        {
            code: "type Result<T> = 1 extends 1 & T ? true : false;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores non-canonical numeric guards",
        },
        {
            code: "type Result<T> = 0 extends 1 & T ? false : true;",
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores inverted boolean branches",
        },
    ],
});
