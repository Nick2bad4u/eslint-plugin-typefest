import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-non-nullable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-non-nullable.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-non-nullable.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-set-non-nullable.skip.ts";
const invalidFixtureName = "prefer-type-fest-set-non-nullable.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { NonNullableBy } from "type-aliases";\r\n',
        'import type { NonNullableBy } from "type-aliases";\nimport type { SetNonNullable } from "type-fest";\r\n'
    )
    .replace("NonNullableBy<", "SetNonNullable<");
const inlineFixableInvalidCode = [
    'import type { NonNullableBy } from "type-aliases";',
    'import type { SetNonNullable } from "type-fest";',
    "",
    "type User = {",
    "    id: string | null;",
    "};",
    "",
    'type Normalized = NonNullableBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type Normalized = NonNullableBy<User, "id">;',
    'type Normalized = SetNonNullable<User, "id">;'
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-set-non-nullable",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest SetNonNullable over imported aliases such as NonNullableBy.",
        enforceRuleShape: true,
        messages: {
            preferSetNonNullable:
                "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
        },
        name: "prefer-type-fest-set-non-nullable",
    }
);

ruleTester.run(
    "prefer-type-fest-set-non-nullable",
    getPluginRule("prefer-type-fest-set-non-nullable"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "NonNullableBy",
                            replacement: "SetNonNullable",
                        },
                        messageId: "preferSetNonNullable",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture SetComplement and SetDifference aliases",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "NonNullableBy",
                            replacement: "SetNonNullable",
                        },
                        messageId: "preferSetNonNullable",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline SetComplement alias import",
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
                name: "accepts namespace-qualified SetNonNullable references",
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
    }
);
