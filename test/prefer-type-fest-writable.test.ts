/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const mappedInvalidFixtureName = "prefer-type-fest-writable.invalid.ts";
const importedAliasInvalidFixtureName =
    "prefer-type-fest-writable-imported-alias.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { Mutable } from "type-aliases";',
    'import type { Writable } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = Mutable<User>;",
].join("\n");
const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    "type MutableUser = Mutable<User>;",
    "type MutableUser = Writable<User>;"
);
const mappedPKeyInvalidCode =
    "type WritableLike<T> = { -readonly [P in keyof T]: T[P] };";
const mappedNearMissReadonlyValidCode =
    "type WritableLike<T> = { readonly [K in keyof T]: T[K] };";
const mappedOptionalValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]?: T[K] };";
const mappedNameRemapValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T as K]-?: T[K] };";
const mappedNameRemapWithoutOptionalValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T as K]: T[K] };";
const mappedConstraintValidCode =
    "type WritableLike<T> = { -readonly [K in T]-?: T[K] };";
const mappedConstraintWithoutTypeOperatorValidCode =
    "type WritableLike<T> = { -readonly [K in T]: T[K] };";
const mappedNearMissIndexMismatchValidCode =
    "type WritableLike<T, P extends keyof T> = { -readonly [K in keyof T]: T[P] };";
const mappedLiteralIndexTypeValidCode =
    'type WritableLike<T extends { readonly id: string }> = { -readonly [K in keyof T]: T["id"] };';
const mappedNearMissObjectMismatchValidCode =
    "type WritableLike<T, U extends T> = { -readonly [K in keyof T]: U[K] };";
const mappedNamespaceAliasValidCode = [
    'import type * as Aliases from "type-aliases";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = Aliases.Mutable<User>;",
].join("\n");
const skipPathInvalidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]: T[K] };";
const validFixtureName = "prefer-type-fest-writable.valid.ts";

ruleTester.run(
    "prefer-type-fest-writable",
    getPluginRule("prefer-type-fest-writable"),
    {
        invalid: [
            {
                code: readTypedFixture(importedAliasInvalidFixtureName),
                errors: [
                    {
                        data: {
                            alias: "Mutable",
                            replacement: "Writable",
                        },
                        messageId: "preferWritableAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasInvalidFixtureName),
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Mutable",
                            replacement: "Writable",
                        },
                        messageId: "preferWritableAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasInvalidFixtureName),
                output: inlineFixableOutputCode,
            },
            {
                code: readTypedFixture(mappedInvalidFixtureName),
                errors: [
                    { messageId: "preferWritable" },
                    { messageId: "preferWritable" },
                ],
                filename: typedFixturePath(mappedInvalidFixtureName),
            },
            {
                code: mappedPKeyInvalidCode,
                errors: [{ messageId: "preferWritable" }],
                filename: typedFixturePath(mappedInvalidFixtureName),
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedNearMissReadonlyValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedOptionalValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedNameRemapValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedNameRemapWithoutOptionalValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedConstraintValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedConstraintWithoutTypeOperatorValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedNearMissIndexMismatchValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedLiteralIndexTypeValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedNearMissObjectMismatchValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: mappedNamespaceAliasValidCode,
                filename: typedFixturePath(validFixtureName),
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-writable.skip.ts"
                ),
            },
        ],
    }
);
