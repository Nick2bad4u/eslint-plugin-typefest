/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-conditional-pick.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-conditional-pick.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-conditional-pick.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-conditional-pick.skip.ts";
const invalidFixtureName = "prefer-type-fest-conditional-pick.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { PickByTypes } from "type-aliases";',
    'import type { ConditionalPick } from "type-fest";',
    "",
    "type Input = PickByTypes<{ a: string; b: number }, string>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = PickByTypes<{ a: string; b: number }, string>;",
    "type Input = ConditionalPick<{ a: string; b: number }, string>;"
);

ruleTester.run(
    "prefer-type-fest-conditional-pick",
    getPluginRule("prefer-type-fest-conditional-pick"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture PickByTypes alias usage",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PickByTypes",
                            replacement: "ConditionalPick",
                        },
                        messageId: "preferConditionalPick",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline PickByTypes alias import",
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
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-qualified type-fest references",
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
