/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { describe, expect, it } from "vitest";

import { collectImportedTypeAliasMatches } from "../../src/_internal/imported-type-aliases";

interface ImportedAliasRecord {
    importedName: ImportedName;
    localIndex: number;
}

type ImportedName = "Branded" | "Expand" | "HomomorphicOmit" | "Opaque";

const replacementsByImportedName: Readonly<Record<ImportedName, string>> = {
    Branded: "Tagged",
    Expand: "Simplify",
    HomomorphicOmit: "Except",
    Opaque: "Tagged",
};

/**
 * CreateSourceCode helper.
 *
 * @param body - Value to inspect.
 *
 * @returns CreateSourceCode helper result.
 */

const createSourceCode = (
    body: unknown[]
): Parameters<typeof collectImportedTypeAliasMatches>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<typeof collectImportedTypeAliasMatches>[0];

/**
 * CreateIdentifierImportSpecifier helper.
 *
 * @param importedName - Value to inspect.
 * @param localName - Value to inspect.
 *
 * @returns CreateIdentifierImportSpecifier helper result.
 */

const createIdentifierImportSpecifier = (
    importedName: string,
    localName: string
): unknown => ({
    imported: {
        name: importedName,
        type: "Identifier",
    },
    local: {
        name: localName,
    },
    type: "ImportSpecifier",
});

/**
 * CreateLiteralImportSpecifier helper.
 *
 * @param importedName - Value to inspect.
 * @param localName - Value to inspect.
 *
 * @returns CreateLiteralImportSpecifier helper result.
 */

const createLiteralImportSpecifier = (
    importedName: string,
    localName: string
): unknown => ({
    imported: {
        type: "Literal",
        value: importedName,
    },
    local: {
        name: localName,
    },
    type: "ImportSpecifier",
});

/**
 * CreateImportDeclaration helper.
 *
 * @param specifiers - Value to inspect.
 *
 * @returns CreateImportDeclaration helper result.
 */

const createImportDeclaration = (specifiers: unknown[]): unknown => ({
    source: {
        value: "type-fest",
    },
    specifiers,
    type: "ImportDeclaration",
});

/**
 * MapToRecord helper.
 *
 * @param map - Value to inspect.
 *
 * @returns MapToRecord helper result.
 */

const mapToRecord = <TValue>(
    map: ReadonlyMap<string, TValue>
): Readonly<Record<string, TValue>> => Object.fromEntries(map);

/**
 * BuildExpectedMatches helper.
 *
 * @param records - Value to inspect.
 *
 * @returns BuildExpectedMatches helper result.
 */

const buildExpectedMatches = (
    records: readonly ImportedAliasRecord[]
): ReadonlyMap<
    string,
    { importedName: string; replacementName: string; sourceValue: string }
> => {
    const expected = new Map<
        string,
        {
            importedName: string;
            replacementName: string;
            sourceValue: string;
        }
    >();

    for (const record of records) {
        expected.set(`Local${record.localIndex}`, {
            importedName: record.importedName,
            replacementName: replacementsByImportedName[record.importedName],
            sourceValue: "type-fest",
        });
    }

    return expected;
};

/**
 * CollectMatchesFromAliasRecords helper.
 *
 * @param records - Value to inspect.
 *
 * @returns CollectMatchesFromAliasRecords helper result.
 */

const collectMatchesFromAliasRecords = (
    records: readonly ImportedAliasRecord[]
): ReturnType<typeof collectImportedTypeAliasMatches> => {
    const specifiers = records.map((record) =>
        createIdentifierImportSpecifier(
            record.importedName,
            `Local${record.localIndex}`
        )
    );

    return collectImportedTypeAliasMatches(
        createSourceCode([createImportDeclaration(specifiers)]),
        replacementsByImportedName
    );
};

/**
 * Helper utility for assert representative alias combinations.
 *
 * @returns AssertRepresentativeAliasCombinations helper result.
 */

const assertRepresentativeAliasCombinations = (): void => {
    const records: readonly ImportedAliasRecord[] = [
        {
            importedName: "Branded",
            localIndex: 0,
        },
        {
            importedName: "Expand",
            localIndex: 1,
        },
        {
            importedName: "HomomorphicOmit",
            localIndex: 2,
        },
        {
            importedName: "Opaque",
            localIndex: 3,
        },
        {
            importedName: "Branded",
            localIndex: 8,
        },
        {
            importedName: "Opaque",
            localIndex: 8,
        },
    ];

    const actual = collectMatchesFromAliasRecords(records);
    const expected = buildExpectedMatches(records);

    expect(mapToRecord(actual)).toStrictEqual(mapToRecord(expected));
};

/**
 * Helper utility for assert collects matching named imports.
 *
 * @returns AssertCollectsMatchingNamedImports helper result.
 */

const assertCollectsMatchingNamedImports = (): void => {
    const result = collectImportedTypeAliasMatches(
        createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Opaque", "LegacyOpaque"),
                createIdentifierImportSpecifier("Branded", "LegacyBranded"),
            ]),
        ]),
        replacementsByImportedName
    );

    expect(mapToRecord(result)).toStrictEqual({
        LegacyBranded: {
            importedName: "Branded",
            replacementName: "Tagged",
            sourceValue: "type-fest",
        },
        LegacyOpaque: {
            importedName: "Opaque",
            replacementName: "Tagged",
            sourceValue: "type-fest",
        },
    });
};

/**
 * Helper utility for assert ignores unsupported declarations and specifiers.
 *
 * @returns AssertIgnoresUnsupportedDeclarationsAndSpecifiers helper result.
 */

const assertIgnoresUnsupportedDeclarationsAndSpecifiers = (): void => {
    const result = collectImportedTypeAliasMatches(
        createSourceCode([
            {
                type: "ExpressionStatement",
            },
            createImportDeclaration([
                {
                    local: {
                        name: "TypeFestNamespace",
                    },
                    type: "ImportNamespaceSpecifier",
                },
                createLiteralImportSpecifier("Opaque", "QuotedOpaque"),
                createIdentifierImportSpecifier("Expand", "LegacyExpand"),
            ]),
        ]),
        replacementsByImportedName
    );

    expect(mapToRecord(result)).toStrictEqual({
        LegacyExpand: {
            importedName: "Expand",
            replacementName: "Simplify",
            sourceValue: "type-fest",
        },
    });
};

describe(collectImportedTypeAliasMatches, () => {
    it("collects matching named imports and preserves module source", () => {
        expect.hasAssertions();

        assertCollectsMatchingNamedImports();
    });

    it("ignores non-import declarations, unsupported specifiers, and literal import names", () => {
        expect.hasAssertions();

        assertIgnoresUnsupportedDeclarationsAndSpecifiers();
    });

    it("matches replacement entries for representative alias combinations", () => {
        expect.hasAssertions();

        assertRepresentativeAliasCombinations();
    });
});
