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
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: readTypedFixture(namespaceValidFixtureName),
            filename: typedFixturePath(namespaceValidFixtureName),
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
        },
    ],
});
