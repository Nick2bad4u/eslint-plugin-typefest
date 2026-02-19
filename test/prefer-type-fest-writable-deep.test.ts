/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-writable-deep.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-writable-deep.skip.ts";
const invalidFixtureName = "prefer-type-fest-writable-deep.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { DeepMutable } from "type-aliases";',
    'import type { WritableDeep } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = DeepMutable<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type MutableUser = DeepMutable<User>;",
    "type MutableUser = WritableDeep<User>;"
);

ruleTester.run(
    "prefer-type-fest-writable-deep",
    getPluginRule("prefer-type-fest-writable-deep"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferWritableDeep" },
                    { messageId: "preferWritableDeep" },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferWritableDeep" }],
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
