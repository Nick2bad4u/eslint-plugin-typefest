import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-exactly-one.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-exactly-one.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-exactly-one.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-require-exactly-one.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'from "type-aliases";\r\n',
        'from "type-aliases";\nimport type { RequireExactlyOne } from "type-fest";\r\n'
    )
    .replace("OneOf<", "RequireExactlyOne<");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "RequireOnlyOne<",
    "RequireExactlyOne<"
);
const inlineFixableInvalidCode = [
    'import type { OneOf } from "type-aliases";',
    'import type { RequireExactlyOne } from "type-fest";',
    "",
    "type Input = OneOf<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = OneOf<{ a?: string; b?: number }>;",
    "type Input = RequireExactlyOne<{ a?: string; b?: number }>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-require-exactly-one",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest RequireExactlyOne over imported aliases such as OneOf/RequireOnlyOne.",
        enforceRuleShape: true,
        messages: {
            preferRequireExactlyOne:
                "Prefer `{{replacement}}` from type-fest to require exactly one key from a group instead of legacy alias `{{alias}}`.",
        },
        name: "prefer-type-fest-require-exactly-one",
    }
);

ruleTester.run(
    "prefer-type-fest-require-exactly-one",
    getPluginRule("prefer-type-fest-require-exactly-one"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                    {
                        data: {
                            alias: "RequireOnlyOne",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture OneOf and RequireOnlyOne alias usage",
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
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline OneOf alias import",
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
                name: "accepts namespace-qualified RequireExactlyOne references",
            },
        ],
    }
);
