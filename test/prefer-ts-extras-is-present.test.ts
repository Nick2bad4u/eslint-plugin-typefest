/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present";
const preferTsExtrasIsPresentMessage =
    "Prefer `isPresent(value)` from `ts-extras` over inline nullish comparisons.";
const preferTsExtrasIsPresentNegatedMessage =
    "Prefer `!isPresent(value)` from `ts-extras` over inline nullish comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-present.valid.ts";
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
const inlineValidStrictPresentWithNestedOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && (maybeValue !== undefined || hasPermission);",
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
const inlineValidStrictPresentWithShadowedUndefinedBindingCode = [
    "declare const maybeValue: null | string | undefined;",
    "const undefined = Symbol('undefined');",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
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
const inlineFixablePresentWithUnicodeAndEmojiCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "const hasValue = 候補値 != null; // keep comment 😅",
].join("\n");
const inlineFixablePresentWithUnicodeAndEmojiOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "const hasValue = isPresent(候補値); // keep comment 😅",
].join("\n");
const inlineFixableAbsentWithUnicodeAndEmojiCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    "const debugText = `glyphs 🧵 🛰️  `;",
    "const isMissing = 候補値 == null;",
].join("\n");
const inlineFixableAbsentWithUnicodeAndEmojiOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    "const debugText = `glyphs 🧵 🛰️  `;",
    "const isMissing = !isPresent(候補値);",
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

type ComparedExpressionTemplateId =
    | "computedMemberExpression"
    | "functionCall"
    | "identifier"
    | "memberExpression"
    | "sequenceExpression"
    | "typeAssertion";

type ComparisonOrientation =
    | "comparedExpressionOnLeft"
    | "comparedExpressionOnRight";

type NullishKind = "null" | "undefined";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type GeneratedLooseBinaryCase = Readonly<{
    comparedExpressionTemplateId: ComparedExpressionTemplateId;
    hasUnicodeNoiseLine: boolean;
    nullishKind: NullishKind;
    operator: "!=" | "==";
    orientation: ComparisonOrientation;
}>;

type StrictLogicalCase = Readonly<{
    checkKind: "absent" | "present";
    leftKind: NullishKind;
    leftOrientation: ComparisonOrientation;
    rightComparedExpression: "maybeValue" | "otherValue";
    rightOrientation: ComparisonOrientation;
}>;

const strictLogicalCases: StrictLogicalCase[] = [];

const strictCheckKinds: readonly StrictLogicalCase["checkKind"][] = [
    "absent",
    "present",
];

const strictRightComparedExpressionKinds: readonly StrictLogicalCase["rightComparedExpression"][] =
    ["maybeValue", "otherValue"];

const nullishKinds: readonly NullishKind[] = ["null", "undefined"];

const comparisonOrientations: readonly ComparisonOrientation[] = [
    "comparedExpressionOnLeft",
    "comparedExpressionOnRight",
];

const comparedExpressionTemplateIds: readonly ComparedExpressionTemplateId[] = [
    "identifier",
    "memberExpression",
    "computedMemberExpression",
    "functionCall",
    "typeAssertion",
    "sequenceExpression",
];

const looseOperators: readonly GeneratedLooseBinaryCase["operator"][] = [
    "!=",
    "==",
];

const unicodeNoiseOptions: readonly boolean[] = [false, true];

for (const checkKind of strictCheckKinds) {
    for (const leftKind of nullishKinds) {
        for (const leftOrientation of comparisonOrientations) {
            for (const rightComparedExpression of strictRightComparedExpressionKinds) {
                for (const rightOrientation of comparisonOrientations) {
                    strictLogicalCases.push({
                        checkKind,
                        leftKind,
                        leftOrientation,
                        rightComparedExpression,
                        rightOrientation,
                    });
                }
            }
        }
    }
}

const strictLogicalCaseArbitrary = fc.constantFrom(...strictLogicalCases);

