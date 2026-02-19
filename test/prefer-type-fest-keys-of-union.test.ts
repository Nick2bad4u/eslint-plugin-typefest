/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-keys-of-union.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-keys-of-union.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-keys-of-union.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-keys-of-union.skip.ts";
const invalidFixtureName = "prefer-type-fest-keys-of-union.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { AllKeys } from "type-aliases";',
    'import type { KeysOfUnion } from "type-fest";',
    "",
    "type Input = AllKeys<{ a: string } | { b: number }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = AllKeys<{ a: string } | { b: number }>;",
    "type Input = KeysOfUnion<{ a: string } | { b: number }>;"
);

ruleTester.run(
    "prefer-type-fest-keys-of-union",
    getPluginRule("prefer-type-fest-keys-of-union"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "AllKeys",
                            replacement: "KeysOfUnion",
                        },
                        messageId: "preferKeysOfUnion",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "AllKeys",
                            replacement: "KeysOfUnion",
                        },
                        messageId: "preferKeysOfUnion",
                    },
                ],
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
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
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
