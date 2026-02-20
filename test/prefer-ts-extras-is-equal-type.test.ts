/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-equal-type.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-equal-type.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-equal-type.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const inlineInvalidAliasedImportCode = [
    'import type { IsEqual as IsEqualAlias } from "type-fest";',
    "",
    "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
    "",
    "Boolean(aliasedEqualCheck);",
].join("\n");
const inlineInvalidAliasedImportSuggestionOutput =
    inlineInvalidAliasedImportCode.replace(
        "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
        "const aliasedEqualCheck = isEqualType<string, string>() || true;"
    );
const inlineValidTypeAliasReferenceCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "type EqualityFlag = IsEqual<string, string>;",
    "const equalityFlag: EqualityFlag = true;",
    "",
    "Boolean(equalityFlag);",
].join("\n");
const inlineValidNonBooleanInitializerCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const equalityFlag: IsEqual<string, string> = true as const;",
    "",
    "Boolean(equalityFlag);",
].join("\n");
const inlineValidObjectPatternDeclaratorCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const { equalityFlag }: { equalityFlag: IsEqual<string, string> } = {",
    "    equalityFlag: true,",
    "};",
    "",
    "Boolean(equalityFlag);",
].join("\n");
const inlineValidNamespaceNonIsEqualCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    'const value: TypeFest.Promisable<string> = "monitor";',
    "",
    "Boolean(value);",
].join("\n");
const inlineInvalidWithoutTypeArgumentsCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const noTypeArgumentsCheck: IsEqual = true;",
    "",
    "Boolean(noTypeArgumentsCheck);",
].join("\n");
const inlineValidUnionBooleanTypeCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const unionFlag: false | true = true;",
    "",
    "Boolean(unionFlag);",
].join("\n");
const inlineValidNamespaceBooleanNonIsEqualCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    "const namespaceBoolean: TypeFest.Promisable<boolean> = true;",
    "",
    "Boolean(namespaceBoolean);",
].join("\n");

ruleTester.run(
    "prefer-ts-extras-is-equal-type",
    getPluginRule("prefer-ts-extras-is-equal-type"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureCode.replace(
                                    "const directEqualCheck: IsEqual<string, string> = true;",
                                    "const directEqualCheck = isEqualType<string, string>() || true;"
                                ),
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureCode.replace(
                                    "const directUnequalCheck: IsEqual<number, string> = false;",
                                    "const directUnequalCheck = isEqualType<number, string>() && false;"
                                ),
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureCode.replace(
                                    'const namespaceEqualCheck: TypeFest.IsEqual<"a", "a"> = true;',
                                    'const namespaceEqualCheck = isEqualType<"a", "a">() || true;'
                                ),
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture IsEqual variable initializers",
            },
            {
                code: inlineInvalidAliasedImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: inlineInvalidAliasedImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports aliased IsEqual import in variable initializer",
            },
            {
                code: inlineInvalidWithoutTypeArgumentsCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without explicit type arguments",
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidTypeAliasReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual used through type alias reference",
            },
            {
                code: inlineValidNonBooleanInitializerCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual initializer that is not plain boolean literal",
            },
            {
                code: inlineValidObjectPatternDeclaratorCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores IsEqual inside object-pattern declarator",
            },
            {
                code: inlineValidNamespaceNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace usage of non-IsEqual type-fest type",
            },
            {
                code: inlineValidUnionBooleanTypeCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores plain boolean union type",
            },
            {
                code: inlineValidNamespaceBooleanNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace Promisable boolean value",
            },
        ],
    }
);
