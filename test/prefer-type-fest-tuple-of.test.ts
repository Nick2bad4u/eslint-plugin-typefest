/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-tuple-of.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-tuple-of.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-tuple-of.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-tuple-of.skip.ts";
const invalidFixtureName = "prefer-type-fest-tuple-of.invalid.ts";
const inlineSuggestableInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineSuggestableOutputCode = inlineSuggestableInvalidCode.replace(
    "type Values = ReadonlyTuple<string, 3>;",
    "type Values = Readonly<TupleOf<3, string>>;"
);

ruleTester.run(
    "prefer-type-fest-tuple-of",
    getPluginRule("prefer-type-fest-tuple-of"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "ReadonlyTuple",
                            replacement: "Readonly<TupleOf<Length, Element>>",
                        },
                        messageId: "preferTupleOf",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineSuggestableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "ReadonlyTuple",
                            replacement: "Readonly<TupleOf<Length, Element>>",
                        },
                        messageId: "preferTupleOf",
                        suggestions: [
                            {
                                messageId: "suggestTupleOfReplacement",
                                output: inlineSuggestableOutputCode,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
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
