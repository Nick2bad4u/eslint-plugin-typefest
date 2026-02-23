/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-array.test` behavior.
 */
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-json-array";
const docsDescription =
    "require TypeFest JsonArray over explicit JsonValue[] | readonly JsonValue[] style unions.";
const preferJsonArrayMessage =
    "Prefer `JsonArray` from type-fest over explicit JsonValue array unions.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-array.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-array.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { JsonValue } from "type-fest";\r\n',
        'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";\r\n'
    )
    .replace("JsonValue[] | readonly JsonValue[]", "JsonArray");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "    | Array<JsonValue>\r\n    | ReadonlyArray<JsonValue>",
    "    JsonArray"
);
const inlineInvalidReversedNativeUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type ReversedNative = readonly JsonValue[] | JsonValue[];",
].join("\n");
const inlineInvalidReversedNativeUnionOutputCode =
    inlineInvalidReversedNativeUnionCode
        .replace(
            'import type { JsonValue } from "type-fest";',
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";'
        )
        .replace("readonly JsonValue[] | JsonValue[]", "JsonArray");
const inlineInvalidReversedGenericUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type ReversedGeneric = ReadonlyArray<JsonValue> | Array<JsonValue>;",
].join("\n");
const inlineInvalidReversedGenericUnionOutputCode =
    inlineInvalidReversedGenericUnionCode
        .replace(
            'import type { JsonValue } from "type-fest";',
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";'
        )
        .replace("ReadonlyArray<JsonValue> | Array<JsonValue>", "JsonArray");
const inlineInvalidGenericUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type GenericPair = Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineInvalidGenericUnionOutputCode = inlineInvalidGenericUnionCode
    .replace(
        'import type { JsonValue } from "type-fest";',
        'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";'
    )
    .replace("Array<JsonValue> | ReadonlyArray<JsonValue>", "JsonArray");
const inlineValidMismatchedNativeAndGenericCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidNonJsonElementCode = [
    "type NotJsonArray = Array<string> | ReadonlyArray<string>;",
].join("\n");
const inlineValidThreeMemberUnionCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | readonly JsonValue[] | null;",
].join("\n");
const inlineValidReadonlyArrayTypeMismatchCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | readonly string[];",
].join("\n");
const inlineValidMissingGenericArgumentsCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = Array | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidMissingReadonlyGenericArgumentsCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = Array<JsonValue> | ReadonlyArray;",
].join("\n");
const inlineValidQualifiedArrayTypeCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = globalThis.Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineValidReadonlyOperatorNonArrayTypeCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = readonly ReadonlyArray<JsonValue> | JsonValue[];",
].join("\n");
const inlineValidNonReadonlyTypeOperatorArrayCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type NotJsonArray = JsonValue[] | keyof JsonValue[];",
].join("\n");
const inlineInvalidWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type Payload = JsonValue[] | readonly JsonValue[];",
].join("\n");
const inlineInvalidWithoutFixOutputCode = inlineInvalidWithoutFixCode
    .replace(
        'import type { JsonValue } from "type-fest";',
        'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";'
    )
    .replace("JsonValue[] | readonly JsonValue[]", "JsonArray");
const inlineInvalidGenericWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type Payload = Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineInvalidGenericWithoutFixOutputCode =
    inlineInvalidGenericWithoutFixCode
        .replace(
            'import type { JsonValue } from "type-fest";',
            'import type { JsonValue } from "type-fest";\nimport type { JsonArray } from "type-fest";'
        )
        .replace("Array<JsonValue> | ReadonlyArray<JsonValue>", "JsonArray");
const inlineFixableReversedNativeCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = readonly JsonValue[] | JsonValue[];",
].join("\n");
const inlineFixableReversedNativeOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineFixableCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonValue[] | readonly JsonValue[];",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineGenericFixableCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = Array<JsonValue> | ReadonlyArray<JsonValue>;",
].join("\n");
const inlineFixableReversedGenericCode = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = ReadonlyArray<JsonValue> | Array<JsonValue>;",
].join("\n");

const inlineGenericFixableOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineFixableReversedGenericOutput = [
    'import type { JsonArray, JsonValue } from "type-fest";',
    "",
    "type Payload = JsonArray;",
].join("\n");
const inlineValidNativeNonJsonElementCode = [
    "type NotJsonArray = string[] | readonly string[];",
].join("\n");
const inlineValidQualifiedJsonValueTypeReferenceCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "type NotJsonArray = Array<TypeFest.JsonValue> | ReadonlyArray<TypeFest.JsonValue>;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferJsonArray: preferJsonArrayMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-json-array internal JsonValue[] guard", () => {
    it("reports only native/generic JsonValue array union pairs", async () => {
        const replacementFixCalls: Array<readonly unknown[]> = [];
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];

        const createIdentifierNode = (name: string) => ({
            name,
            type: "Identifier",
        });
        const createTypeReferenceNode = (
            referenceName: string,
            genericArguments: Readonly<unknown[]> = []
        ) => ({
            type: "TSTypeReference",
            ...(genericArguments.length === 0
                ? {}
                : {
                    typeArguments: {
                        params: genericArguments,
                    },
                }),
            typeName: createIdentifierNode(referenceName),
        });
        const jsonValueTypeReferenceNode = createTypeReferenceNode("JsonValue");
        const createNativeArrayNode = (elementType: unknown) => ({
            elementType,
            type: "TSArrayType",
        });
        const createReadonlyNativeArrayNode = (elementType: unknown) => ({
            operator: "readonly",
            type: "TSTypeOperator",
            typeAnnotation: createNativeArrayNode(elementType),
        });
        const createUnionNode = (...types: Readonly<unknown[]>) => ({
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
                createSafeTypeNodeReplacementFix: (...parameters: Readonly<unknown[]>) => {
                    replacementFixCalls.push(parameters);

                    return null;
                },
            }));

            const authoredRuleModule = (await import(
                "../src/rules/prefer-type-fest-json-array"
            )) as {
                default: {
                    create: (context: unknown) => {
                        TSUnionType?: (node: unknown) => void;
                    };
                };
            };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report (descriptor: Readonly<{ messageId?: string; node?: unknown; }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const unionTypeListener = listeners.TSUnionType;

            expect(unionTypeListener).toBeTypeOf("function");

            const validNativePairNode = createUnionNode(
                createNativeArrayNode(jsonValueTypeReferenceNode),
                createReadonlyNativeArrayNode(jsonValueTypeReferenceNode)
            );
            const validGenericPairNode = createUnionNode(
                createTypeReferenceNode("Array", [jsonValueTypeReferenceNode]),
                createTypeReferenceNode("ReadonlyArray", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidNonTargetIdentifiersNode = createUnionNode(
                createTypeReferenceNode("ArrayLike", [jsonValueTypeReferenceNode]),
                createTypeReferenceNode("ReadonlyArrayLike", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidMissingArrayTypeArgumentNode = createUnionNode(
                createTypeReferenceNode("Array"),
                createTypeReferenceNode("ReadonlyArray", [
                    jsonValueTypeReferenceNode,
                ])
            );
            const invalidMissingReadonlyTypeArgumentNode = createUnionNode(
                createTypeReferenceNode("Array", [jsonValueTypeReferenceNode]),
                createTypeReferenceNode("ReadonlyArray")
            );
            const invalidOneSidedGenericMatchNode = createUnionNode(
                createTypeReferenceNode("ReadonlyArray", [
                    jsonValueTypeReferenceNode,
                ]),
                createTypeReferenceNode("Array", [
                    createTypeReferenceNode("UnknownValue"),
                ])
            );
            const invalidNonArrayLeftNativeNode = createUnionNode(
                {
                    operator: "keyof",
                    type: "TSTypeOperator",
                    typeAnnotation: createNativeArrayNode(
                        jsonValueTypeReferenceNode
                    ),
                },
                createReadonlyNativeArrayNode(jsonValueTypeReferenceNode)
            );
            const invalidThreeMemberUnionNode = createUnionNode(
                createNativeArrayNode(jsonValueTypeReferenceNode),
                createReadonlyNativeArrayNode(jsonValueTypeReferenceNode),
                {
                    type: "TSNullKeyword",
                }
            );

            unionTypeListener?.(validNativePairNode);
            unionTypeListener?.(validGenericPairNode);
            unionTypeListener?.(invalidNonTargetIdentifiersNode);
            unionTypeListener?.(invalidMissingArrayTypeArgumentNode);
            unionTypeListener?.(invalidMissingReadonlyTypeArgumentNode);
            unionTypeListener?.(invalidOneSidedGenericMatchNode);
            unionTypeListener?.(invalidNonArrayLeftNativeNode);
            unionTypeListener?.(invalidThreeMemberUnionNode);

            expect(reportCalls).toHaveLength(2);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferJsonArray",
                node: validNativePairNode,
            });
            expect(reportCalls[1]).toMatchObject({
                messageId: "preferJsonArray",
                node: validGenericPairNode,
            });
            expect(replacementFixCalls).toHaveLength(2);
            expect(replacementFixCalls[0]?.[1]).toBe("JsonArray");
            expect(replacementFixCalls[1]?.[1]).toBe("JsonArray");
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
                    messageId: "preferJsonArray",
                },
                {
                    messageId: "preferJsonArray",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonArray-like unions",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidReversedNativeUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed native array union",
            output: inlineInvalidReversedNativeUnionOutputCode,
        },
        {
            code: inlineInvalidReversedGenericUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports reversed generic array union",
            output: inlineInvalidReversedGenericUnionOutputCode,
        },
        {
            code: inlineInvalidGenericUnionCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic array union",
            output: inlineInvalidGenericUnionOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports JsonValue array union without fix when JsonArray import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineInvalidGenericWithoutFixCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports generic JsonValue array union without fix when JsonArray import is missing",
            output: inlineInvalidGenericWithoutFixOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes JsonValue array union when JsonArray import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineFixableReversedNativeCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed JsonValue array union when JsonArray import is in scope",
            output: inlineFixableReversedNativeOutput,
        },
        {
            code: inlineGenericFixableCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes generic JsonValue array union when JsonArray import is in scope",
            output: inlineGenericFixableOutput,
        },
        {
            code: inlineFixableReversedGenericCode,
            errors: [{ messageId: "preferJsonArray" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes reversed generic JsonValue array union when JsonArray import is in scope",
            output: inlineFixableReversedGenericOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidMismatchedNativeAndGenericCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores mixed native and generic array forms",
        },
        {
            code: inlineValidNonJsonElementCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-JsonValue element array union",
        },
        {
            code: inlineValidNativeNonJsonElementCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores native arrays with non-JsonValue element type",
        },
        {
            code: inlineValidThreeMemberUnionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores unions with more than two members",
        },
        {
            code: inlineValidReadonlyArrayTypeMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly array element type mismatch",
        },
        {
            code: inlineValidMissingGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Array without generic arguments",
        },
        {
            code: inlineValidMissingReadonlyGenericArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores ReadonlyArray without generic arguments",
        },
        {
            code: inlineValidQualifiedArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Array qualified union",
        },
        {
            code: inlineValidQualifiedJsonValueTypeReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores arrays using namespace-qualified JsonValue type references",
        },
        {
            code: inlineValidReadonlyOperatorNonArrayTypeCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores readonly operator applied to non-array reference",
        },
        {
            code: inlineValidNonReadonlyTypeOperatorArrayCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-readonly type-operator array member",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
