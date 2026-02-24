import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-array.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-unknown-array";
const docsDescription =
    "require TypeFest UnknownArray over readonly unknown[] and ReadonlyArray<unknown> aliases.";
const preferUnknownArrayMessage =
    "Prefer `Readonly<UnknownArray>` from type-fest over `readonly unknown[]` or `ReadonlyArray<unknown>`.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unknown-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-unknown-array.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { UnknownArray } from "type-fest";\n${invalidFixtureCode.replace(
    "readonly unknown[]",
    "Readonly<UnknownArray>"
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "ReadonlyArray<unknown>",
    "Readonly<UnknownArray>"
);
const inlineInvalidReadonlyArrayCode = "type Input = readonly unknown[];";
const inlineInvalidReadonlyArrayOutputCode = [
    'import type { UnknownArray } from "type-fest";',
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineValidArrayCode = "type Input = unknown[];";
const inlineValidAnyArrayCode = "type Input = readonly any[];";
const inlineValidNoTypeArgumentCode = "type Input = ReadonlyArray<string>;";
const inlineValidAnyTypeArgumentCode = "type Input = ReadonlyArray<any>;";
const inlineValidUnknownUnionTypeArgumentCode =
    "type Input = ReadonlyArray<unknown | string>;";
const inlineValidQualifiedReadonlyArrayCode =
    "type Input = globalThis.ReadonlyArray<unknown>;";
const inlineValidKeyofUnknownArrayCode = "type Input = keyof unknown[];";
const inlineInvalidReadonlyNonArrayOperatorCode =
    "type Input = readonly ReadonlyArray<unknown>;";
const inlineInvalidReadonlyNonArrayOperatorOutputCode = [
    'import type { UnknownArray } from "type-fest";',
    "type Input = readonly Readonly<UnknownArray>;",
].join("\n");
const inlineValidMissingReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray;";
const inlineValidExtraReadonlyArrayTypeArgumentCode =
    "type Input = ReadonlyArray<unknown, string>;";
const inlineValidNestedUnknownArrayTypeArgumentCode =
    "type Input = ReadonlyArray<unknown[]>;";
const inlineValidCustomGenericUnknownCode = [
    "type Box<T> = T;",
    "type Input = Box<unknown>;",
].join("\n");
const skipPathInvalidCode = inlineInvalidReadonlyArrayCode;
const inlineInvalidWithoutFixCode = "type Input = ReadonlyArray<unknown>;";
const inlineInvalidWithoutFixOutputCode = [
    'import type { UnknownArray } from "type-fest";',
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineReadonlyNonArrayOperatorFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly ReadonlyArray<unknown>;",
].join("\n");
const inlineReadonlyNonArrayOperatorFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly Readonly<UnknownArray>;",
].join("\n");
const inlineReadonlyShorthandFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = readonly unknown[];",
].join("\n");
const inlineReadonlyShorthandFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = Readonly<UnknownArray>;",
].join("\n");
const inlineFixableCode = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = ReadonlyArray<unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownArray } from "type-fest";',
    "",
    "type Input = Readonly<UnknownArray>;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferUnknownArray: preferUnknownArrayMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-unknown-array internal readonly-array identifier guard", () => {
    it("reports ReadonlyArray<unknown> but ignores other generic identifiers", async () => {
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];
        const replacementFixCalls: (readonly unknown[])[] = [];

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () => new Set<string>(),
                createSafeTypeNodeReplacementFixPreservingReadonly: (
                    ...parameters: readonly unknown[]
                ) => {
                    replacementFixCalls.push(parameters);

                    return null;
                },
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-unknown-array")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = undecoratedRuleModule.default.create({
                filename: "src/example.ts",
                report(
                    descriptor: Readonly<{ messageId?: string; node?: unknown }>
                ) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const referenceListener = listeners.TSTypeReference;

            expect(referenceListener).toBeTypeOf("function");

            const readonlyArrayUnknownNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [{ type: "TSUnknownKeyword" }],
                },
                typeName: {
                    name: "ReadonlyArray",
                    type: "Identifier",
                },
            };
            const customGenericUnknownNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [{ type: "TSUnknownKeyword" }],
                },
                typeName: {
                    name: "Box",
                    type: "Identifier",
                },
            };

            referenceListener?.(readonlyArrayUnknownNode);
            referenceListener?.(customGenericUnknownNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferUnknownArray",
                node: readonlyArrayUnknownNode,
            });
            expect(replacementFixCalls).toHaveLength(1);
            expect(replacementFixCalls[0]?.[1]).toBe("UnknownArray");
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
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
                {
                    messageId: "preferUnknownArray",
                },
                {
                    messageId: "preferUnknownArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture readonly unknown array aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReadonlyArrayCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly unknown array shorthand alias",
            output: inlineInvalidReadonlyArrayOutputCode,
        },
        {
            code: inlineInvalidReadonlyNonArrayOperatorCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports readonly operator over unknown[] type reference",
            output: inlineInvalidReadonlyNonArrayOperatorOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyArray<unknown> even when UnknownArray import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineReadonlyShorthandFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes readonly unknown[] when UnknownArray import is in scope",
            output: inlineReadonlyShorthandFixableOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes ReadonlyArray<unknown> when UnknownArray import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineReadonlyNonArrayOperatorFixableCode,
            errors: [{ messageId: "preferUnknownArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes nested ReadonlyArray<unknown> inside readonly type operator when UnknownArray import is in scope",
            output: inlineReadonlyNonArrayOperatorFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mutable unknown array shorthand",
        },
        {
            code: inlineValidAnyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly any array shorthand",
        },
        {
            code: inlineValidNoTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array with concrete element type",
        },
        {
            code: inlineValidAnyTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray<any>",
        },
        {
            code: inlineValidUnknownUnionTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray where type argument is not exactly unknown",
        },
        {
            code: inlineValidQualifiedReadonlyArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.ReadonlyArray qualified type reference",
        },
        {
            code: inlineValidKeyofUnknownArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores keyof unknown[] type query",
        },
        {
            code: inlineValidMissingReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without explicit unknown element",
        },
        {
            code: inlineValidExtraReadonlyArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray with extra type arguments",
        },
        {
            code: inlineValidNestedUnknownArrayTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray with nested unknown[] element type",
        },
        {
            code: inlineValidCustomGenericUnknownCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-ReadonlyArray generic with unknown type argument",
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-unknown-array.skip.ts"
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
