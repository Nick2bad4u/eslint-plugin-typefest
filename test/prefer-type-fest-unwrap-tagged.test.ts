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
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-unwrap-tagged.skip.ts";
const invalidFixtureName = "prefer-type-fest-unwrap-tagged.invalid.ts";
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

ruleTester.run(
    "prefer-type-fest-unwrap-tagged",
    getPluginRule("prefer-type-fest-unwrap-tagged"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
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
