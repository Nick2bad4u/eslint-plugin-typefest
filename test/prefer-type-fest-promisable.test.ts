/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-promisable.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
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

const ruleTester = createTypedRuleTester();
const invalidFixtureName = "prefer-type-fest-promisable.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);

const inlineFixableInvalidCode = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type JobResult = MaybePromise<string>;",
    "type JobResult = Promisable<string>;"
);
const inlineInvalidWithoutFixCode = [
    'import type { MaybePromise } from "type-aliases";',
    "",
    "type JobResult = MaybePromise<string>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = [
    'import type { MaybePromise } from "type-aliases";',
    'import type { Promisable } from "type-fest";',
    "",
    "type JobResult = Promisable<string>;",
].join("\n");
const promiseFirstInvalidCode = "type Result = Promise<string> | string;";
const promiseSecondInvalidCode = "type Result = string | Promise<string>;";
const promiseLikeValidCode = "type Result = PromiseLike<string> | string;";
const promiseNoTypeArgumentsValidCode = "type Result = Promise | string;";
const promiseNullValidCode = "type Result = Promise<string> | null;";
const promiseUndefinedUnionValidCode =
    "type Result = Promise<string> | undefined;";
const promiseUndefinedValidCode =
    "type Result = PromiseLike<string> | undefined;";
const promiseNeverValidCode = "type Result = Promise<string> | never;";
const promiseNullInnerMatchValidCode = "type Result = Promise<null> | null;";
const promiseUndefinedInnerMatchValidCode =
    "type Result = Promise<undefined> | undefined;";
const promiseNeverInnerMatchValidCode = "type Result = Promise<never> | never;";
const doublePromiseUnionValidCode =
    "type Result = Promise<string> | Promise<string>;";
const promiseMismatchValidCode = "type Result = Promise<string> | number;";
const promiseThreeMemberUnionValidCode =
    "type Result = Promise<string> | number | string;";
const promiseThreeMemberLeadingPairValidCode =
    "type Result = Promise<string> | string | boolean;";
const promiseThreeMemberLeadingReversePairValidCode =
    "type Result = string | Promise<string> | boolean;";
const promiseFourMemberLeadingPairValidCode =
    "type Result = Promise<string> | string | boolean | number;";
const promiseFourMemberLeadingReversePairValidCode =
    "type Result = string | Promise<string> | boolean | number;";
const nullFirstPromiseSecondValidCode = "type Result = null | Promise<string>;";
const undefinedFirstPromiseSecondValidCode =
    "type Result = undefined | Promise<string>;";
const neverFirstPromiseSecondValidCode =
    "type Result = never | Promise<string>;";
const alreadyPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<string> | Promisable<string>;",
].join("\n");
const nestedPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string>;",
].join("\n");
const reverseNestedPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promisable<string> | Promise<Promisable<string>>;",
].join("\n");
const threeMemberPromisableUnionValidCode = [
    'import type { Promisable } from "type-fest";',
    "type Result = Promise<Promisable<string>> | Promisable<string> | boolean;",
].join("\n");
const qualifiedPromiseValidCode =
    "type Result = globalThis.Promise<string> | string;";
const customWrapperValidCode = [
    "type MaybePromise<T> = Promise<T>;",
    "type Result = MaybePromise<string> | string;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-promisable", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest Promisable for sync-or-async callback contracts currently expressed as Promise<T> | T unions.",
    enforceRuleShape: true,
    messages: {
        preferPromisable:
            "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
    },
    name: "prefer-type-fest-promisable",
});