const createGeneratedLooseBinaryCases = (
    nullishKind: NullishKind
): readonly GeneratedLooseBinaryCase[] => {
    const generatedCases: GeneratedLooseBinaryCase[] = [];

    for (const comparedExpressionTemplateId of comparedExpressionTemplateIds) {
        for (const hasUnicodeNoiseLine of unicodeNoiseOptions) {
            for (const operator of looseOperators) {
                for (const orientation of comparisonOrientations) {
                    generatedCases.push({
                        comparedExpressionTemplateId,
                        hasUnicodeNoiseLine,
                        nullishKind,
                        operator,
                        orientation,
                    });
                }
            }
        }
    }

    return generatedCases;
};

const binaryLooseNullCaseArbitrary = fc.constantFrom(
    ...createGeneratedLooseBinaryCases("null")
);

const binaryLooseUndefinedCaseArbitrary = fc.constantFrom(
    ...createGeneratedLooseBinaryCases("undefined")
);

const getComparedExpressionTemplate = (
    templateId: ComparedExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: [
                "declare const maybeValue: null | string | undefined;",
            ],
            expressionText: "maybeValue",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const maybeContainer: { readonly current: null | string | undefined };",
            ],
            expressionText: "maybeContainer.current",
        };
    }

    if (templateId === "computedMemberExpression") {
        return {
            declarations: [
                "declare const maybeValues: readonly (null | string | undefined)[];",
                "declare const index: number;",
            ],
            expressionText: "maybeValues[index]",
        };
    }

    if (templateId === "functionCall") {
        return {
            declarations: [
                "declare function getMaybeValue(): null | string | undefined;",
            ],
            expressionText: "getMaybeValue()",
        };
    }

    if (templateId === "typeAssertion") {
        return {
            declarations: ["declare const maybeValue: unknown;"],
            expressionText: "(maybeValue as null | string | undefined)",
        };
    }

    return {
        declarations: [
            "declare function sideEffect(): void;",
            "declare const maybeValue: null | string | undefined;",
        ],
        expressionText: "(sideEffect(), maybeValue)",
    };
};

const getOppositeNullishKind = (nullishKind: NullishKind): NullishKind =>
    nullishKind === "null" ? "undefined" : "null";

const formatNullishLiteralText = (nullishKind: NullishKind): string =>
    nullishKind === "null" ? "null" : "undefined";

const formatNullishComparisonText = ({
    comparedExpression,
    kind,
    operator,
    orientation,
}: Readonly<{
    comparedExpression: "maybeValue" | "otherValue";
    kind: NullishKind;
    operator: "!==" | "===";
    orientation: ComparisonOrientation;
}>): string => {
    const nullishLiteralText = formatNullishLiteralText(kind);

    return orientation === "comparedExpressionOnLeft"
        ? `${comparedExpression} ${operator} ${nullishLiteralText}`
        : `${nullishLiteralText} ${operator} ${comparedExpression}`;
};

const parseIfLogicalExpression = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    logicalExpression: TSESTree.Expression;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);
    let ifStatement: null | TSESTree.IfStatement = null;

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.IfStatement) {
            ifStatement = statement;
            break;
        }
    }

    if (!ifStatement) {
        throw new Error("Expected generated code to include an if statement");
    }

    return {
        ast: parsed.ast,
        logicalExpression: ifStatement.test,
    };
};

