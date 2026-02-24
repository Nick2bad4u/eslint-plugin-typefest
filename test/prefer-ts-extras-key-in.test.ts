import { describe, expect, it } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-key-in.test` behavior.
 */
import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-key-in";
const docsDescription =
    "require ts-extras keyIn over `in` key checks for stronger narrowing.";
const docsUrl =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-key-in.md";
const preferTsExtrasKeyInMessage =
    "Prefer `keyIn` from `ts-extras` over `key in object` checks for stronger narrowing.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-key-in.valid.ts";
const invalidFixtureName = "prefer-ts-extras-key-in.invalid.ts";
const inlineInvalidInOperatorCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidInOperatorOutput = [
    'import { keyIn } from "ts-extras";',
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = keyIn(payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidNoFilenameCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidNoFilenameOutput = [
    'import { keyIn } from "ts-extras";',
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = keyIn(payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineValidNonInOperatorCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const payload: MonitorPayload;",
    "",
    'const hasId = payload.id === "id";',
    "",
    "String(hasId);",
].join("\n");
const inlineValidForInLoopCode = [
    "type MonitorPayload = Record<string, string>;",
    "",
    "declare const payload: MonitorPayload;",
    "",
    "for (const key in payload) {",
    "    String(key);",
    "}",
].join("\n");
const inlineFixableCode = [
    'import { keyIn } from "ts-extras";',
    "",
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = dynamicKey in payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineFixableOutput = [
    'import { keyIn } from "ts-extras";',
    "",
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const payload: MonitorPayload;",
    "",
    "const hasDynamicKey = keyIn(payload, dynamicKey);",
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidLiteralLeftOperandCode = [
    "type MonitorPayload = {",
    "    readonly id: string;",
    "};",
    "",
    "declare const payload: MonitorPayload;",
    "",
    'const hasDynamicKey = "id" in payload;',
    "",
    "String(hasDynamicKey);",
].join("\n");
const inlineInvalidMemberRightOperandCode = [
    "type MonitorState = {",
    "    readonly payload: { id: string };",
    "};",
    "",
    "declare const dynamicKey: string;",
    "declare const state: MonitorState;",
    "",
    "const hasDynamicKey = dynamicKey in state.payload;",
    "",
    "String(hasDynamicKey);",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasKeyIn: preferTsExtrasKeyInMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-key-in metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture in-operator checks",
        },
        {
            code: inlineInvalidInOperatorCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct in-operator membership check",
            output: inlineInvalidInOperatorOutput,
        },
        {
            code: inlineInvalidNoFilenameCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            name: "reports in-operator check without explicit filename",
            output: inlineInvalidNoFilenameOutput,
        },
        {
            code: inlineFixableCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes identifier in-operator check when keyIn import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineInvalidLiteralLeftOperandCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports literal-left in-operator check without autofix",
            output: null,
        },
        {
            code: inlineInvalidMemberRightOperandCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports member-right in-operator check without autofix",
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
            code: inlineValidNonInOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-in-operator object property checks",
        },
        {
            code: inlineValidForInLoopCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores for-in loop iteration",
        },
    ],
});
