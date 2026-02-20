/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-iterable-element.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-iterable-element.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-iterable-element.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-iterable-element.skip.ts";
const invalidFixtureName = "prefer-type-fest-iterable-element.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { SetElement } from "type-aliases";',
    'import type { IterableElement } from "type-fest";',
    "",
    "type Input = SetElement<Set<string>>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = SetElement<Set<string>>;",
    "type Input = IterableElement<Set<string>>;"
);

ruleTester.run(
    "prefer-type-fest-iterable-element",
    getPluginRule("prefer-type-fest-iterable-element"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "SetElement",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
                    },
                    {
                        data: {
                            alias: "SetEntry",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
                    },
                    {
                        data: {
                            alias: "SetValues",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Set* alias usage",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "SetElement",
                            replacement: "IterableElement",
                        },
                        messageId: "preferIterableElement",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline SetElement alias import",
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
                name: "accepts namespace-qualified IterableElement references",
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
