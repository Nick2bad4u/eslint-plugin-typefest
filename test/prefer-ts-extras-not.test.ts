/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-not.test` behavior.
 */
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-not");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-not.valid.ts";
const invalidFixtureName = "prefer-ts-extras-not.invalid.ts";
const inlineInvalidArrowNegatedPredicateCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineInvalidArrowNegatedPredicateOutput = [
    'import { not } from "ts-extras";',
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(not(isPresent));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidFilterWithoutArgumentsCode = [
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const maybeEntries = nullableEntries.filter();",
    "",
    "String(maybeEntries.length);",
].join("\n");
const inlineValidMapNegatedPredicateCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const mappedEntries = nullableEntries.map((value) => !isPresent(value));",
    "",
    "String(mappedEntries.length);",
].join("\n");
const inlineValidPrivateFilterMethodCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "",
    "class Store {",
    "    #filter(predicate: (value: null | string) => boolean): readonly (null | string)[] {",
    '        return [null, "ok"].filter(predicate);',
    "    }",
    "",
    "    run(): readonly (null | string)[] {",
    "        return this.#filter((value) => !isPresent(value));",
    "    }",
    "}",
    "",
    "const instance = new Store();",
    "String(instance.run().length);",
].join("\n");
const inlineValidFunctionExpressionCallbackCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(function (value) {",
    "    return !isPresent(value);",
    "});",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidTwoParamsCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value, index) => !isPresent(value));",
    "",
    "String(index);",
    "String(missingEntries.length);",
].join("\n");
const inlineValidNonIdentifierParameterCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(([value]) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidNotUnaryExpressionCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidUnaryNotCallExpressionCode = [
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !value);",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidPredicateWithTwoArgumentsCode = [
    "declare function isPresent<TValue>(value: TValue, fallback: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value, value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidMismatchedArgumentNameCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "declare const differentValue: null | string;",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(differentValue));",
    "",
    "String(value);",
    "String(missingEntries.length);",
].join("\n");
const inlineValidIdentifierCallbackCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const isMissing = (value: null | string): boolean => !isPresent(value);",
    "const missingEntries = nullableEntries.filter(isMissing);",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineValidUnaryPlusPredicateCallCode = [
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const mapped = nullableEntries.filter((value) => +isPresent(value));",
    "",
    "String(mapped.length);",
].join("\n");
const inlineValidMemberCalleePredicateCode = [
    "declare const predicates: { isPresent<TValue>(value: TValue): value is NonNullable<TValue> };",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !predicates.isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineFixableCode = [
    'import { not } from "ts-extras";',
    "",
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter((value) => !isPresent(value));",
    "",
    "String(missingEntries.length);",
].join("\n");
const inlineFixableOutput = [
    'import { not } from "ts-extras";',
    "",
    "declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;",
    "declare const nullableEntries: readonly (null | string)[];",
    "",
    "const missingEntries = nullableEntries.filter(not(isPresent));",
    "",
    "String(missingEntries.length);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-ts-extras-not", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras not helper over inline negated predicate callbacks in filter calls.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasNot:
            "Prefer `not(<predicate>)` from `ts-extras` over inline `value => !predicate(value)` callbacks.",
    },
    name: "prefer-ts-extras-not",
});

describe("prefer-ts-extras-not source assertions", () => {
    it("keeps prefer-ts-extras-not helper guards in source", () => {
        const ruleSource = readFileSync(
            path.resolve(process.cwd(), "src/rules/prefer-ts-extras-not.ts"),
            "utf8"
        );

        expect(ruleSource).toContain('const FILTER_METHOD_NAME = "filter";');
        expect(ruleSource).toContain(
            'node.callee.property.type === "Identifier" &&'
        );
        expect(ruleSource).toContain('callbackBody.operator !== "!" ||');
        expect(ruleSource).toContain(
            'predicateCall.optional ||\n                    predicateCall.callee.type !== "Identifier"'
        );
        expect(ruleSource).toContain(".trim();");
        expect(ruleSource).toContain("if (predicateText.length === 0) {");
        expect(ruleSource).toContain(
            "if (!isFilterCall(node) || node.arguments.length === 0) {"
        );
        expect(ruleSource).toContain(
            '(firstArgument.type !== "ArrowFunctionExpression" &&\n                            firstArgument.type !== "FunctionExpression")'
        );
    });
});

ruleTester.run("prefer-ts-extras-not", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasNot",
                },
                {
                    messageId: "preferTsExtrasNot",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture negated predicate filter callbacks",
        },
        {
            code: inlineInvalidArrowNegatedPredicateCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline negated predicate in filter callback",
            output: inlineInvalidArrowNegatedPredicateOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes negated filter callback when not import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineValidMemberCalleePredicateCode,
            errors: [{ messageId: "preferTsExtrasNot" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports negated member-callee predicate callback without autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidFilterWithoutArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter invocation without callback",
        },
        {
            code: inlineValidMapNegatedPredicateCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores negated predicate inside non-filter map callback",
        },
        {
            code: inlineValidPrivateFilterMethodCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores negated predicate inside private #filter method calls",
        },
        {
            code: inlineValidFunctionExpressionCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores function-expression filter callback",
        },
        {
            code: inlineValidTwoParamsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter callback with additional index parameter",
        },
        {
            code: inlineValidNonIdentifierParameterCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback with non-identifier parameter pattern",
        },
        {
            code: inlineValidNotUnaryExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores callback that does not use unary not",
        },
        {
            code: inlineValidUnaryNotCallExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unary not expression not wrapping call expression",
        },
        {
            code: inlineValidPredicateWithTwoArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores predicate call with extra arguments",
        },
        {
            code: inlineValidMismatchedArgumentNameCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores predicate call with mismatched callback argument",
        },
        {
            code: inlineValidIdentifierCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores filter callback provided as identifier",
        },
        {
            code: inlineValidUnaryPlusPredicateCallCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unary expressions over predicate calls when operator is not not",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
