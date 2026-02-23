/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-arrayable";
const docsDescription =
    "require TypeFest Arrayable over T | T[] and T | Array<T> unions.";
const preferArrayableMessage =
    "Prefer `Arrayable<T>` from type-fest over `T | T[]` or `T | Array<T>` unions.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-arrayable.valid.ts";
const invalidFixtureName = "prefer-type-fest-arrayable.invalid.ts";

const inlineInvalidCode = "type QueryValue = string | string[];";
const inlineInvalidReversedCode = "type QueryValue = string[] | string;";
const inlineInvalidReadonlyArrayCode =
    "type QueryValue = string | readonly string[];";
const inlineInvalidGenericArrayCode =
    "type QueryValue = string | Array<string>;";
const inlineInvalidGenericArrayReversedCode =
    "type QueryValue = Array<string> | string;";
const inlineInvalidWhitespaceNormalizedGenericArrayCode =
    "type QueryValue = Map < string , number > | Array<Map<string, number>>;";
const inlineInvalidWhitespaceNormalizedGenericArrayReversedCode =
    "type QueryValue = Array<Map < string , number >> | Map<string, number>;";

const nonMatchingUnionValidCode = "type QueryValue = string | number[];";
const singleTypeValidCode = "type QueryValue = string;";
const threeMemberUnionValidCode = "type QueryValue = string | string[] | null;";
const genericArrayMissingTypeArgumentValidCode =
    "type QueryValue = string | Array;";
const genericArrayExtraTypeArgumentValidCode =
    "type QueryValue = string | Array<string, number>;";
const genericArrayMismatchedElementValidCode =
    "type QueryValue = string | Array<number>;";
const reversedGenericArrayMismatchedElementValidCode =
    "type QueryValue = Array<number> | string;";
const qualifiedGenericArrayValidCode =
    "type QueryValue = string | globalThis.Array<string>;";
const nonArrayGenericMatchingElementValidCode = [
    "type Box<T> = T;",
    "type QueryValue = string | Box<string>;",
].join("\n");
const bothMembersAreNativeArraysValidCode =
    "type QueryValue = string[] | string[];";
