/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-as-writable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-as-writable.valid.ts";
const namespaceValidFixtureName =
    "prefer-ts-extras-as-writable.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-as-writable.skip.ts";
const invalidFixtureName = "prefer-ts-extras-as-writable.invalid.ts";

ruleTester.run(
    "prefer-ts-extras-as-writable",
    getPluginRule("prefer-ts-extras-as-writable"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
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
