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
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-require-all-or-none.skip.ts";
const invalidFixtureName = "prefer-type-fest-require-all-or-none.invalid.ts";
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

ruleTester.run(
    "prefer-type-fest-require-all-or-none",
    getPluginRule("prefer-type-fest-require-all-or-none"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
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
