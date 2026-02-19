/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-as-writable.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-as-writable.valid.ts";
const namespaceValidFixtureName =
    "prefer-ts-extras-as-writable.namespace.valid.ts";
const skipTestPathFixtureDirectory = "tests";
const skipTestPathFixtureName = "prefer-ts-extras-as-writable.skip.ts";
const invalidFixtureName = "prefer-ts-extras-as-writable.invalid.ts";
const inlineInvalidTypeAssertionCode = [
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const mutableRecord = <Writable<ReadonlyRecord>>readonlyRecord;",
    "",
    "String(mutableRecord);",
].join("\n");
const inlineValidTypeLiteralAssertionCode = [
    'import type { Writable } from "type-fest";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as { readonly id: number };",
    "",
    "String(typedRecord);",
].join("\n");
const inlineValidNonTypeFestNamespaceCode = [
    'import type * as Aliases from "type-aliases";',
    "",
    "type ReadonlyRecord = {",
    "    readonly id: number;",
    "};",
    "",
    "declare const readonlyRecord: ReadonlyRecord;",
    "",
    "const typedRecord = readonlyRecord as Aliases.Writable<ReadonlyRecord>;",
    "",
    "String(typedRecord);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-as-writable",
    getPluginRule("prefer-ts-extras-as-writable"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                    { messageId: "preferTsExtrasAsWritable" },
                ],
                filename: typedFixturePath(invalidFixtureName),
            },
            {
                code: inlineInvalidTypeAssertionCode,
                errors: [{ messageId: "preferTsExtrasAsWritable" }],
                filename: typedFixturePath(invalidFixtureName),
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
                code: inlineValidTypeLiteralAssertionCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: inlineValidNonTypeFestNamespaceCode,
                filename: typedFixturePath(validFixtureName),
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
