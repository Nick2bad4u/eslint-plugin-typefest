/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-set-required.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-set-required.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-set-required.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-set-required.skip.ts";
const invalidFixtureName = "prefer-type-fest-set-required.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { RequiredBy } from "type-aliases";',
    'import type { SetRequired } from "type-fest";',
    "",
    "type User = {",
    "    id?: string;",
    "};",
    "",
    'type StrictUser = RequiredBy<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type StrictUser = RequiredBy<User, "id">;',
    'type StrictUser = SetRequired<User, "id">;'
);

ruleTester.run(
    "prefer-type-fest-set-required",
    getPluginRule("prefer-type-fest-set-required"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "RequiredBy",
                            replacement: "SetRequired",
                        },
                        messageId: "preferSetRequired",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "RequiredBy",
                            replacement: "SetRequired",
                        },
                        messageId: "preferSetRequired",
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
