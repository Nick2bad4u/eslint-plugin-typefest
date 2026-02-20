/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-partial-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-partial-deep.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-partial-deep.skip.ts";
const invalidFixtureName = "prefer-type-fest-partial-deep.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { DeepPartial } from "type-aliases";',
    'import type { PartialDeep } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type PartialUser = DeepPartial<User>;",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type PartialUser = DeepPartial<User>;",
    "type PartialUser = PartialDeep<User>;"
);

ruleTester.run(
    "prefer-type-fest-partial-deep",
    getPluginRule("prefer-type-fest-partial-deep"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture DeepPartial alias usage",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline DeepPartial alias import",
                output: inlineFixableOutputCode,
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
