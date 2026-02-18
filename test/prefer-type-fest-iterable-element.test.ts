/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-iterable-element.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-iterable-element.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-iterable-element.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-iterable-element.skip.ts";
const invalidFixtureName = "prefer-type-fest-iterable-element.invalid.ts";

ruleTester.run(
    "prefer-type-fest-iterable-element",
    getPluginRule("prefer-type-fest-iterable-element"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "SetElement",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
                    },
                    {
                        data: {
                            alias: "SetEntry",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
                    },
                    {
                        data: {
                            alias: "SetValues",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
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
