/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-all-or-none.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-all-or-none.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-all-or-none.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-require-all-or-none.skip.ts";
const invalidFixtureName = "prefer-type-fest-require-all-or-none.invalid.ts";

ruleTester.run(
    "prefer-type-fest-require-all-or-none",
    getPluginRule("prefer-type-fest-require-all-or-none"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "AllOrNone",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                    {
                        data: {
                            alias: "AllOrNothing",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
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
