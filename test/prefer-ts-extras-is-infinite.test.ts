/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-infinite.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-is-infinite");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-infinite.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-infinite.invalid.ts";
const inlineInvalidPositiveInfinityCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric == Number.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidLeftInfinityCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = Infinity === metric;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidNonEqualityOperatorCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric > Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidWithoutInfinityReferenceCode = [
    "declare const metric: number;",
    "declare const fallbackMetric: number;",
    "",
    "const hasSameMetric = metric === fallbackMetric;",
    "",
    "String(hasSameMetric);",
].join("\n");
const inlineValidComputedInfinityMemberCode = [
    "declare const metric: number;",
    "",
    'const isInfiniteMetric = metric === Number["POSITIVE_INFINITY"];',
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidOtherObjectInfinityMemberCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Math.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidNonInfinityNumberPropertyCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.MAX_VALUE;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidShadowedInfinityBindingCode = [
    "declare const metric: number;",
    "const Infinity = Number.NaN;",
    "",
    "const isInfiniteMetric = metric === Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineValidShadowedNumberBindingCode = [
    "declare const metric: number;",
    "const Number = { POSITIVE_INFINITY: 1, NEGATIVE_INFINITY: -1 };",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableDualSignCode = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableDualSignOutput = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = isInfinite(metric);",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableInfinityIdentifierDualSignCode = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = Infinity === metric || Number.NEGATIVE_INFINITY === metric;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineFixableInfinityIdentifierDualSignOutput = [
    'import { isInfinite } from "ts-extras";',
    "",
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = isInfinite(metric);",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidMixedStrictnessDualSignCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric == Number.POSITIVE_INFINITY || metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidSameSignStrictDisjunctionCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Infinity;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidDifferentComparedExpressionsCode = [
    "declare const firstMetric: number;",
    "declare const secondMetric: number;",
    "",
    "const isInfiniteMetric = firstMetric === Number.POSITIVE_INFINITY || secondMetric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidLogicalAndDualSignCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY && metric === Number.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineInvalidMathNegativeInfinityDisjunctionCode = [
    "declare const metric: number;",
    "",
    "const isInfiniteMetric = metric === Number.POSITIVE_INFINITY || metric === Math.NEGATIVE_INFINITY;",
    "",
    "String(isInfiniteMetric);",
].join("\n");
const inlineParenthesizedDisjunctionCode = [
    'import { isInfinite } from "ts-extras";',
    "",
    "const metric = Number.POSITIVE_INFINITY;",
    "const hasInfiniteMetric =",
    "    (metric) === Number.POSITIVE_INFINITY ||",
    "    Number.NEGATIVE_INFINITY === metric;",
    "String(hasInfiniteMetric);",
].join("\n");
const inlineParenthesizedDisjunctionOutput = [
    'import { isInfinite } from "ts-extras";',
    "",
    "const metric = Number.POSITIVE_INFINITY;",
    "const hasInfiniteMetric =",
    "    isInfinite(metric);",
    "String(hasInfiniteMetric);",
].join("\n");

type ComparedExpressionTemplateId =
    | "callExpression"
    | "computedMemberExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier"
    | "typeAssertion";

type ComparisonOrientation = "expressionOnLeft" | "expressionOnRight";

type PositiveInfinityReferenceKind =
    | "globalInfinity"
    | "numberPositiveInfinity";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

/* eslint-disable total-functions/no-hidden-type-assertions -- fast-check tuple composition depends on inferred literal generics to retain case-shape precision. */
const generatedFixableDisjunctionCaseArbitrary = fc
    .tuple(
        fc.constantFrom(
            "callExpression",
            "computedMemberExpression",
            "identifier",
            "memberExpression",
            "parenthesizedIdentifier",
            "typeAssertion"
        ),
        fc.constantFrom("globalInfinity", "numberPositiveInfinity"),
        fc.constantFrom("expressionOnLeft", "expressionOnRight"),
        fc.constantFrom("expressionOnLeft", "expressionOnRight"),
        fc.boolean(),
        fc.boolean()
    )
    .map(
        ([
            templateId,
            positiveInfinityReferenceKind,
            positiveOrientation,
            negativeOrientation,
            reverseOrder,
            includeUnicodeLine,
        ]) => ({
            includeUnicodeLine,
            negativeOrientation,
            positiveInfinityReferenceKind,
            positiveOrientation,
            reverseOrder,
            templateId,
        })
    );

const generatedMismatchedDisjunctionCaseArbitrary = fc
    .tuple(
        fc.constantFrom("globalInfinity", "numberPositiveInfinity"),
        fc.constantFrom("expressionOnLeft", "expressionOnRight"),
        fc.constantFrom("expressionOnLeft", "expressionOnRight"),
        fc.boolean(),
        fc.boolean()
    )
    .map(
        ([
            positiveInfinityReferenceKind,
            firstOrientation,
            secondOrientation,
            reverseOrder,
            includeUnicodeLine,
        ]) => ({
            firstOrientation,
            includeUnicodeLine,
            positiveInfinityReferenceKind,
            reverseOrder,
            secondOrientation,
        })
    );
/* eslint-enable total-functions/no-hidden-type-assertions -- restore default lint behavior after tuple-based arbitrary construction. */

const comparedExpressionTemplates: Readonly<
    Record<
        ComparedExpressionTemplateId,
        Readonly<{
            declarations: readonly string[];
            expressionText: string;
        }>
    >
> = {
    callExpression: {
        declarations: ["declare function readMetric(): number;"],
        expressionText: "readMetric()",
    },
    computedMemberExpression: {
        declarations: [
            "declare const metrics: readonly number[];",
            "declare const metricIndex: number;",
        ],
        expressionText: "metrics[metricIndex]",
    },
    identifier: {
        declarations: ["declare const metric: number;"],
        expressionText: "metric",
    },
    memberExpression: {
        declarations: [
            "declare const metricHolder: { readonly current: number };",
        ],
        expressionText: "metricHolder.current",
    },
    parenthesizedIdentifier: {
        declarations: ["declare const metric: number;"],
        expressionText: "(metric)",
    },
    typeAssertion: {
        declarations: ["declare const metricValue: unknown;"],
        expressionText: "(metricValue as number)",
    },
};

const buildComparedExpressionTemplate = (
    templateId: ComparedExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => comparedExpressionTemplates[templateId];

const getPositiveInfinityReferenceText = (
    positiveInfinityReferenceKind: PositiveInfinityReferenceKind
): string =>
    positiveInfinityReferenceKind === "globalInfinity"
        ? "Infinity"
        : "Number.POSITIVE_INFINITY";

const buildStrictInfinityComparisonText = ({
    comparedExpressionText,
    infinityReferenceText,
    orientation,
}: Readonly<{
    comparedExpressionText: string;
    infinityReferenceText: string;
    orientation: ComparisonOrientation;
}>): string =>
    orientation === "expressionOnLeft"
        ? `${comparedExpressionText} === ${infinityReferenceText}`
        : `${infinityReferenceText} === ${comparedExpressionText}`;

const isInfinityReferenceNode = (
    node: Readonly<TSESTree.Expression>
): boolean => {
    if (node.type === AST_NODE_TYPES.Identifier && node.name === "Infinity") {
        return true;
    }

    return (
        node.type === AST_NODE_TYPES.MemberExpression &&
        !node.computed &&
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === "Number" &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        (node.property.name === "NEGATIVE_INFINITY" ||
            node.property.name === "POSITIVE_INFINITY")
    );
};

const isBinaryComparableExpression = (
    node: Readonly<TSESTree.BinaryExpression["left"]>
): node is TSESTree.Expression =>
    node.type !== AST_NODE_TYPES.PrivateIdentifier;

const getLogicalExpressionInitializerFromStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): null | TSESTree.LogicalExpression => {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
    }

    for (const declaration of statement.declarations) {
        if (declaration.init?.type === AST_NODE_TYPES.LogicalExpression) {
            return declaration.init;
        }
    }

    return null;
};

const parseLogicalDisjunctionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    comparedExpressionText: string;
    logicalExpression: TSESTree.LogicalExpression;
    logicalRange: readonly [number, number];
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);
    let logicalExpression: null | TSESTree.LogicalExpression = null;

    for (const statement of parsedResult.ast.body) {
        logicalExpression =
            getLogicalExpressionInitializerFromStatement(statement);

        if (logicalExpression !== null) {
            break;
        }
    }

    if (!logicalExpression) {
        throw new Error(
            "Expected generated code to include a logical disjunction initializer"
        );
    }

    if (
        logicalExpression.operator !== "||" ||
        logicalExpression.left.type !== AST_NODE_TYPES.BinaryExpression
    ) {
        throw new Error(
            "Expected generated logical expression to be a disjunction with binary left term"
        );
    }

    const leftBinary = logicalExpression.left;

    if (
        !isBinaryComparableExpression(leftBinary.left) ||
        !isBinaryComparableExpression(leftBinary.right)
    ) {
        throw new Error(
            "Expected generated binary comparisons to use expression operands"
        );
    }

    const comparedExpression = isInfinityReferenceNode(leftBinary.left)
        ? leftBinary.right
        : leftBinary.left;
    const comparedExpressionRange = comparedExpression.range;

    return {
        ast: parsedResult.ast,
        comparedExpressionText: sourceText
            .slice(comparedExpressionRange[0], comparedExpressionRange[1])
            .trim(),
        logicalExpression,
        logicalRange: logicalExpression.range,
    };
};

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-is-infinite",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras isInfinite over direct Infinity equality checks for consistent predicate helper usage.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasIsInfinite:
                "Prefer `isInfinite` from `ts-extras` over direct Infinity equality checks.",
        },
        name: "prefer-ts-extras-is-infinite",
    }
);

