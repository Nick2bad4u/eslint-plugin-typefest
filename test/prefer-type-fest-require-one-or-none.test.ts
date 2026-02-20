/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-one-or-none.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-one-or-none.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-one-or-none.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-require-one-or-none.skip.ts";
const invalidFixtureName = "prefer-type-fest-require-one-or-none.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { AtMostOne } from "type-aliases";',
    'import type { RequireOneOrNone } from "type-fest";',
    "",
    "type Input = AtMostOne<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = AtMostOne<{ a?: string; b?: number }>;",
    "type Input = RequireOneOrNone<{ a?: string; b?: number }>;"
);

ruleTester.run(
    "prefer-type-fest-require-one-or-none",
    getPluginRule("prefer-type-fest-require-one-or-none"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "AtMostOne",
                            replacement: "RequireOneOrNone",
                        },
                        messageId: "preferRequireOneOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture AtMostOne alias usage",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "AtMostOne",
                            replacement: "RequireOneOrNone",
                        },
                        messageId: "preferRequireOneOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline AtMostOne alias import",
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
                name: "accepts namespace-qualified RequireOneOrNone references",
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
