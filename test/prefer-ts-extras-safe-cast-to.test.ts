/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-safe-cast-to.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-safe-cast-to.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-safe-cast-to.skip.ts";
const invalidFixtureName = "prefer-ts-extras-safe-cast-to.invalid.ts";
const nonAssignableAsExpressionValidCode = [
    "declare const rawValue: unknown;",
    "const parsed = rawValue as string;",
    "String(parsed);",
].join("\n");
const nonAssignableTypeAssertionValidCode = [
    "declare const rawValue: unknown;",
    "const parsed = <string>rawValue;",
    "String(parsed);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-safe-cast-to",
    getPluginRule("prefer-ts-extras-safe-cast-to"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasSafeCastTo" },
                    { messageId: "preferTsExtrasSafeCastTo" },
                    { messageId: "preferTsExtrasSafeCastTo" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture unsafe cast assertions",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: nonAssignableAsExpressionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-assignable as-expression assertion",
            },
            {
                code: nonAssignableTypeAssertionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-assignable angle-bracket assertion",
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
