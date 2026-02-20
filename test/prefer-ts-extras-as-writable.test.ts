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
                name: "reports fixture type-fest Writable assertions",
            },
            {
                code: inlineInvalidTypeAssertionCode,
                errors: [{ messageId: "preferTsExtrasAsWritable" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports angle-bracket Writable assertion",
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
                name: "accepts namespace-specific safe fixture patterns",
            },
            {
                code: inlineValidTypeLiteralAssertionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores assertion to plain type literal",
            },
            {
                code: inlineValidNonTypeFestNamespaceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Writable from non-type-fest namespace",
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
