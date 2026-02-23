import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-json-value.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule("prefer-type-fest-json-value");

const invalidFixtureName = "prefer-type-fest-json-value.invalid.ts";
const validFixtureName = "prefer-type-fest-json-value.valid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const invalidFixtureSuggestionOutput = `import type { JsonObject } from "type-fest";\n${invalidFixtureCode.replace(
    "Record<string, unknown>",
    "JsonObject"
)}`;
const inlineInvalidAnyPayloadCode = "type IpcPayload = Record<string, any>;";
const inlineInvalidAnyPayloadSuggestionOutput = [
    'import type { JsonObject } from "type-fest";',
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineSuggestableCode = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = Record<string, unknown>;",
].join("\n");
const inlineSuggestableOutput = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineSuggestableLiteralStringKeyCode = [
    'import type { JsonObject } from "type-fest";',
    "",
    'type IpcPayload = Record<"string", unknown>;',
].join("\n");
const inlineSuggestableLiteralStringKeyOutput = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineSuggestableAnyPayloadCode = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = Record<string, any>;",
].join("\n");
const inlineSuggestableAnyPayloadOutput = [
    'import type { JsonObject } from "type-fest";',
    "",
    "type IpcPayload = JsonObject;",
].join("\n");
const inlineValidGlobalRecordCode =
    "type IpcPayload = globalThis.Record<string, unknown>;";
const inlineValidNonStringKeyCode =
    "type IpcPayload = Record<number, unknown>;";
const inlineValidLiteralNonStringKeyCode =
    'type IpcPayload = Record<"payload", unknown>;';
const inlineValidNonUnknownValueCode =
    "type IpcPayload = Record<string, string>;";
const inlineValidMapCode = "type IpcPayload = Map<string, unknown>;";

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-json-value", {
    docsDescription:
        "require TypeFest JsonValue/JsonObject for payload and context-like contract types in serialization boundaries.",
    messages: {
        preferJsonValue:
            "Use `JsonValue`/`JsonObject` from type-fest for payload/context contracts in serialization boundaries instead of Record<string, unknown>.",
        suggestJsonObject:
            "Replace with `JsonObject` from type-fest (review value constraints, this may narrow accepted shapes).",
    },
});

describe("prefer-type-fest-json-value metadata", () => {
    it("declares suggestion metadata", () => {
        expect(
            (
                rule as unknown as {
                    readonly meta?: { readonly hasSuggestions?: boolean };
                }
            ).meta?.hasSuggestions
        ).toBeTruthy();
    });
});

ruleTester.run("prefer-type-fest-json-value", rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: invalidFixtureSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Record<string, any> aliases",
        },
        {
            code: inlineInvalidAnyPayloadCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineInvalidAnyPayloadSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline Record<string, any> alias",
        },
        {
            code: inlineSuggestableCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineSuggestableOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests JsonObject when import is in scope",
        },
        {
            code: inlineSuggestableLiteralStringKeyCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineSuggestableLiteralStringKeyOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: 'suggests JsonObject for Record<"string", unknown> when import is in scope',
        },
        {
            code: inlineSuggestableAnyPayloadCode,
            errors: [
                {
                    messageId: "preferJsonValue",
                    suggestions: [
                        {
                            messageId: "suggestJsonObject",
                            output: inlineSuggestableAnyPayloadOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "suggests JsonObject for Record<string, any> when import is in scope",
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
            name: "ignores globalThis.Record<string, unknown>",
        },
        {
            code: inlineValidNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-string key type",
        },
        {
            code: inlineValidLiteralNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: 'ignores Record with literal key that is not "string"',
        },
        {
            code: inlineValidNonUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with concrete value type",
        },
        {
            code: inlineValidMapCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Record map type alias",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
