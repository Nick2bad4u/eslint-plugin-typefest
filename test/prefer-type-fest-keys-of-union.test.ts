import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
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
const ruleId = "prefer-type-fest-keys-of-union";
const docsDescription =
    "require TypeFest KeysOfUnion over imported aliases such as AllKeys.";
const preferKeysOfUnionMessage =
    "Prefer `{{replacement}}` from type-fest to derive keys from union members instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-keys-of-union.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-keys-of-union.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-keys-of-union.skip.ts";
const invalidFixtureName = "prefer-type-fest-keys-of-union.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { AllKeys } from "type-aliases";\r\n',
        'import type { AllKeys } from "type-aliases";\nimport type { KeysOfUnion } from "type-fest";\r\n'
    )
    .replace("AllKeys<", "KeysOfUnion<");
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

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferKeysOfUnion: preferKeysOfUnionMessage,
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
                        alias: "AllKeys",
                        replacement: "KeysOfUnion",
                    },
                    messageId: "preferKeysOfUnion",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture AllKeys alias usage",
            output: fixtureFixableOutputCode,
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
            name: "reports and autofixes inline AllKeys alias import",
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
            name: "accepts namespace-qualified KeysOfUnion references",
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
