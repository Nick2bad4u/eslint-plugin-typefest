/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unwrap-tagged.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unwrap-tagged.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-unwrap-tagged.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-unwrap-tagged.skip.ts";
const invalidFixtureName = "prefer-type-fest-unwrap-tagged.invalid.ts";

ruleTester.run(
    "prefer-type-fest-unwrap-tagged",
    getPluginRule("prefer-type-fest-unwrap-tagged"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
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
