/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-object.test` behavior.
 */
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-json-object";
const docsDescription =
    "require TypeFest JsonObject over equivalent Record<string, JsonValue> object aliases.";
const preferJsonObjectMessage =
    "Prefer `JsonObject` from type-fest over equivalent explicit JSON-object type shapes.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-json-object.valid.ts";
const invalidFixtureName = "prefer-type-fest-json-object.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { JsonValue } from "type-fest";\r\n',
        'import type { JsonValue } from "type-fest";\nimport type { JsonObject } from "type-fest";\r\n'
    )
    .replace("Record<string, JsonValue>", "JsonObject");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "Record<string, JsonValue>",
    "JsonObject"
);
const inlineInvalidLiteralStringKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    'type MonitorJsonShape = Record<"string", JsonValue>;',
].join("\n");
const inlineInvalidLiteralStringKeyOutputCode =
    inlineInvalidLiteralStringKeyCode
        .replace(
            'import type { JsonValue } from "type-fest";',
            'import type { JsonValue } from "type-fest";\nimport type { JsonObject } from "type-fest";'
        )
        .replace('Record<"string", JsonValue>', "JsonObject");
const inlineValidGlobalRecordCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = globalThis.Record<string, JsonValue>;",
].join("\n");
const inlineValidLiteralNonStringKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    'type MonitorJsonShape = Record<"number", JsonValue>;',
].join("\n");
const inlineValidNonJsonValueCode = [
    "type MonitorJsonShape = Record<string, number>;",
].join("\n");
const inlineValidNumberKeyCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<number, JsonValue>;",
].join("\n");
const inlineValidMissingRecordTypeArgumentsCode =
    "type MonitorJsonShape = Record;";
const inlineValidRecordSingleTypeArgumentCode =
    "type MonitorJsonShape = Record<string>;";
const inlineValidRecordUnknownValueCode =
    "type MonitorJsonShape = Record<string, unknown>;";
const inlineInvalidWithoutFixCode = [
    'import type { JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<string, JsonValue>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = inlineInvalidWithoutFixCode
    .replace(
        'import type { JsonValue } from "type-fest";',
        'import type { JsonValue } from "type-fest";\nimport type { JsonObject } from "type-fest";'
    )
    .replace("Record<string, JsonValue>", "JsonObject");
const inlineFixableCode = [
    'import type { JsonObject, JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = Record<string, JsonValue>;",
].join("\n");
const inlineFixableOutput = [
    'import type { JsonObject, JsonValue } from "type-fest";',
    "",
    "type MonitorJsonShape = JsonObject;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    ruleId,
    {
        defaultOptions: [],
        docsDescription,
        enforceRuleShape: true,
        messages: {
            preferJsonObject: preferJsonObjectMessage,
        },
        name: ruleId,
    }
);

describe("prefer-type-fest-json-object internal Record<JsonValue> guard", () => {
    it("reports only Record<string, JsonValue> references with exactly two type arguments", async () => {
        const replacementFixCalls: Array<readonly unknown[]> = [];
        const reportCalls: {
            messageId?: string;
            node?: unknown;
        }[] = [];

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
                "../src/rules/prefer-type-fest-json-object"
            )) as {
                default: {
                    create: (context: unknown) => {
                        TSTypeReference?: (node: unknown) => void;
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

            const referenceListener = listeners.TSTypeReference;

            expect(referenceListener).toBeTypeOf("function");

            const matchingRecordNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                        {
                            type: "TSTypeReference",
                            typeName: {
                                name: "JsonValue",
                                type: "Identifier",
                            },
                        },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            };
            const nonRecordIdentifierNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                        {
                            type: "TSTypeReference",
                            typeName: {
                                name: "JsonValue",
                                type: "Identifier",
                            },
                        },
                    ],
                },
                typeName: {
                    name: "Box",
                    type: "Identifier",
                },
            };
            const singleTypeArgumentNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            };
            const nonJsonValueRecordNode = {
                type: "TSTypeReference",
                typeArguments: {
                    params: [
                        {
                            type: "TSStringKeyword",
                        },
                        {
                            type: "TSUnknownKeyword",
                        },
                    ],
                },
                typeName: {
                    name: "Record",
                    type: "Identifier",
                },
            };

            referenceListener?.(matchingRecordNode);
            referenceListener?.(nonRecordIdentifierNode);
            referenceListener?.(singleTypeArgumentNode);
            referenceListener?.(nonJsonValueRecordNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferJsonObject",
                node: matchingRecordNode,
            });
            expect(replacementFixCalls).toHaveLength(1);
            expect(replacementFixCalls[0]?.[1]).toBe("JsonObject");
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
                    messageId: "preferJsonObject",
                },
                {
                    messageId: "preferJsonObject",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture JsonObject-like Record aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineInvalidLiteralStringKeyCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record with literal string key and JsonValue value",
            output: inlineInvalidLiteralStringKeyOutputCode,
        },
        {
            code: inlineInvalidWithoutFixCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record<string, JsonValue> without fix when JsonObject import is missing",
            output: inlineInvalidWithoutFixOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferJsonObject" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Record<string, JsonValue> when JsonObject import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidGlobalRecordCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Record usage",
        },
        {
            code: inlineValidLiteralNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: 'ignores Record with literal key other than "string"',
        },
        {
            code: inlineValidNonJsonValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-JsonValue values",
        },
        {
            code: inlineValidNumberKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-string key type",
        },
        {
            code: inlineValidMissingRecordTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Record reference",
        },
        {
            code: inlineValidRecordSingleTypeArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with a single type argument",
        },
        {
            code: inlineValidRecordUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record<string, unknown>",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
