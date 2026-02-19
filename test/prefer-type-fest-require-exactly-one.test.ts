/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-exactly-one.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-exactly-one.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-exactly-one.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-require-exactly-one.skip.ts";
const invalidFixtureName = "prefer-type-fest-require-exactly-one.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { OneOf } from "type-aliases";',
    'import type { RequireExactlyOne } from "type-fest";',
    "",
    "type Input = OneOf<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = OneOf<{ a?: string; b?: number }>;",
    "type Input = RequireExactlyOne<{ a?: string; b?: number }>;"
);

ruleTester.run(
    "prefer-type-fest-require-exactly-one",
    getPluginRule("prefer-type-fest-require-exactly-one"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                    {
                        data: {
                            alias: "RequireOnlyOne",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                output: inlineFixableOutputCode,
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
    }
);