const parseVariableBinaryExpression = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    binaryExpression: TSESTree.BinaryExpression;
    binaryRange: readonly [number, number];
    comparedExpressionText: string;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);
    let binaryExpression: null | TSESTree.BinaryExpression = null;

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.BinaryExpression
                ) {
                    binaryExpression = declaration.init;
                    break;
                }
            }
        }

        if (binaryExpression) {
            break;
        }
    }

    if (!binaryExpression) {
        throw new Error(
            "Expected generated code to include a variable binary expression"
        );
    }

    const comparedExpression =
        binaryExpression.left.type === AST_NODE_TYPES.Literal ||
        (binaryExpression.left.type === AST_NODE_TYPES.Identifier &&
            binaryExpression.left.name === "undefined")
            ? binaryExpression.right
            : binaryExpression.left;

    const binaryRange = binaryExpression.range;
    const comparedExpressionRange = comparedExpression.range;

    return {
        ast: parsed.ast,
        binaryExpression,
        binaryRange,
        comparedExpressionText: code
            .slice(comparedExpressionRange[0], comparedExpressionRange[1])
            .trim(),
    };
};

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
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-present internal filter guards", () => {
    const getNodeText = (
        node: Readonly<{
            name?: string;
            raw?: string;
            text?: string;
            value?: unknown;
        }>
    ): string => {
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
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
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

            (leftBinaryNode as { parent?: unknown }).parent = logicalNode;
            (rightBinaryNode as { parent?: unknown }).parent = logicalNode;
            (logicalNode as { parent?: unknown }).parent = filterCallNode;

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
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
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

            (leftBinaryNode as { parent?: unknown }).parent = logicalNode;
            (rightBinaryNode as { parent?: unknown }).parent = logicalNode;
            (logicalNode as { parent?: unknown }).parent = returnNode;
            (returnNode as { parent?: unknown }).parent = functionCallbackNode;
            (functionCallbackNode as { parent?: unknown }).parent =
                privateFilterCallNode;

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

    it("fast-check: reports only strict present/absent checks over the same compared expression", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(strictLogicalCaseArbitrary, (generatedCase) => {
                    const comparisonOperator =
                        generatedCase.checkKind === "present" ? "!==" : "===";
                    const logicalOperator =
                        generatedCase.checkKind === "present" ? "&&" : "||";
                    const rightKind = getOppositeNullishKind(
                        generatedCase.leftKind
                    );
                    const firstComparisonText = formatNullishComparisonText({
                        comparedExpression: "maybeValue",
                        kind: generatedCase.leftKind,
                        operator: comparisonOperator,
                        orientation: generatedCase.leftOrientation,
                    });
                    const secondComparisonText = formatNullishComparisonText({
                        comparedExpression:
                            generatedCase.rightComparedExpression,
                        kind: rightKind,
                        operator: comparisonOperator,
                        orientation: generatedCase.rightOrientation,
                    });

                    const code = [
                        "declare const maybeValue: null | string | undefined;",
                        "declare const otherValue: null | string | undefined;",
                        "",
                        `if (${firstComparisonText} ${logicalOperator} ${secondComparisonText}) {`,
                        "    String(maybeValue);",
                        "}",
                    ].join("\n");

                    const { ast, logicalExpression } =
                        parseIfLogicalExpression(code);
                    const reportCalls: Readonly<{ messageId?: string }>[] = [];

                    const listeners = authoredRuleModule.default.create({
                        filename: "src/example.ts",
                        report: (
                            descriptor: Readonly<{ messageId?: string }>
                        ) => {
                            reportCalls.push(descriptor);
                        },
                        sourceCode: {
                            ast,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
                                    return "";
                                }

                                const nodeRange = (
                                    node as Readonly<{
                                        range?: readonly [number, number];
                                    }>
                                ).range;

                                if (!nodeRange) {
                                    return "";
                                }

                                const [start, end] = nodeRange;
                                return code.slice(start, end);
                            },
                        },
                    });

                    listeners.LogicalExpression?.(logicalExpression);

                    const shouldReport =
                        generatedCase.rightComparedExpression === "maybeValue";
                    const expectedMessageId =
                        generatedCase.checkKind === "present"
                            ? "preferTsExtrasIsPresent"
                            : "preferTsExtrasIsPresentNegated";

                    expect(reportCalls).toHaveLength(shouldReport ? 1 : 0);
                    expect(reportCalls[0]?.messageId).toBe(
                        shouldReport ? expectedMessageId : undefined
                    );
                }),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: loose null comparisons report with parseable isPresent replacement text", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Map<string, ReadonlySet<string>>(),
                createSafeValueArgumentFunctionCallFix:
                    createSafeValueArgumentFunctionCallFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                    createSafeValueArgumentFunctionCallFixMock.mockClear();

                    const template = getComparedExpressionTemplate(
                        generatedCase.comparedExpressionTemplateId
                    );
                    const nullishLiteralText = formatNullishLiteralText(
                        generatedCase.nullishKind
                    );
                    const comparisonText =
                        generatedCase.orientation === "comparedExpressionOnLeft"
                            ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                            : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;
                    const code = [
                        ...template.declarations,
                        generatedCase.hasUnicodeNoiseLine
                            ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                            : "",
                        `const evaluation = ${comparisonText};`,
                        "String(evaluation);",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const {
                        ast,
                        binaryExpression,
                        binaryRange,
                        comparedExpressionText,
                    } = parseVariableBinaryExpression(code);
                    const reportCalls: Readonly<{
                        fix?: unknown;
                        messageId?: string;
                    }>[] = [];

                    const listeners = authoredRuleModule.default.create({
                        filename: "src/example.ts",
                        report: (
                            descriptor: Readonly<{
                                fix?: unknown;
                                messageId?: string;
                            }>
                        ) => {
                            reportCalls.push(descriptor);
                        },
                        sourceCode: {
                            ast,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
                                    return "";
                                }

                                const nodeRange = (
                                    node as Readonly<{
                                        range?: readonly [number, number];
                                    }>
                                ).range;

                                if (!nodeRange) {
                                    return "";
                                }

                                return code.slice(nodeRange[0], nodeRange[1]);
                            },
                        },
                    });

                    listeners.BinaryExpression?.(binaryExpression);

                    expect(reportCalls).toHaveLength(1);
                    expect(reportCalls[0]).toMatchObject({
                        fix: "FIX",
                        messageId:
                            generatedCase.operator === "!="
                                ? "preferTsExtrasIsPresent"
                                : "preferTsExtrasIsPresentNegated",
                    });
                    expect(
                        createSafeValueArgumentFunctionCallFixMock
                    ).toHaveBeenCalledTimes(1);

                    const callText = `isPresent(${comparedExpressionText})`;
                    const replacementText =
                        generatedCase.operator === "=="
                            ? `!${callText}`
                            : callText;
                    const fixedCode =
                        code.slice(0, binaryRange[0]) +
                        replacementText +
                        code.slice(binaryRange[1]);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrowError();
                }),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: loose undefined binary comparisons do not trigger isPresent fixes", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Map<string, ReadonlySet<string>>(),
                createSafeValueArgumentFunctionCallFix:
                    createSafeValueArgumentFunctionCallFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    binaryLooseUndefinedCaseArbitrary,
                    (generatedCase) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const template = getComparedExpressionTemplate(
                            generatedCase.comparedExpressionTemplateId
                        );
                        const comparisonText =
                            generatedCase.orientation ===
                            "comparedExpressionOnLeft"
                                ? `${template.expressionText} ${generatedCase.operator} undefined`
                                : `undefined ${generatedCase.operator} ${template.expressionText}`;
                        const code = [
                            ...template.declarations,
                            `const evaluation = ${comparisonText};`,
                            "String(evaluation);",
                        ].join("\n");

                        const { ast, binaryExpression } =
                            parseVariableBinaryExpression(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    if (
                                        typeof node !== "object" ||
                                        node === null ||
                                        !("range" in node)
                                    ) {
                                        return "";
                                    }

                                    const nodeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!nodeRange) {
                                        return "";
                                    }

                                    return code.slice(
                                        nodeRange[0],
                                        nodeRange[1]
                                    );
                                },
                            },
                        });

                        listeners.BinaryExpression?.(binaryExpression);

                        expect(reportCalls).toHaveLength(0);
                        expect(
                            createSafeValueArgumentFunctionCallFixMock
                        ).not.toHaveBeenCalled();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(ruleId, rule, {
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
            name: "reports fixture strict present and absent comparisons",
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
            code: inlineFixablePresentWithUnicodeAndEmojiCode,
            errors: [{ messageId: "preferTsExtrasIsPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes loose null inequality without disturbing unicode, emoji, or nerd-font glyph text",
            output: inlineFixablePresentWithUnicodeAndEmojiOutput,
        },
        {
            code: inlineFixableAbsentWithUnicodeAndEmojiCode,
            errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes loose null equality in files containing unicode-rich template literals",
            output: inlineFixableAbsentWithUnicodeAndEmojiOutput,
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
            code: inlineValidStrictPresentWithNestedOperatorMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present checks with nested opposite logical operators",
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
            code: inlineValidStrictPresentWithShadowedUndefinedBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present checks when undefined binding is shadowed",
        },
    ],
});