const inlineFixableCode = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = string | string[];",
].join("\n");
const inlineFixableOutput = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineGenericFixableCode = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = string | Array<string>;",
].join("\n");
const inlineGenericFixableOutput = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineGenericFixableReversedCode = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Array<string> | string;",
].join("\n");
const inlineGenericFixableReversedOutput = [
    'import type { Arrayable } from "type-fest";',
    "",
    "type QueryValue = Arrayable<string>;",
].join("\n");
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { Arrayable } from "type-fest";\n${invalidFixtureCode.replace(
    "Array<number> | number",
    "Arrayable<number>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "string | string[]",
    "Arrayable<string>"
);
const inlineInvalidOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidReversedOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidGenericArrayOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidGenericArrayReversedOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<string>;",
].join("\n");
const inlineInvalidWhitespaceNormalizedGenericArrayOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<Map < string , number >>;",
].join("\n");
const inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode = [
    'import type { Arrayable } from "type-fest";',
    "type QueryValue = Arrayable<Map<string, number>>;",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferArrayable: preferArrayableMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-arrayable internal generic Array<T> guard", () => {
    it("reports only matching Array<T> union shapes", async () => {
        const replacementFixCalls: unknown[][] = [];
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];

        const createIdentifierNode = (name: string) => ({
            name,
            type: "Identifier",
        });
        const createKeywordTypeNode = (
            type: "TSNumberKeyword" | "TSStringKeyword",
            text: string
        ) => ({
            text,
            type,
        });
        const createTypeReferenceNode = (
            typeName: string,
            typeArguments: unknown[] = [],
            text = typeArguments.length === 0
                ? typeName
                : `${typeName}<${String(typeArguments[0] ?? "")}>`
        ) => ({
            text,
            type: "TSTypeReference",
            typeArguments:
                typeArguments.length === 0
                    ? undefined
                    : {
                          params: typeArguments,
                      },
            typeName: createIdentifierNode(typeName),
        });
        const createUnionNode = (...types: unknown[]) => ({
            type: "TSUnionType",
            types,
        });

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () => new Set<string>(),
                createSafeTypeNodeTextReplacementFix: (
                    ...parameters: unknown[]
                ) => {
                    replacementFixCalls.push(parameters);

                    return null;
                },
            }));

            const authoredRuleModule = (await import(
                "../src/rules/prefer-type-fest-arrayable.ts"
            )) as {
                default: {
                    create: (context: unknown) => {
                        TSUnionType?: (node: unknown) => void;
                    };
                };
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: { messageId?: string; node?: unknown }) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    getText(node: { text?: string }) {
                        return node.text ?? "";
                    },
                },
            });

            const unionTypeListener = listeners.TSUnionType;

            expect(unionTypeListener).toBeTypeOf("function");

            const stringKeywordNode = createKeywordTypeNode(
                "TSStringKeyword",
                "string"
            );
            const numberKeywordNode = createKeywordTypeNode(
                "TSNumberKeyword",
                "number"
            );

            const validRightGenericNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode("Array", [stringKeywordNode], "Array<string>")
            );
            const validLeftGenericNode = createUnionNode(
                createTypeReferenceNode("Array", [stringKeywordNode], "Array<string>"),
                stringKeywordNode
            );
            const invalidNonArrayGenericNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode("Box", [stringKeywordNode], "Box<string>")
            );
            const invalidMismatchedLeftGenericNode = createUnionNode(
                createTypeReferenceNode("Array", [numberKeywordNode], "Array<number>"),
                stringKeywordNode
            );
            const invalidMissingGenericArgumentNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode("Array", [], "Array")
            );
            const invalidThreeMemberUnionNode = createUnionNode(
                stringKeywordNode,
                createTypeReferenceNode("Array", [stringKeywordNode], "Array<string>"),
                {
                    text: "null",
                    type: "TSNullKeyword",
                }
            );

            unionTypeListener?.(validRightGenericNode);
            unionTypeListener?.(validLeftGenericNode);
            unionTypeListener?.(invalidNonArrayGenericNode);
            unionTypeListener?.(invalidMismatchedLeftGenericNode);
            unionTypeListener?.(invalidMissingGenericArgumentNode);
            unionTypeListener?.(invalidThreeMemberUnionNode);

            expect(reportCalls).toHaveLength(2);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferArrayable",
                node: validRightGenericNode,
            });
            expect(reportCalls[1]).toMatchObject({
                messageId: "preferArrayable",
                node: validLeftGenericNode,
            });
            expect(replacementFixCalls).toHaveLength(2);
            expect(replacementFixCalls[0]?.[1]).toBe("Arrayable");
            expect(replacementFixCalls[1]?.[1]).toBe("Arrayable");
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
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
                    { messageId: "preferArrayable" },
                    { messageId: "preferArrayable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string-or-array unions",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string | string[] union",
                output: inlineInvalidOutputCode,
            },
            {
                code: inlineInvalidReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed string[] | string union",
                output: inlineInvalidReversedOutputCode,
            },
            {
                code: inlineInvalidGenericArrayCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports string | Array<string> union",
                output: inlineInvalidGenericArrayOutputCode,
            },
            {
                code: inlineInvalidGenericArrayReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed Array<string> | string union",
                output: inlineInvalidGenericArrayReversedOutputCode,
            },
            {
                code: inlineInvalidWhitespaceNormalizedGenericArrayCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports generic unions when element text only differs by whitespace",
                output: inlineInvalidWhitespaceNormalizedGenericArrayOutputCode,
            },
            {
                code: inlineInvalidWhitespaceNormalizedGenericArrayReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports reversed generic unions when element text only differs by whitespace",
                output: inlineInvalidWhitespaceNormalizedGenericArrayReversedOutputCode,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes T | T[] union when Arrayable import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineGenericFixableCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes T | Array<T> union when Arrayable import is in scope",
                output: inlineGenericFixableOutput,
            },
            {
                code: inlineGenericFixableReversedCode,
                errors: [{ messageId: "preferArrayable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes reversed Array<T> | T union when Arrayable import is in scope",
                output: inlineGenericFixableReversedOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: nonMatchingUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with mismatched array element types",
            },
            {
                code: singleTypeValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores single non-union type alias",
            },
            {
                code: threeMemberUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with more than two members",
            },
            {
                code: genericArrayMissingTypeArgumentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array without type arguments",
            },
            {
                code: genericArrayExtraTypeArgumentValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array with extra type arguments",
            },
            {
                code: genericArrayMismatchedElementValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores generic array with mismatched element type",
            },
            {
                code: reversedGenericArrayMismatchedElementValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores reversed generic array with mismatched element type",
            },
            {
                code: nonArrayGenericMatchingElementValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-Array generic with matching element type",
            },
            {
                code: bothMembersAreNativeArraysValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions where both members are native arrays",
            },
            {
                code: qualifiedGenericArrayValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores globalThis.Array qualified generic unions",
            },
            {
                code: inlineInvalidReadonlyArrayCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores readonly array unions already matching Arrayable semantics",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-arrayable.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