describe("prefer-ts-extras-is-infinite source assertions", () => {
    it("keeps is-infinite helper guards and comparisons in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-is-infinite.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('node.property.type === "Identifier" &&');
        expect(ruleSource).toMatch(
            /\(node\.property\.name === "POSITIVE_INFINITY" \|\|\s+node\.property\.name === "NEGATIVE_INFINITY"\)/v
        );
        expect(ruleSource).toContain(
            'isGlobalIdentifierNamed(context, node, "Infinity")'
        );
        expect(ruleSource).toContain('node.object.name !== "Number" ||');
        expect(ruleSource).toContain('node.property.type !== "Identifier"');
        expect(ruleSource).toContain(
            'if (node.property.name === "NEGATIVE_INFINITY") {'
        );
        expect(ruleSource).toContain(
            '(expression.operator !== "==" && expression.operator !== "===")'
        );
        expect(ruleSource).toContain("if (leftKind && !rightKind) {");
        expect(ruleSource).toContain('if (node.operator !== "||") {');
        expect(ruleSource).toContain(
            'if (left.operator !== "===" || right.operator !== "===") {'
        );
        expect(ruleSource).toContain("if (left.kind === right.kind) {");
        expect(ruleSource).toContain("areEquivalentExpressions(");
        expect(ruleSource).not.toContain("normalizeExpressionText");
        expect(ruleSource).toContain('parent?.type === "LogicalExpression" &&');
    });
});

describe("prefer-ts-extras-is-infinite internal listener guards", () => {
    it("ignores strict disjunctions when one Number member is non-infinity", async () => {
        const report = vi.fn();

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) => node.type === "Identifier" && node.name === name,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-infinite")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report,
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            listeners.LogicalExpression?.({
                left: {
                    left: {
                        name: "metric",
                        type: "Identifier",
                    },
                    operator: "===",
                    right: {
                        computed: false,
                        object: {
                            name: "Number",
                            type: "Identifier",
                        },
                        property: {
                            name: "MAX_VALUE",
                            type: "Identifier",
                        },
                        type: "MemberExpression",
                    },
                    type: "BinaryExpression",
                },
                operator: "||",
                right: {
                    left: {
                        name: "metric",
                        type: "Identifier",
                    },
                    operator: "===",
                    right: {
                        computed: false,
                        object: {
                            name: "Number",
                            type: "Identifier",
                        },
                        property: {
                            name: "NEGATIVE_INFINITY",
                            type: "Identifier",
                        },
                        type: "MemberExpression",
                    },
                    type: "BinaryExpression",
                },
                type: "LogicalExpression",
            });

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: strict dual-sign disjunctions report with parseable isInfinite replacement", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) => node.type === "Identifier" && node.name === name,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix:
                    createSafeValueArgumentFunctionCallFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-infinite")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedFixableDisjunctionCaseArbitrary,
                    (generatedCase) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const template = buildComparedExpressionTemplate(
                            generatedCase.templateId
                        );
                        const positiveComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: template.expressionText,
                                infinityReferenceText:
                                    getPositiveInfinityReferenceText(
                                        generatedCase.positiveInfinityReferenceKind
                                    ),
                                orientation: generatedCase.positiveOrientation,
                            });
                        const negativeComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: template.expressionText,
                                infinityReferenceText:
                                    "Number.NEGATIVE_INFINITY",
                                orientation: generatedCase.negativeOrientation,
                            });

                        const disjunctionTerms = generatedCase.reverseOrder
                            ? [negativeComparisonText, positiveComparisonText]
                            : [positiveComparisonText, negativeComparisonText];

                        const code = [
                            ...template.declarations,
                            generatedCase.includeUnicodeLine
                                ? 'const marker = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                                : "",
                            `const isInfiniteMetric = ${disjunctionTerms[0]} || ${disjunctionTerms[1]};`,
                            "String(isInfiniteMetric);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const {
                            ast,
                            comparedExpressionText,
                            logicalExpression,
                            logicalRange,
                        } = parseLogicalDisjunctionFromCode(code);
                        const reports: Readonly<{
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
                                reports.push(descriptor);
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

                                    const maybeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!maybeRange) {
                                        return "";
                                    }

                                    return code.slice(
                                        maybeRange[0],
                                        maybeRange[1]
                                    );
                                },
                            },
                        });

                        listeners.LogicalExpression?.(logicalExpression);

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasIsInfinite",
                        });
                        expect(
                            createSafeValueArgumentFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);

                        const replacementText = `isInfinite(${comparedExpressionText})`;
                        const fixedCode =
                            code.slice(0, logicalRange[0]) +
                            replacementText +
                            code.slice(logicalRange[1]);

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrowError();
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

    it("fast-check: disjunctions with different compared expressions never use the logical-expression fix", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type?: string }>,
                    name: string
                ) => node.type === "Identifier" && node.name === name,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueArgumentFunctionCallFix:
                    createSafeValueArgumentFunctionCallFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-infinite")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    generatedMismatchedDisjunctionCaseArbitrary,
                    (generatedCase) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const firstComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: "firstMetric",
                                infinityReferenceText:
                                    getPositiveInfinityReferenceText(
                                        generatedCase.positiveInfinityReferenceKind
                                    ),
                                orientation: generatedCase.firstOrientation,
                            });
                        const secondComparisonText =
                            buildStrictInfinityComparisonText({
                                comparedExpressionText: "secondMetric",
                                infinityReferenceText:
                                    "Number.NEGATIVE_INFINITY",
                                orientation: generatedCase.secondOrientation,
                            });

                        const disjunctionTerms = generatedCase.reverseOrder
                            ? [secondComparisonText, firstComparisonText]
                            : [firstComparisonText, secondComparisonText];

                        const code = [
                            "declare const firstMetric: number;",
                            "declare const secondMetric: number;",
                            generatedCase.includeUnicodeLine
                                ? 'const marker = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                                : "",
                            `const isInfiniteMetric = ${disjunctionTerms[0]} || ${disjunctionTerms[1]};`,
                            "String(isInfiniteMetric);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, logicalExpression } =
                            parseLogicalDisjunctionFromCode(code);
                        const reports: Readonly<{ messageId?: string }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{ messageId?: string }>
                            ) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText: () => code,
                            },
                        });

                        listeners.LogicalExpression?.(logicalExpression);

                        expect(reports).toHaveLength(0);
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

