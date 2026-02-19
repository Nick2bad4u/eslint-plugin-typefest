/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-required-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-required-deep.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-required-deep.skip.ts";
const invalidFixtureName = "prefer-type-fest-required-deep.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { DeepRequired } from "type-aliases";',
    'import type { RequiredDeep } from "type-fest";',
    "",
    "type User = {",
    "    id?: string;",
    "};",
    "",
    "type StrictUser = DeepRequired<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type StrictUser = DeepRequired<User>;",
    "type StrictUser = RequiredDeep<User>;"
);

ruleTester.run(
    "prefer-type-fest-required-deep",
    getPluginRule("prefer-type-fest-required-deep"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferRequiredDeep" }],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferRequiredDeep" }],
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
