/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-defined.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-defined.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-is-defined.skip.ts";
const invalidFixtureName = "prefer-ts-extras-is-defined.invalid.ts";
const inlineFixableDefinedCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = maybeValue !== undefined;",
].join("\n");
const inlineFixableDefinedOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const hasValue = isDefined(maybeValue);",
].join("\n");
const inlineFixableNegatedCode = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = maybeValue === undefined;",
].join("\n");
const inlineFixableNegatedOutput = [
    'import { isDefined } from "ts-extras";',
    "",
    "declare const maybeValue: string | undefined;",
    "const isMissing = !isDefined(maybeValue);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-is-defined",
    getPluginRule("prefer-ts-extras-is-defined"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasIsDefined" },
                    { messageId: "preferTsExtrasIsDefined" },
                    { messageId: "preferTsExtrasIsDefined" },
                    { messageId: "preferTsExtrasIsDefinedNegated" },
                    { messageId: "preferTsExtrasIsDefinedNegated" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture strict defined and undefined comparisons",
            },
            {
                code: inlineFixableDefinedCode,
                errors: [{ messageId: "preferTsExtrasIsDefined" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes undefined inequality when isDefined import is in scope",
                output: inlineFixableDefinedOutput,
            },
            {
                code: inlineFixableNegatedCode,
                errors: [{ messageId: "preferTsExtrasIsDefinedNegated" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes undefined equality when isDefined import is in scope",
                output: inlineFixableNegatedOutput,
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
