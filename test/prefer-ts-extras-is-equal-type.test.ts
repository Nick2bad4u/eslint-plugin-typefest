/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-equal-type.test` behavior.
 */
import { describe, expect, it } from "vitest";

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
const invalidFixtureCodeWithTsExtrasImport =
    invalidFixtureCode.replace(
        'import type { IsEqual } from "type-fest";\r\n',
        'import type { IsEqual } from "type-fest";\nimport { isEqualType } from "ts-extras";\r\n'
    );
const invalidFixtureDirectEqualSuggestionOutput =
    invalidFixtureCodeWithTsExtrasImport.replace(
        "const directEqualCheck: IsEqual<string, string> = true;",
        "const directEqualCheck = isEqualType<string, string>() || true;"
    );
const invalidFixtureDirectUnequalSuggestionOutput =
    invalidFixtureCodeWithTsExtrasImport.replace(
        "const directUnequalCheck: IsEqual<number, string> = false;",
        "const directUnequalCheck = isEqualType<number, string>() && false;"
    );
const invalidFixtureNamespaceSuggestionOutput =
    invalidFixtureCodeWithTsExtrasImport.replace(
        'const namespaceEqualCheck: TypeFest.IsEqual<"a", "a"> = true;',
        'const namespaceEqualCheck = isEqualType<"a", "a">() || true;'
    );
const inlineInvalidAliasedImportCode = [
    'import type { IsEqual as IsEqualAlias } from "type-fest";',
    "",
    "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
    "",
    "Boolean(aliasedEqualCheck);",
].join("\n");
const inlineInvalidAliasedImportSuggestionOutput =
    inlineInvalidAliasedImportCode
        .replace(
            'import type { IsEqual as IsEqualAlias } from "type-fest";',
            'import type { IsEqual as IsEqualAlias } from "type-fest";\nimport { isEqualType } from "ts-extras";'
        )
        .replace(
            "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
            "const aliasedEqualCheck = isEqualType<string, string>() || true;"
        );
const inlineInvalidAliasedTsExtrasImportCode = [
    'import { isEqualType as isEqualTypeAlias } from "ts-extras";',
    'import type { IsEqual } from "type-fest";',
    "",
    "const aliasedRuntimeHelperCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(aliasedRuntimeHelperCheck);",
].join("\n");
const inlineInvalidAliasedTsExtrasImportSuggestionOutput =
    inlineInvalidAliasedTsExtrasImportCode.replace(
        "const aliasedRuntimeHelperCheck: IsEqual<string, string> = true;",
        "const aliasedRuntimeHelperCheck = isEqualTypeAlias<string, string>() || true;"
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
const inlineInvalidWithConflictingIsEqualTypeBindingCode = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const isEqualType = (left: unknown, right: unknown): boolean => left === right;",
    "const conflictingBindingCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(conflictingBindingCheck);",
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
const inlineValidNamedImportBooleanNonIsEqualCode = [
    'import type { Promisable } from "type-fest";',
    "",
    "const namedImportBoolean: Promisable<boolean> = true;",
    "",
    "Boolean(namedImportBoolean);",
].join("\n");

interface IsEqualTypeRuleMetadataSnapshot {
    defaultOptions?: readonly unknown[];
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        hasSuggestions?: boolean;
        messages?: Record<string, string>;
        schema?: readonly unknown[];
        type?: string;
    };
    name?: string;
}

const loadIsEqualTypeRuleMetadata = async (): Promise<
    IsEqualTypeRuleMetadataSnapshot
> => {
    const moduleUnderTest = await import(
        "../src/rules/prefer-ts-extras-is-equal-type"
    );

    return moduleUnderTest.default as IsEqualTypeRuleMetadataSnapshot;
};

describe("prefer-ts-extras-is-equal-type metadata", () => {
    it("exposes stable report and suggestion messages", async () => {
        const metadataRule = await loadIsEqualTypeRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown })
                      .defaultOptions
                : undefined;

        expect(metadataRule.name).toBe("prefer-ts-extras-is-equal-type");
        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.meta?.docs?.description).toBe(
            "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-equal-type.md"
        );
        expect(metadataRule.meta?.hasSuggestions).toBeTruthy();
        expect(metadataRule.meta?.messages?.["preferTsExtrasIsEqualType"]).toBe(
            "Prefer `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertion variables."
        );
        expect(
            metadataRule.meta?.messages?.["suggestTsExtrasIsEqualType"]
        ).toBe(
            "Replace this boolean `IsEqual<...>` assertion variable with `isEqualType<...>()`."
        );
        expect(metadataRule.meta?.schema).toStrictEqual([]);
        expect(metadataRule.meta?.type).toBe("suggestion");
    });
});

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
                                output: invalidFixtureDirectEqualSuggestionOutput,
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureDirectUnequalSuggestionOutput,
                            },
                        ],
                    },
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output: invalidFixtureNamespaceSuggestionOutput,
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
                code: inlineInvalidAliasedTsExtrasImportCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: [
                            {
                                messageId: "suggestTsExtrasIsEqualType",
                                output:
                                    inlineInvalidAliasedTsExtrasImportSuggestionOutput,
                            },
                        ],
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reuses aliased ts-extras isEqualType import when present",
            },
            {
                code: inlineInvalidWithoutTypeArgumentsCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without explicit type arguments",
            },
            {
                code: inlineInvalidWithConflictingIsEqualTypeBindingCode,
                errors: [
                    {
                        messageId: "preferTsExtrasIsEqualType",
                        suggestions: null,
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports IsEqual usage without suggestion when local isEqualType binding conflicts",
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
            {
                code: inlineValidNamedImportBooleanNonIsEqualCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores named-import Promisable boolean value",
            },
        ],
    }
);