describe("prefer-type-fest-promisable source assertions", () => {
    it("tSUnionType visitor reports only strict Promise<T> | T pairs", async () => {
        const code = [
            'import type { Promisable } from "type-fest";',
            "type ShouldReportPromiseFirst = Promise<string> | string;",
            "type ShouldReportPromiseSecond = string | Promise<string>;",
            "type ShouldSkipPromisable = Promise<Promisable<string>> | Promisable<string>;",
            "type ShouldSkipNull = Promise<null> | null;",
            "type ShouldSkipUndefined = Promise<undefined> | undefined;",
            "type ShouldSkipNever = Promise<never> | never;",
        ].join("\n");

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-promisable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(code, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const getNodeText = (node: unknown): string => {
                if (
                    typeof node !== "object" ||
                    node === null ||
                    !("range" in node)
                ) {
                    return "";
                }

                const nodeRange = (
                    node as { range?: readonly [number, number] }
                ).range;
                if (!nodeRange) {
                    return "";
                }

                const [start, end] = nodeRange;
                return code.slice(start, end);
            };

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-promisable.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                    getText: getNodeText,
                },
            });

            const unionTypeNodes: unknown[] = [];

            for (const statement of parsedResult.ast.body) {
                if (statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
                    const aliasAnnotation = statement.typeAnnotation;

                    if (aliasAnnotation.type === AST_NODE_TYPES.TSUnionType) {
                        unionTypeNodes.push(aliasAnnotation);
                    }
                }
            }

            expect(unionTypeNodes).toHaveLength(6);

            for (const unionTypeNode of unionTypeNodes) {
                listenerMap.TSUnionType?.(unionTypeNode);
            }

            expect(report).toHaveBeenCalledTimes(2);
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-type-fest-promisable internal listener guards", () => {
    it("handles missing alias fixes and malformed two-member unions", async () => {
        const reportCalls: Readonly<{ messageId?: string }>[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () => new Set<string>(),
                collectImportedTypeAliasMatches: () =>
                    new Map([
                        ["MaybePromise", { replacementName: "Promisable" }],
                    ]),
                createSafeTypeReferenceReplacementFix: () => null,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-type-fest-promisable")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                    getText: () => "string",
                },
            });

            listeners.TSTypeReference?.({
                type: "TSTypeReference",
                typeArguments: {
                    params: [{ type: "TSStringKeyword" }],
                },
                typeName: {
                    name: "MaybePromise",
                    type: "Identifier",
                },
            });

            listeners.TSUnionType?.({
                type: "TSUnionType",
                types: [{ type: "TSStringKeyword" }, undefined],
            });

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferPromisable",
            });
            expect(reportCalls[0]).not.toMatchObject({
                fix: expect.anything(),
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

type PromisableReportDescriptor = Readonly<{
    fix?: TSESLint.ReportFixFunction;
    messageId?: string;
}>;

type PromisableRuleModule = Readonly<{
    create: (context: unknown) => {
        TSTypeReference?: (node: TSESTree.TSTypeReference) => void;
    };
}>;

type PromisableTypeReferenceParseResult = Readonly<{
    ast: TSESTree.Program;
    sourceText: string;
    targetTypeReferenceNode: TSESTree.TSTypeReference;
}>;

type TextEdit = Readonly<{
    range: readonly [number, number];
    text: string;
}>;

const promisableRule = getPluginRule(
    "prefer-type-fest-promisable"
) as PromisableRuleModule;

const promisableTypeArgumentArbitrary = fc.constantFrom(
    "string",
    "number",
    "boolean",
    "string | number",
    "Array<string>",
    "ReadonlyArray<number>",
    "Promise<string>",
    "Record<'key', number>",
    "{ readonly id: string }",
    "readonly [string, number]"
);

const isRangeNode = (
    value: unknown
): value is Readonly<{
    range: readonly [number, number];
}> => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const maybeRange = (value as { range?: unknown }).range;

    return (
        Array.isArray(maybeRange) &&
        maybeRange.length === 2 &&
        typeof maybeRange[0] === "number" &&
        typeof maybeRange[1] === "number"
    );
};

const assertIsFixFunction: (
    value: unknown
) => asserts value is TSESLint.ReportFixFunction = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected fixer to be a function");
    }
};

const getSourceTextForNode = (sourceText: string, node: unknown): string => {
    if (!isRangeNode(node)) {
        return "";
    }

    const [start, end] = node.range;

    return sourceText.slice(start, end);
};

