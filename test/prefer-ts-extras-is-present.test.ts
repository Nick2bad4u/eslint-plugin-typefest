/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { describe, expect, it, vi } from "vitest";

import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-present";
const docsDescription =
    "require ts-extras isPresent over inline nullish comparisons outside filter callbacks.";
const docsUrl =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-present.md";
const preferTsExtrasIsPresentMessage =
    "Prefer `isPresent(value)` from `ts-extras` over inline nullish comparisons.";
const preferTsExtrasIsPresentNegatedMessage =
    "Prefer `!isPresent(value)` from `ts-extras` over inline nullish comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-present.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-is-present.skip.ts";
const invalidFixtureName = "prefer-ts-extras-is-present.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureInvalidOutput = `import { isPresent } from "ts-extras";\n${invalidFixtureCode.replace(
    "if (maybeValue != null) {\r\n",
    "if (isPresent(maybeValue)) {\r\n"
)}`;
const fixtureInvalidSecondPassOutput = fixtureInvalidOutput
    .replace(
        "if (null != maybeValue) {\r\n",
        "if (isPresent(maybeValue)) {\r\n"
    )
    .replace(
        "if (maybeValue == null) {\r\n",
        "if (!isPresent(maybeValue)) {\r\n"
    );
const inlineValidThreeTermStrictPresentCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && hasPermission && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonBinaryTermCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue = maybeValue !== null && hasPermission;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue === undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentSameKindCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue !== null;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonNullLiteralCode = [
    "declare const maybeValue: null | number | undefined;",
    "",
    "const isPresentValue = maybeValue !== 0 && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonNullLeftLiteralCode = [
    "declare const maybeValue: null | number | undefined;",
    "",
    "const isPresentValue = 0 !== maybeValue && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithUndefinedAliasCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const undefinedAlias: undefined;",
    "",
    "const isPresentValue = maybeValue !== null && undefinedAlias !== maybeValue;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentDifferentComparedExpressionCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const otherValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && otherValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWrongLogicalOperatorCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null || maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictAbsentWrongLogicalOperatorCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null && maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidThreeTermStrictPresentComparableCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && (maybeValue !== undefined && hasPermission);",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidThreeTermStrictAbsentComparableCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue =",
    "    maybeValue === null || (maybeValue === undefined || hasPermission);",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictPresentFirstOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue === null && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictAbsentFirstOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue !== null || maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentDifferentComparedExpressionCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const otherValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || otherValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidThreeTermStrictAbsentCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue =",
    "    maybeValue === null || hasPermission || maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentWithNonBinaryTermCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue = maybeValue === null || hasPermission;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || maybeValue !== undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentSameKindCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || maybeValue === null;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidUndefinedOnLeftComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const hasUndefinedValue = undefined == maybeValue;",
    "",
    "String(hasUndefinedValue);",
].join("\n");
const inlineValidNonNullishBinaryComparisonCode = [
    "declare const firstValue: string;",
    "declare const secondValue: string;",
    "",
    "const hasSameValue = firstValue === secondValue;",
    "",
    "String(hasSameValue);",
].join("\n");
const inlineInvalidStrictPresentComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (maybeValue !== null && maybeValue !== undefined) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidStrictAbsentComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (maybeValue === null || maybeValue === undefined) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidMapCallbackStrictPresentCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const mapped = values.map((value) => value !== null && value !== undefined);",
    "String(mapped.length);",
].join("\n");
const inlineInvalidMapCallbackStrictAbsentCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const mapped = values.map((value) => value === null || value === undefined);",
    "String(mapped.length);",
].join("\n");
const inlineValidFilterCallbackLogicalComparisonCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const presentValues = values.filter((value) => value !== null && value !== undefined);",
    "const missingValues = values.filter((value) => value === null || value === undefined);",
    "String(presentValues.length + missingValues.length);",
].join("\n");
const inlineValidFunctionExpressionFilterCallbackCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const presentValues = values.filter(function (value) {",
    "    return value !== null && value !== undefined;",
    "});",
    "const missingValues = values.filter(function (value) {",
    "    return value === null || value === undefined;",
    "});",
    "String(presentValues.length + missingValues.length);",
].join("\n");
const inlineFixablePresentCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const hasValue = maybeValue != null;",
].join("\n");
const inlineFixablePresentOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const hasValue = isPresent(maybeValue);",
].join("\n");
const inlineFixableAbsentCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const isMissing = maybeValue == null;",
].join("\n");
const inlineFixableAbsentOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const isMissing = !isPresent(maybeValue);",
].join("\n");
const inlineInvalidStrictPresentWithUndefinedOnLeftCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (undefined !== maybeValue && maybeValue !== null) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidStrictAbsentWithUndefinedOnLeftCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (undefined === maybeValue || maybeValue === null) {",
    "    String(maybeValue);",
    "}",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsPresent: preferTsExtrasIsPresentMessage,
        preferTsExtrasIsPresentNegated: preferTsExtrasIsPresentNegatedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-present metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-present internal filter guards", () => {
    const getNodeText = (node: {
        name?: string;
        raw?: string;
        text?: string;
        value?: unknown;
    }): string => {
        if (typeof node.text === "string") {
            return node.text;
        }

        if (typeof node.name === "string") {
            return node.name;
        }

        if (typeof node.raw === "string") {
            return node.raw;
        }

        if (node.value === null) {
            return "null";
        }

        return "";
    };

    it("reports strict checks for non-function filter arguments", async () => {
        const reportCalls: Array<{ messageId?: string }> = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () => new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule = (await import(
                "../src/rules/prefer-ts-extras-is-present.ts"
            )) as {
                default: {
                    create: (context: unknown) => {
                        LogicalExpression?: (node: unknown) => void;
                    };
                };
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: { messageId?: string }) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText: getNodeText,
                },
            });

            const logicalExpressionListener = listeners.LogicalExpression;
            expect(logicalExpressionListener).toBeTypeOf("function");

            const comparedIdentifier = {
                name: "maybeValue",
                text: "maybeValue",
                type: "Identifier",
            };
            const leftBinaryNode = {
                left: comparedIdentifier,
                operator: "!==",
                right: {
                    raw: "null",
                    type: "Literal",
                    value: null,
                },
                type: "BinaryExpression",
            };
            const rightBinaryNode = {
                left: comparedIdentifier,
                operator: "!==",
                right: {
                    name: "undefined",
                    text: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            };
            const logicalNode = {
                left: leftBinaryNode,
                operator: "&&",
                right: rightBinaryNode,
                type: "LogicalExpression",
            };
            const filterCallNode = {
                arguments: [logicalNode],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            leftBinaryNode.parent = logicalNode;
            rightBinaryNode.parent = logicalNode;
            logicalNode.parent = filterCallNode;

            logicalExpressionListener?.(logicalNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferTsExtrasIsPresent",
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("does not treat private filter-like call as filter callback", async () => {
        const reportCalls: Array<{ messageId?: string }> = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () => new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule = (await import(
                "../src/rules/prefer-ts-extras-is-present.ts"
            )) as {
                default: {
                    create: (context: unknown) => {
                        LogicalExpression?: (node: unknown) => void;
                    };
                };
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: { messageId?: string }) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText: getNodeText,
                },
            });

            const logicalExpressionListener = listeners.LogicalExpression;
            expect(logicalExpressionListener).toBeTypeOf("function");

            const comparedIdentifier = {
                name: "maybeValue",
                text: "maybeValue",
                type: "Identifier",
            };
            const leftBinaryNode = {
                left: comparedIdentifier,
                operator: "===",
                right: {
                    raw: "null",
                    type: "Literal",
                    value: null,
                },
                type: "BinaryExpression",
            };
            const rightBinaryNode = {
                left: comparedIdentifier,
                operator: "===",
                right: {
                    name: "undefined",
                    text: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            };
            const logicalNode = {
                left: leftBinaryNode,
                operator: "||",
                right: rightBinaryNode,
                type: "LogicalExpression",
            };
            const returnNode = {
                argument: logicalNode,
                type: "ReturnStatement",
            };
            const functionCallbackNode = {
                body: {
                    body: [returnNode],
                    type: "BlockStatement",
                },
                params: [
                    {
                        name: "value",
                        type: "Identifier",
                    },
                ],
                type: "FunctionExpression",
            };
            const privateFilterCallNode = {
                arguments: [functionCallbackNode],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            leftBinaryNode.parent = logicalNode;
            rightBinaryNode.parent = logicalNode;
            logicalNode.parent = returnNode;
            returnNode.parent = functionCallbackNode;
            functionCallbackNode.parent = privateFilterCallNode;

            logicalExpressionListener?.(logicalNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferTsExtrasIsPresentNegated",
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    ruleId,
    rule,
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresentNegated" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresent" },
                    { messageId: "preferTsExtrasIsPresentNegated" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture strict present and absent checks",
                output: [fixtureInvalidOutput, fixtureInvalidSecondPassOutput],
            },
            {
                code: inlineInvalidStrictPresentComparisonCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict present conjunction check",
            },
            {
                code: inlineInvalidStrictAbsentComparisonCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict absent disjunction check",
            },
            {
                code: inlineInvalidMapCallbackStrictPresentCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict present check inside map callback",
            },
            {
                code: inlineInvalidMapCallbackStrictAbsentCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict absent check inside map callback",
            },
            {
                code: inlineFixablePresentCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes loose null inequality when isPresent import is in scope",
                output: inlineFixablePresentOutput,
            },
            {
                code: inlineFixableAbsentCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes loose null equality when isPresent import is in scope",
                output: inlineFixableAbsentOutput,
            },
            {
                code: inlineInvalidStrictPresentWithUndefinedOnLeftCode,
                errors: [{ messageId: "preferTsExtrasIsPresent" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict present conjunction when undefined is on the left",
            },
            {
                code: inlineInvalidStrictAbsentWithUndefinedOnLeftCode,
                errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports strict absent disjunction when undefined is on the left",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidThreeTermStrictPresentCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores three-term strict present conjunction",
            },
            {
                code: inlineValidStrictPresentWithNonBinaryTermCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present conjunction with non-binary term",
            },
            {
                code: inlineValidStrictPresentOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check with operator mismatch",
            },
            {
                code: inlineValidStrictPresentSameKindCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check using repeated null branch",
            },
            {
                code: inlineValidStrictPresentWithNonNullLiteralCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check using non-null literal on the right",
            },
            {
                code: inlineValidStrictPresentWithNonNullLeftLiteralCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check using non-null literal on the left",
            },
            {
                code: inlineValidStrictPresentWithUndefinedAliasCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check using non-undefined identifier alias",
            },
            {
                code: inlineValidStrictPresentDifferentComparedExpressionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check when compared expressions differ",
            },
            {
                code: inlineValidStrictPresentWrongLogicalOperatorCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present comparisons joined by disjunction",
            },
            {
                code: inlineValidThreeTermStrictPresentComparableCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores three-term strict present chain with comparable terms",
            },
            {
                code: inlineValidStrictPresentFirstOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict present check when first operator is strict equality",
            },
            {
                code: inlineValidThreeTermStrictAbsentCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores three-term strict absent disjunction",
            },
            {
                code: inlineValidStrictAbsentWrongLogicalOperatorCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent comparisons joined by conjunction",
            },
            {
                code: inlineValidThreeTermStrictAbsentComparableCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores three-term strict absent chain with comparable terms",
            },
            {
                code: inlineValidStrictAbsentFirstOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent check when first operator is strict inequality",
            },
            {
                code: inlineValidStrictAbsentDifferentComparedExpressionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent check when compared expressions differ",
            },
            {
                code: inlineValidStrictAbsentWithNonBinaryTermCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent disjunction with non-binary term",
            },
            {
                code: inlineValidStrictAbsentOperatorMismatchCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent check with operator mismatch",
            },
            {
                code: inlineValidStrictAbsentSameKindCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict absent check using repeated null branch",
            },
            {
                code: inlineValidUndefinedOnLeftComparisonCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores undefined comparison with literal on left",
            },
            {
                code: inlineValidNonNullishBinaryComparisonCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-nullish binary comparison",
            },
            {
                code: inlineValidFilterCallbackLogicalComparisonCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict checks inside filter callbacks",
            },
            {
                code: inlineValidFunctionExpressionFilterCallbackCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores strict checks inside function-expression filter callbacks",
            },
            {
                code: readTypedFixture(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                filename: typedFixturePath(
                    skipTestPathFixtureDirectory,
                    skipTestPathFixtureName
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
