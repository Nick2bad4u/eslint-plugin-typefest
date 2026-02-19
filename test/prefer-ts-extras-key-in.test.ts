/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-key-in.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-key-in");
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

ruleTester.run("prefer-ts-extras-key-in", rule, {
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
        },
        {
            code: inlineInvalidInOperatorCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidNoFilenameCode,
            errors: [
                {
                    messageId: "preferTsExtrasKeyIn",
                },
            ],
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidNonInOperatorCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: inlineValidForInLoopCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
        },
    ],
});
