/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-except.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-except");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-except.valid.ts";
const invalidFixtureName = "prefer-type-fest-except.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    'import type { Except } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
    'type UserWithoutId = Except<User, "id">;'
);
const inlineNoFixWithoutExceptImportCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");
const inlineValidNamespaceAliasCode = [
    'import type * as TypeAliases from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = TypeAliases.HomomorphicOmit<User, "id">;',
].join("\n");
const inlineValidOmitWithoutTypeArgumentsCode = [
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    "type UserWithoutId = Omit<User>;",
].join("\n");
const inlineValidBareOmitReferenceCode = "type OmitFactory = Omit;";

ruleTester.run("prefer-type-fest-except", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferExcept",
                },
                {
                    messageId: "preferExcept",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Omit-alias usage",
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes imported HomomorphicOmit alias",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixWithoutExceptImportCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports alias usage without available Except import fix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidNamespaceAliasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores namespace-qualified alias reference",
        },
        {
            code: inlineValidOmitWithoutTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Omit with missing second type argument",
        },
        {
            code: inlineValidBareOmitReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Omit type reference",
        },
        {
            code: readTypedFixture(invalidFixtureName),
            filename: typedFixturePath("tests", invalidFixtureName),
            name: "skips file under tests fixture path",
        },
    ],
});