ruleTester.run("prefer-ts-extras-is-infinite", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasIsInfinite",
                },
                {
                    messageId: "preferTsExtrasIsInfinite",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture infinity comparisons",
        },
        {
            code: inlineInvalidPositiveInfinityCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports loose equality against Number.POSITIVE_INFINITY",
        },
        {
            code: inlineInvalidLeftInfinityCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict equality with Infinity literal on left",
        },
        {
            code: inlineFixableDualSignCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes strict dual-sign infinity disjunction when isInfinite import is in scope",
            output: inlineFixableDualSignOutput,
        },
        {
            code: inlineFixableInfinityIdentifierDualSignCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes strict dual-sign disjunction when Infinity identifier appears on left",
            output: inlineFixableInfinityIdentifierDualSignOutput,
        },
        {
            code: inlineInvalidMixedStrictnessDualSignCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports mixed strictness dual-sign disjunction without treating it as safe helper target",
        },
        {
            code: inlineParenthesizedDisjunctionCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes paired disjunction when one compared expression is parenthesized",
            output: inlineParenthesizedDisjunctionOutput,
        },
        {
            code: inlineInvalidSameSignStrictDisjunctionCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict disjunction comparing only positive infinity variants",
        },
        {
            code: inlineInvalidDifferentComparedExpressionsCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict dual-sign disjunction when compared expressions differ",
        },
        {
            code: inlineInvalidLogicalAndDualSignCode,
            errors: [
                { messageId: "preferTsExtrasIsInfinite" },
                { messageId: "preferTsExtrasIsInfinite" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports logical-and dual-sign comparisons without collapsing into helper form",
        },
        {
            code: inlineInvalidMathNegativeInfinityDisjunctionCode,
            errors: [{ messageId: "preferTsExtrasIsInfinite" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports only Number infinity comparisons when paired side is non-Number member",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidNonEqualityOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-equality infinity comparison",
        },
        {
            code: inlineValidWithoutInfinityReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparison without infinity reference",
        },
        {
            code: inlineValidComputedInfinityMemberCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Number infinity member access",
        },
        {
            code: inlineValidOtherObjectInfinityMemberCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores infinity member access on non-Number object",
        },
        {
            code: inlineValidNonInfinityNumberPropertyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number member comparisons that are not infinity constants",
        },
        {
            code: inlineValidShadowedInfinityBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores comparisons against shadowed Infinity identifiers",
        },
        {
            code: inlineValidShadowedNumberBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Number infinity member checks when Number binding is shadowed",
        },
    ],
});

