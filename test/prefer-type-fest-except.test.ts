/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-except.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-except");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-except.valid.ts";
const invalidFixtureName = "prefer-type-fest-except.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    'import type { Except } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
    'type UserWithoutId = Except<User, "id">;'
);

ruleTester.run("prefer-type-fest-except", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferExcept",
                },
                {
                    messageId: "preferExcept",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            output: inlineFixableOutputCode,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
    ],
});
