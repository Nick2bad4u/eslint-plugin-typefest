import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-omit-index-signature.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-omit-index-signature";
const docsDescription =
    "require TypeFest OmitIndexSignature over imported aliases such as RemoveIndexSignature.";
const preferOmitIndexSignatureMessage =
    "Prefer `{{replacement}}` from type-fest to strip index signatures from object types instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-omit-index-signature.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-omit-index-signature.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-omit-index-signature.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { RemoveIndexSignature } from "type-aliases";\r\n',
        'import type { RemoveIndexSignature } from "type-aliases";\nimport type { OmitIndexSignature } from "type-fest";\r\n'
    )
    .replace("RemoveIndexSignature<", "OmitIndexSignature<");
const inlineFixableInvalidCode = [
    'import type { RemoveIndexSignature } from "type-aliases";',
    'import type { OmitIndexSignature } from "type-fest";',
    "",
    "type Input = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
    "type Input = OmitIndexSignature<{ a: string; [key: string]: unknown }>;"
);
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { RemoveIndexSignature } from "type-aliases";',
    "",
    "type Wrapper<OmitIndexSignature> = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferOmitIndexSignature: preferOmitIndexSignatureMessage,
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
                        alias: "RemoveIndexSignature",
                        replacement: "OmitIndexSignature",
                    },
                    messageId: "preferOmitIndexSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture RemoveIndexSignature alias usage",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RemoveIndexSignature",
                        replacement: "OmitIndexSignature",
                    },
                    messageId: "preferOmitIndexSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline RemoveIndexSignature alias",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [
                {
                    data: {
                        alias: "RemoveIndexSignature",
                        replacement: "OmitIndexSignature",
                    },
                    messageId: "preferOmitIndexSignature",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports RemoveIndexSignature alias when replacement identifier is shadowed",
            output: null,
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
            name: "accepts namespace-qualified OmitIndexSignature references",
        },
    ],
});
