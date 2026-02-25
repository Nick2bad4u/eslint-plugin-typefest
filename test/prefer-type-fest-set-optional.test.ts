import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-optional.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-optional.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-optional.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-set-optional.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { PartialBy } from "type-aliases";\r\n',
        'import type { PartialBy } from "type-aliases";\nimport type { SetOptional } from "type-fest";\r\n'
    )
    .replace("PartialBy<", "SetOptional<");
const inlineFixableInvalidCode = [
    'import type { PartialBy } from "type-aliases";',
    'import type { SetOptional } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    'type MaybeUser = PartialBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type MaybeUser = PartialBy<User, "id">;',
    'type MaybeUser = SetOptional<User, "id">;'
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-set-optional",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest SetOptional over imported alias types like PartialBy.",
        enforceRuleShape: true,
        messages: {
            preferSetOptional:
                "Prefer `{{replacement}}` from type-fest to make selected keys optional instead of legacy alias `{{alias}}`.",
        },
        name: "prefer-type-fest-set-optional",
    }
);

ruleTester.run(
    "prefer-type-fest-set-optional",
    getPluginRule("prefer-type-fest-set-optional"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "PartialBy",
                            replacement: "SetOptional",
                        },
                        messageId: "preferSetOptional",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture MarkOptional and PartialBy aliases",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "PartialBy",
                            replacement: "SetOptional",
                        },
                        messageId: "preferSetOptional",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline MarkOptional alias import",
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
                name: "accepts namespace-qualified SetOptional references",
            },
        ],
    }
);
