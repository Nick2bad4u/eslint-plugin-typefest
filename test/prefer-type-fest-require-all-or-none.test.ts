import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-all-or-none.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-all-or-none.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-all-or-none.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-require-all-or-none.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'from "type-aliases";\r\n',
        'from "type-aliases";\nimport type { RequireAllOrNone } from "type-fest";\r\n'
    )
    .replace("AllOrNone<", "RequireAllOrNone<");
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "AllOrNothing<",
    "RequireAllOrNone<"
);
const inlineFixableInvalidCode = [
    'import type { AllOrNone } from "type-aliases";',
    'import type { RequireAllOrNone } from "type-fest";',
    "",
    "type Input = AllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = AllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;",
    "type Input = RequireAllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-require-all-or-none",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest RequireAllOrNone over imported aliases such as AllOrNone/AllOrNothing.",
        enforceRuleShape: true,
        messages: {
            preferRequireAllOrNone:
                "Prefer `{{replacement}}` from type-fest to require all-or-none key groups instead of legacy alias `{{alias}}`.",
        },
        name: "prefer-type-fest-require-all-or-none",
    }
);

ruleTester.run(
    "prefer-type-fest-require-all-or-none",
    getPluginRule("prefer-type-fest-require-all-or-none"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "AllOrNone",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                    {
                        data: {
                            alias: "AllOrNothing",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture AllOrNone and AllOrNothing alias usage",
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
                            alias: "AllOrNone",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline AllOrNone alias import",
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
                name: "accepts namespace-qualified RequireAllOrNone references",
            },
        ],
    }
);