const parsePromisableTypeReferenceFromCode = (
    sourceText: string
): PromisableTypeReferenceParseResult => {
    const parsedResult = parser.parseForESLint(sourceText, {
        ecmaVersion: "latest",
        loc: true,
        range: true,
        sourceType: "module",
    });

    let targetTypeReferenceNode: null | TSESTree.TSTypeReference = null;
    let targetAliasNode: null | TSESTree.TSTypeAliasDeclaration = null;

    for (const statement of parsedResult.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "JobResult"
        ) {
            const aliasAnnotation = statement.typeAnnotation;

            if (
                aliasAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
                aliasAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
                aliasAnnotation.typeName.name === "MaybePromise"
            ) {
                targetAliasNode = statement;
                targetTypeReferenceNode = aliasAnnotation;
                break;
            }
        }
    }

    if (targetTypeReferenceNode === null || targetAliasNode === null) {
        throw new TypeError(
            "Expected a JobResult alias with MaybePromise<T> type reference"
        );
    }

    const targetTypeReferenceNodeWithParent =
        targetTypeReferenceNode as TSESTree.TSTypeReference & {
            parent?: TSESTree.Node;
        };
    targetTypeReferenceNodeWithParent.parent ??= targetAliasNode;

    const targetAliasNodeWithParent =
        targetAliasNode as TSESTree.TSTypeAliasDeclaration & {
            parent?: TSESTree.Node;
        };
    targetAliasNodeWithParent.parent ??= parsedResult.ast;

    return {
        ast: parsedResult.ast,
        sourceText,
        targetTypeReferenceNode,
    };
};

const collectTextEditsFromFix = (
    fix: TSESLint.ReportFixFunction
): readonly TextEdit[] => {
    const textEdits: TextEdit[] = [];

    const fakeFixer = {
        insertTextAfter(target: unknown, text: string): TextEdit {
            if (!isRangeNode(target)) {
                throw new TypeError("insertTextAfter target is missing range");
            }

            const [, end] = target.range;
            const textEdit: TextEdit = {
                range: [end, end],
                text,
            };

            textEdits.push(textEdit);
            return textEdit;
        },
        insertTextBeforeRange(
            range: readonly [number, number],
            text: string
        ): TextEdit {
            const [start, end] = range;
            const textEdit: TextEdit = {
                range: [start, end],
                text,
            };

            textEdits.push(textEdit);
            return textEdit;
        },
        replaceText(target: unknown, text: string): TextEdit {
            if (!isRangeNode(target)) {
                throw new TypeError("replaceText target is missing range");
            }

            const [start, end] = target.range;
            const textEdit: TextEdit = {
                range: [start, end],
                text,
            };

            textEdits.push(textEdit);
            return textEdit;
        },
    } as unknown as TSESLint.RuleFixer;

    const fixResult = fix(fakeFixer);

    expect(fixResult).not.toBeNull();

    return textEdits;
};

const applyTextEdits = (
    sourceText: string,
    textEdits: readonly TextEdit[]
): string => {
    const sortedTextEdits: TextEdit[] = [];

    for (const textEdit of textEdits) {
        let insertIndex = 0;

        while (insertIndex < sortedTextEdits.length) {
            const existingEdit = sortedTextEdits[insertIndex]!;
            const shouldInsertBeforeExisting =
                textEdit.range[0] > existingEdit.range[0] ||
                (textEdit.range[0] === existingEdit.range[0] &&
                    textEdit.range[1] > existingEdit.range[1]);

            if (shouldInsertBeforeExisting) {
                break;
            }

            insertIndex += 1;
        }

        sortedTextEdits.splice(insertIndex, 0, textEdit);
    }

    let nextSourceText = sourceText;

    for (const textEdit of sortedTextEdits) {
        const [start, end] = textEdit.range;
        nextSourceText =
            nextSourceText.slice(0, start) +
            textEdit.text +
            nextSourceText.slice(end);
    }

    return nextSourceText;
};

