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
const mappedNonIndexedAccessValueValidCode =
    "type WritableLike<T> = { -readonly [K in keyof T]: K };";
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
                name: "reports fixture imported Mutable alias usage",
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
                name: "reports and autofixes inline Mutable alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: readTypedFixture(mappedInvalidFixtureName),
                errors: [
                    { messageId: "preferWritable" },
                    { messageId: "preferWritable" },
                ],
                filename: typedFixturePath(mappedInvalidFixtureName),
                name: "reports fixture readonly mapped type aliases",
            },
            {
                code: mappedPKeyInvalidCode,
                errors: [{ messageId: "preferWritable" }],
                filename: typedFixturePath(mappedInvalidFixtureName),
                name: "reports mapped type using P key identifier",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: mappedNearMissReadonlyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type that retains readonly modifier",
            },
            {
                code: mappedOptionalValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type that preserves optional modifier",
            },
            {
                code: mappedNameRemapValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with key remapping and optional removal",
            },
            {
                code: mappedNameRemapWithoutOptionalValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with key remapping only",
            },
            {
                code: mappedConstraintValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with custom key constraint and optional removal",
            },
            {
                code: mappedConstraintWithoutTypeOperatorValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with custom key constraint",
            },
            {
                code: mappedNearMissIndexMismatchValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with mismatched indexed access key",
            },
            {
                code: mappedLiteralIndexTypeValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with literal indexed access value",
            },
            {
                code: mappedNearMissObjectMismatchValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type using alternate object source",
            },
            {
                code: mappedNonIndexedAccessValueValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores mapped type with non-indexed value expression",
            },
            {
                code: mappedNamespaceAliasValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace-qualified Mutable alias reference",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-type-fest-writable.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
