import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-iterable-element.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-iterable-element";
const docsDescription =
    "require TypeFest IterableElement over imported aliases such as SetElement/SetEntry/SetValues.";
const preferIterableElementMessage =
    "Prefer `{{replacement}}` from type-fest to extract element types from iterable containers instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-iterable-element.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-iterable-element.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-iterable-element.skip.ts";
const invalidFixtureName = "prefer-type-fest-iterable-element.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'from "type-aliases";\r\n',
        'from "type-aliases";\nimport type { IterableElement } from "type-fest";\r\n'
    )
    .replace("SetElement<", "IterableElement<");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode
    .replace("SetEntry<", "IterableElement<")
    .replace("SetValues<", "IterableElement<");
const inlineFixableInvalidCode = [
    'import type { SetElement } from "type-aliases";',
    'import type { IterableElement } from "type-fest";',
    "",
    "type Input = SetElement<Set<string>>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = SetElement<Set<string>>;",
    "type Input = IterableElement<Set<string>>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferIterableElement: preferIterableElementMessage,
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
                        alias: "SetElement",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
                {
                    data: {
                        alias: "SetEntry",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
                {
                    data: {
                        alias: "SetValues",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Set* alias usage",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "SetElement",
                        replacement: "IterableElement",
                    },
                    messageId: "preferIterableElement",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline SetElement alias import",
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
            name: "accepts namespace-qualified IterableElement references",
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
});