const runPromisableTypeReferenceReport = (
    sourceText: string
): Readonly<{
    reportDescriptor: PromisableReportDescriptor;
    targetTypeReferenceNode: TSESTree.TSTypeReference;
}> => {
    const parsedCode = parsePromisableTypeReferenceFromCode(sourceText);
    const reportDescriptors: PromisableReportDescriptor[] = [];

    const listenerMap = promisableRule.create({
        filename: "src/example.ts",
        report(descriptor: PromisableReportDescriptor): void {
            reportDescriptors.push(descriptor);
        },
        sourceCode: {
            ast: parsedCode.ast,
            getText(node: unknown): string {
                return getSourceTextForNode(parsedCode.sourceText, node);
            },
        },
    });

    listenerMap.TSTypeReference?.(parsedCode.targetTypeReferenceNode);

    expect(reportDescriptors).toHaveLength(1);

    return {
        reportDescriptor: reportDescriptors[0]!,
        targetTypeReferenceNode: parsedCode.targetTypeReferenceNode,
    };
};

const buildPromisableAliasCode = (
    innerTypeText: string,
    options: Readonly<{
        includeDirective: boolean;
        includePromisableImport: boolean;
        includeValueImport: boolean;
    }>
): string => {
    const codeLines: string[] = [];

    if (options.includeDirective) {
        codeLines.push('"use client";');
    }

    codeLines.push('import type { MaybePromise } from "type-aliases";');

    if (options.includePromisableImport) {
        codeLines.push('import type { Promisable } from "type-fest";');
    }

    if (options.includeValueImport) {
        codeLines.push('import { noop } from "./noop";');
    }

    codeLines.push("", `type JobResult = MaybePromise<${innerTypeText}>;`);

    if (options.includeValueImport) {
        codeLines.push("void noop;");
    }

    return codeLines.join("\n");
};

describe("prefer-type-fest-promisable fast-check fix safety", () => {
    it("fast-check: alias autofix preserves parseability when Promisable import already exists", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                promisableTypeArgumentArbitrary,
                fc.boolean(),
                fc.boolean(),
                (innerTypeText, includeDirective, includeValueImport) => {
                    const sourceText = buildPromisableAliasCode(innerTypeText, {
                        includeDirective,
                        includePromisableImport: true,
                        includeValueImport,
                    });

                    const { reportDescriptor, targetTypeReferenceNode } =
                        runPromisableTypeReferenceReport(sourceText);

                    expect(reportDescriptor.messageId).toBe("preferPromisable");

                    const maybeFix: unknown = reportDescriptor.fix;
                    assertIsFixFunction(maybeFix);
                    const textEdits = collectTextEditsFromFix(maybeFix);

                    expect(textEdits).toHaveLength(1);

                    const fixedCode = applyTextEdits(sourceText, textEdits);
                    const innerTypeTextFromNode =
                        targetTypeReferenceNode.typeArguments?.params[0] ===
                        undefined
                            ? "unknown"
                            : getSourceTextForNode(
                                  sourceText,
                                  targetTypeReferenceNode.typeArguments
                                      .params[0]
                              );

                    expect(fixedCode).toContain(
                        `type JobResult = Promisable<${innerTypeTextFromNode}>;`
                    );

                    expect(() =>
                        parser.parseForESLint(fixedCode, {
                            ecmaVersion: "latest",
                            loc: true,
                            range: true,
                            sourceType: "module",
                        })
                    ).not.toThrowError();
                }
            ),
            fastCheckRunConfig.runs60
        );
    });

    it("fast-check: alias autofix inserts missing Promisable import and keeps output parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                promisableTypeArgumentArbitrary,
                fc.boolean(),
                fc.boolean(),
                (innerTypeText, includeDirective, includeValueImport) => {
                    const sourceText = buildPromisableAliasCode(innerTypeText, {
                        includeDirective,
                        includePromisableImport: false,
                        includeValueImport,
                    });

                    const { reportDescriptor, targetTypeReferenceNode } =
                        runPromisableTypeReferenceReport(sourceText);

                    expect(reportDescriptor.messageId).toBe("preferPromisable");

                    const maybeFix: unknown = reportDescriptor.fix;
                    assertIsFixFunction(maybeFix);
                    const textEdits = collectTextEditsFromFix(maybeFix);

                    expect(textEdits.length).toBeGreaterThanOrEqual(2);

                    const fixedCode = applyTextEdits(sourceText, textEdits);
                    const innerTypeTextFromNode =
                        targetTypeReferenceNode.typeArguments?.params[0] ===
                        undefined
                            ? "unknown"
                            : getSourceTextForNode(
                                  sourceText,
                                  targetTypeReferenceNode.typeArguments
                                      .params[0]
                              );

                    expect(fixedCode).toContain(
                        'import type { Promisable } from "type-fest";'
                    );
                    expect(fixedCode).toContain(
                        `type JobResult = Promisable<${innerTypeTextFromNode}>;`
                    );

                    expect(() =>
                        parser.parseForESLint(fixedCode, {
                            ecmaVersion: "latest",
                            loc: true,
                            range: true,
                            sourceType: "module",
                        })
                    ).not.toThrowError();
                }
            ),
            fastCheckRunConfig.runs60
        );
    });
});

