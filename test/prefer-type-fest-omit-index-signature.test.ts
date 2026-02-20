/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-omit-index-signature.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-omit-index-signature.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-omit-index-signature.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-omit-index-signature.skip.ts";
const invalidFixtureName = "prefer-type-fest-omit-index-signature.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { RemoveIndexSignature } from "type-aliases";',
    'import type { OmitIndexSignature } from "type-fest";',
    "",
    "type Input = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type Input = RemoveIndexSignature<{ a: string; [key: string]: unknown }>;",
    "type Input = OmitIndexSignature<{ a: string; [key: string]: unknown }>;"
);

ruleTester.run(
    "prefer-type-fest-omit-index-signature",
    getPluginRule("prefer-type-fest-omit-index-signature"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "RemoveIndexSignature",
                            replacement: "OmitIndexSignature",
                        },
                        messageId: "preferOmitIndexSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture RemoveIndexSignature alias usage",
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "RemoveIndexSignature",
                            replacement: "OmitIndexSignature",
                        },
                        messageId: "preferOmitIndexSignature",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline RemoveIndexSignature alias",
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
                name: "accepts namespace-qualified OmitIndexSignature references",
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
