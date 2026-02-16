import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { collectImportedTypeAliasMatches } from "../../src/_internal/imported-type-aliases";

interface ImportedAliasRecord {
    importedName: ImportedName;
    localIndex: number;
}

const importedNames = [
        "Branded",
        "Expand",
        "HomomorphicOmit",
        "Opaque",
    ] as const,
    replacementsByImportedName: Readonly<Record<ImportedName, string>> = {
        Branded: "Tagged",
        Expand: "Simplify",
        HomomorphicOmit: "Except",
        Opaque: "Tagged",
    };

type ImportedName = (typeof importedNames)[number];

const createSourceCode = (
    body: unknown[]
): Parameters<typeof collectImportedTypeAliasMatches>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<typeof collectImportedTypeAliasMatches>[0];

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

const createImportDeclaration = (specifiers: unknown[]): unknown => ({
    source: {
        value: "type-fest",
    },
    specifiers,
    type: "ImportDeclaration",
});

const mapToRecord = <TValue>(
    map: ReadonlyMap<string, TValue>
): Readonly<Record<string, TValue>> => Object.fromEntries(map);

const buildExpectedMatches = (
    records: readonly ImportedAliasRecord[]
): ReadonlyMap<string, { importedName: string; replacementName: string; sourceValue: string }> => {
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

const assertArbitraryAliasProperty = (): void => {
    fc.assert(
        fc.property(
            fc.array(
                fc.record({
                    importedName: fc.constantFrom(...importedNames),
                    localIndex: fc.integer({ max: 8, min: 0 }),
                }),
                { maxLength: 16, minLength: 1 }
            ),
            (records) => {
                const actual = collectMatchesFromAliasRecords(records);
                const expected = buildExpectedMatches(records);

                expect(mapToRecord(actual)).toStrictEqual(mapToRecord(expected));
            }
        )
    );
};

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

describe("collectImportedTypeAliasMatches", () => {
    it("collects matching named imports and preserves module source", () => {
        assertCollectsMatchingNamedImports();
    });

    it("ignores non-import declarations, unsupported specifiers, and literal import names", () => {
        assertIgnoresUnsupportedDeclarationsAndSpecifiers();
    });

    it("matches replacement entries for arbitrary alias imports", () => {
        assertArbitraryAliasProperty();
    });
});
