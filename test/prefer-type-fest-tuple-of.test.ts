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
const inlineFixableReadonlyTupleInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineFixableReadonlyTupleOutputCode =
    inlineFixableReadonlyTupleInvalidCode.replace(
        "type Values = ReadonlyTuple<string, 3>;",
        "type Values = Readonly<TupleOf<3, string>>;"
    );

const inlineFixableTupleInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = Tuple<string, 3>;",
].join("\n");

const inlineFixableTupleOutputCode = inlineFixableTupleInvalidCode.replace(
    "type Values = Tuple<string, 3>;",
    "type Values = TupleOf<3, string>;"
);

const inlineNoFixShadowedTupleOfInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<TupleOf> = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineNoFixShadowedReadonlyInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = ReadonlyTuple<string, 3>;",
].join("\n");

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
                code: inlineFixableReadonlyTupleInvalidCode,
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
                output: inlineFixableReadonlyTupleOutputCode,
            },
            {
                code: inlineFixableTupleInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Tuple",
                            replacement: "TupleOf<Length, Element>",
                        },
                        messageId: "preferTupleOf",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                output: inlineFixableTupleOutputCode,
            },
            {
                code: inlineNoFixShadowedTupleOfInvalidCode,
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
                output: null,
            },
            {
                code: inlineNoFixShadowedReadonlyInvalidCode,
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
                output: null,
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
