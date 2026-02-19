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
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-type-fest-set-optional.skip.ts";
const invalidFixtureName = "prefer-type-fest-set-optional.invalid.ts";
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

ruleTester.run(
    "prefer-type-fest-set-optional",
    getPluginRule("prefer-type-fest-set-optional"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
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
