/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-simplify.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-simplify.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-simplify.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-simplify.skip.ts";
const invalidFixtureName = "prefer-type-fest-simplify.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { Expand, Simplify } from "type-fest";',
    "",
    "type Payload = {",
    "    id: string;",
    "};",
    "",
    "type Flattened = Expand<Payload>;",
    "",
    "String({} as Flattened);",
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Flattened = Expand<Payload>;",
    "type Flattened = Simplify<Payload>;"
);

ruleTester.run(
    "prefer-type-fest-simplify",
    getPluginRule("prefer-type-fest-simplify"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                    {
                        data: {
                            alias: "Prettify",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Expand",
                            replacement: "Simplify",
                        },
                        messageId: "preferSimplify",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                output: inlineFixableOutputCode,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
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
            },
        ],
    }
);
