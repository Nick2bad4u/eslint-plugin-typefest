/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-if.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-if.valid.ts";
const namespaceValidFixtureName = "prefer-type-fest-if.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-if.skip.ts";
const invalidFixtureName = "prefer-type-fest-if.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { IfAny } from "type-aliases";',
    'import type { IsAny } from "type-fest";',
    "",
    "type Input = IfAny<string, true, false>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = IfAny<string, true, false>;",
    "type Input = IsAny<string, true, false>;"
);

ruleTester.run("prefer-type-fest-if", getPluginRule("prefer-type-fest-if"), {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfEmptyObject",
                        replacement: "IsEmptyObject",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfNever",
                        replacement: "IsNever",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfNull",
                        replacement: "IsNull",
                    },
                    messageId: "preferTypeFestIf",
                },
                {
                    data: {
                        alias: "IfUnknown",
                        replacement: "IsUnknown",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture If* alias usage",
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "IfAny",
                        replacement: "IsAny",
                    },
                    messageId: "preferTypeFestIf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline IfAny alias import",
            output: inlineFixableOutputCode,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(namespaceValidFixtureName),
            filename: typedFixturePath(namespaceValidFixtureName),
            name: "accepts namespace-qualified Is* references",
        },
        {
            code: readTypedFixture(
                skipTestPathFixtureDirectory,
                skipTestPathFixtureName
            ),
            filename: typedFixturePath(
                skipTestPathFixtureDirectory,
                skipTestPathFixtureName
            ),
            name: "skips file under tests fixture path",
        },
    ],
});
