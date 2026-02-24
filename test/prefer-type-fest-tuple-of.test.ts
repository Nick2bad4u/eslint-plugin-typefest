import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const ruleId = "prefer-type-fest-tuple-of";
const docsDescription =
    "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.";
const preferTupleOfMessage =
    "Prefer `{{replacement}}` from type-fest to model fixed-length homogeneous tuples instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-tuple-of.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-tuple-of.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-tuple-of.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { ReadonlyTuple } from "type-aliases";\r\n',
        'import type { ReadonlyTuple } from "type-aliases";\nimport type { TupleOf } from "type-fest";\r\n'
    )
    .replace(
        "type MonitorTuple = ReadonlyTuple<string, 3>;",
        "type MonitorTuple = Readonly<TupleOf<3, string>>;"
    );
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

const inlineNoFixTupleAliasShadowedTupleOfInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<TupleOf> = Tuple<string, 3>;",
].join("\n");

const inlineNoFixShadowedReadonlyInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineFixTupleWhenReadonlyShadowedInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = Tuple<string, 3>;",
].join("\n");

const inlineFixTupleWhenReadonlyShadowedOutputCode =
    inlineFixTupleWhenReadonlyShadowedInvalidCode.replace(
        "type Box<Readonly> = Tuple<string, 3>;",
        "type Box<Readonly> = TupleOf<3, string>;"
    );

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTupleOf: preferTupleOfMessage,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
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
            name: "reports fixture ReadonlyTuple and Tuple aliases",
            output: fixtureFixableOutputCode,
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
            name: "reports and autofixes inline ReadonlyTuple alias import",
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
            name: "reports and autofixes inline Tuple alias import",
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
            name: "reports ReadonlyTuple alias when TupleOf identifier is shadowed",
            output: null,
        },
        {
            code: inlineNoFixTupleAliasShadowedTupleOfInvalidCode,
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
            name: "reports Tuple alias when TupleOf identifier is shadowed",
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
            name: "reports ReadonlyTuple alias when Readonly identifier is shadowed",
            output: null,
        },
        {
            code: inlineFixTupleWhenReadonlyShadowedInvalidCode,
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
            name: "autofixes Tuple alias even when Readonly identifier is shadowed",
            output: inlineFixTupleWhenReadonlyShadowedOutputCode,
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
            name: "accepts namespace-qualified FixedLengthArray references",
        },
    ],
});
