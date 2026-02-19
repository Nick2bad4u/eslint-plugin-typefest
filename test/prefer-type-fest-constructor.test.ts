/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-constructor.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-constructor.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-constructor.skip.ts";
const invalidFixtureName = "prefer-type-fest-constructor.invalid.ts";
const inlineInvalidNoFilenameCode =
    "type Ctor = new (...args: readonly unknown[]) => object;";

ruleTester.run(
    "prefer-type-fest-constructor",
    getPluginRule("prefer-type-fest-constructor"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferConstructorSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidNoFilenameCode,
                errors: [
                    {
                        messageId: "preferConstructorSignature",
                    },
                ],
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
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
