import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unwrap-tagged.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-unwrap-tagged.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-unwrap-tagged.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-unwrap-tagged.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { UnwrapOpaque } from "type-aliases";\r\n',
        'import type { UnwrapOpaque } from "type-aliases";\nimport type { UnwrapTagged } from "type-fest";\r\n'
    )
    .replace("UnwrapOpaque<", "UnwrapTagged<");
const inlineFixableInvalidCode = [
    'import type { UnwrapOpaque } from "type-aliases";',
    'import type { UnwrapTagged } from "type-fest";',
    "",
    'type UserId = UnwrapOpaque<{ readonly __brand: "UserId" } & string>;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type UserId = UnwrapOpaque<{ readonly __brand: "UserId" } & string>;',
    'type UserId = UnwrapTagged<{ readonly __brand: "UserId" } & string>;'
);
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { UnwrapOpaque } from "type-aliases";',
    "",
    'type Wrapper<UnwrapTagged> = UnwrapOpaque<{ readonly __brand: "UserId" } & string>;',
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-unwrap-tagged",
    {
        docsDescription:
            "require TypeFest UnwrapTagged over imported aliases such as UnwrapOpaque.",
        enforceRuleShape: true,
        messages: {
            preferUnwrapTagged:
                "Prefer `{{replacement}}` from type-fest to unwrap Tagged/Opaque values instead of legacy alias `{{alias}}`.",
        },
    }
);

ruleTester.run(
    "prefer-type-fest-unwrap-tagged",
    getPluginRule("prefer-type-fest-unwrap-tagged"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture UnwrapOpaque and OpaqueType aliases",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline UnwrapOpaque alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "UnwrapOpaque",
                            replacement: "UnwrapTagged",
                        },
                        messageId: "preferUnwrapTagged",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports UnwrapOpaque alias when replacement identifier is shadowed",
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
                name: "accepts namespace-qualified UnwrapTagged references",
            },
        ],
    }
);
