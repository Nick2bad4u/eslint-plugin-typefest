/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-abstract-constructor.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-abstract-constructor.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-abstract-constructor.skip.ts";
const invalidFixtureName = "prefer-type-fest-abstract-constructor.invalid.ts";
const inlineInvalidNoFilenameCode =
    "type AbstractCtor = abstract new (...args: readonly unknown[]) => object;";

ruleTester.run(
    "prefer-type-fest-abstract-constructor",
    getPluginRule("prefer-type-fest-abstract-constructor"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture abstract constructor signatures",
            },
            {
                code: inlineInvalidNoFilenameCode,
                errors: [
                    {
                        messageId: "preferAbstractConstructorSignature",
                    },
                ],
                name: "reports inline abstract constructor signature without filename",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
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
                name: "skips file under tests fixture path",
            },
        ],
    }
);
