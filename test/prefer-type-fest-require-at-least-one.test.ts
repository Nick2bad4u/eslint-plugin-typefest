/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-at-least-one.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-at-least-one.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-at-least-one.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-require-at-least-one.skip.ts";
const invalidFixtureName = "prefer-type-fest-require-at-least-one.invalid.ts";

ruleTester.run(
    "prefer-type-fest-require-at-least-one",
    getPluginRule("prefer-type-fest-require-at-least-one"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "AtLeastOne",
                            replacement: "RequireAtLeastOne",
                        },
                        messageId: "preferRequireAtLeastOne",
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
