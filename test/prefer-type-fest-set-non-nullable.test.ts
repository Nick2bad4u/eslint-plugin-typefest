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
const inlineFixableInvalidCode = [
    'import type { NonNullableBy } from "type-aliases";',
    'import type { SetNonNullable } from "type-fest";',
    "",
    "type User = {",
    "    id: string | null;",
    "};",
    "",
    'type Normalized = NonNullableBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type Normalized = NonNullableBy<User, "id">;',
    'type Normalized = SetNonNullable<User, "id">;'
);

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
            {
                code: inlineFixableInvalidCode,
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
