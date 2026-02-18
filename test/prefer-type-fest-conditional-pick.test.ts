/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-conditional-pick.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-conditional-pick.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-conditional-pick.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-conditional-pick.skip.ts";
const invalidFixtureName = "prefer-type-fest-conditional-pick.invalid.ts";

ruleTester.run(
    "prefer-type-fest-conditional-pick",
    getPluginRule("prefer-type-fest-conditional-pick"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
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