ruleTester.run(
    "prefer-type-fest-promisable",
    getPluginRule("prefer-type-fest-promisable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Promise<T> | T unions",
                output: null,
            },
            {
                code: promiseFirstInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union with Promise first and value second",
                output: null,
            },
            {
                code: promiseSecondInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports union with value first and Promise second",
                output: null,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes imported MaybePromise alias",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferPromisable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports alias usage when Promisable import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-promisable.valid.ts"),
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "accepts fixture-safe patterns",
            },
            {
                code: promiseNoTypeArgumentsValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise without explicit type arguments",
            },
            {
                code: qualifiedPromiseValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores globalThis.Promise union",
            },
            {
                code: customWrapperValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores custom Promise wrapper alias",
            },
            {
                code: promiseLikeValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores PromiseLike union",
            },
            {
                code: promiseNullValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with null",
            },
            {
                code: promiseUndefinedValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores PromiseLike union with undefined",
            },
            {
                code: promiseUndefinedUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with undefined",
            },
            {
                code: promiseNeverValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with never",
            },
            {
                code: promiseNullInnerMatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise<null> union with matching null member",
            },
            {
                code: promiseUndefinedInnerMatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise<undefined> union with matching undefined member",
            },
            {
                code: promiseNeverInnerMatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise<never> union with matching never member",
            },
            {
                code: doublePromiseUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union containing only Promise members",
            },
            {
                code: promiseMismatchValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores Promise union with mismatched non-base type",
            },
            {
                code: promiseThreeMemberUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union containing more than Promise and base pair",
            },
            {
                code: promiseThreeMemberLeadingPairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores three-member union even when first two members form a Promise pair",
            },
            {
                code: promiseThreeMemberLeadingReversePairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores three-member union even when first two members form a reverse Promise pair",
            },
            {
                code: promiseFourMemberLeadingPairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores four-member union even when first two members form a Promise pair",
            },
            {
                code: promiseFourMemberLeadingReversePairValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores four-member union even when first two members form a reverse Promise pair",
            },
            {
                code: nullFirstPromiseSecondValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores null-first union with Promise second",
            },
            {
                code: undefinedFirstPromiseSecondValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores undefined-first union with Promise second",
            },
            {
                code: neverFirstPromiseSecondValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores never-first union with Promise second",
            },
            {
                code: alreadyPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union already using Promisable",
            },
            {
                code: nestedPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores union where Promise inner type is already Promisable",
            },
            {
                code: reverseNestedPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores reverse-order union where Promise inner type is already Promisable",
            },
            {
                code: threeMemberPromisableUnionValidCode,
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.valid.ts"
                ),
                name: "ignores multi-member union that already contains Promisable",
            },
        ],
    }
);
