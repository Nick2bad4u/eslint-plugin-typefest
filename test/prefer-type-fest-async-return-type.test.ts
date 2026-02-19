/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-async-return-type.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-async-return-type");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-async-return-type.valid.ts";
const invalidFixtureName = "prefer-type-fest-async-return-type.invalid.ts";
const inlineInvalidCode =
    "type Result = Awaited<ReturnType<() => Promise<string>>>;";
const awaitedWithoutTypeArgumentValidCode = "type Result = Awaited;";
const awaitedNonReturnTypeValidCode = "type Result = Awaited<string>;";
const awaitedReturnTypeWithoutArgValidCode =
    "type Result = Awaited<ReturnType>;";
const skipPathInvalidCode = inlineInvalidCode;

ruleTester.run("prefer-type-fest-async-return-type", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferAsyncReturnType",
                },
                {
                    messageId: "preferAsyncReturnType",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferAsyncReturnType" }],
            filename: typedFixturePath(invalidFixtureName),
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: awaitedWithoutTypeArgumentValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: awaitedNonReturnTypeValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: awaitedReturnTypeWithoutArgValidCode,
            filename: typedFixturePath(validFixtureName),
        },
        {
            code: skipPathInvalidCode,
            filename: typedFixturePath(
                "tests",
                "prefer-type-fest-async-return-type.skip.ts"
            ),
        },
    ],
});
