import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-at-least-one.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-at-least-one.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-at-least-one.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-require-at-least-one.skip.ts";
const invalidFixtureName = "prefer-type-fest-require-at-least-one.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = invalidFixtureCode
    .replace(
        'import type { AtLeastOne } from "type-aliases";\r\n',
        'import type { AtLeastOne } from "type-aliases";\nimport type { RequireAtLeastOne } from "type-fest";\r\n'
    )
    .replace("AtLeastOne<", "RequireAtLeastOne<");
const inlineFixableInvalidCode = [
    'import type { AtLeastOne } from "type-aliases";',
    'import type { RequireAtLeastOne } from "type-fest";',
    "",
    "type Input = AtLeastOne<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = AtLeastOne<{ a?: string; b?: number }>;",
    "type Input = RequireAtLeastOne<{ a?: string; b?: number }>;"
);

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-require-at-least-one"
);

ruleTester.run(
    "prefer-type-fest-require-at-least-one",
    getPluginRule("prefer-type-fest-require-at-least-one"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "AtLeastOne",
                            replacement: "RequireAtLeastOne",
                        },
                        messageId: "preferRequireAtLeastOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture AtLeastOne alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "AtLeastOne",
                            replacement: "RequireAtLeastOne",
                        },
                        messageId: "preferRequireAtLeastOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline AtLeastOne alias import",
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
                name: "accepts namespace-qualified RequireAtLeastOne references",
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
