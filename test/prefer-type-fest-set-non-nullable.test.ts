/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-non-nullable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-non-nullable.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-non-nullable.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-set-non-nullable.skip.ts";
const invalidFixtureName = "prefer-type-fest-set-non-nullable.invalid.ts";

ruleTester.run(
    "prefer-type-fest-set-non-nullable",
    getPluginRule("prefer-type-fest-set-non-nullable"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "NonNullableBy",
                            replacement: "SetNonNullable",
                        },
                        messageId: "preferSetNonNullable",
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
    }
);
