/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { describe, expect, it } from "vitest";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../../src/_internal/imported-type-aliases";

type ImportedName = "Branded" | "Expand" | "HomomorphicOmit" | "Opaque";

const replacementsByImportedName: Readonly<Record<ImportedName, string>> = {
    Branded: "Tagged",
    Expand: "Simplify",
    HomomorphicOmit: "Except",
    Opaque: "Tagged",
};

const createSourceCode = (
    body: unknown[]
): Parameters<typeof collectImportedTypeAliasMatches>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<typeof collectImportedTypeAliasMatches>[0];

const mapToRecord = <TValue>(
    map: ReadonlyMap<string, TValue>
): Readonly<Record<string, TValue>> => Object.fromEntries(map);

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

const createImportDeclaration = (specifiers: unknown[]): unknown => ({
    source: {
        value: "type-aliases",
    },
    specifiers,
    type: "ImportDeclaration",
});

const createTypeReferenceNode = (
    referenceName: string,
    parent?: unknown
): Parameters<typeof createSafeTypeReferenceReplacementFix>[0] =>
    ({
        type: "TSTypeReference",
        typeName: {
            name: referenceName,
            type: "Identifier",
        },
        ...(parent ? { parent } : {}),
    }) as unknown as Parameters<typeof createSafeTypeReferenceReplacementFix>[0];

const collectDirectNamedImportsFromSourceFn: (
    sourceCode: Parameters<typeof collectImportedTypeAliasMatches>[0],
    expectedSourceValue: string
) => ReadonlySet<string> = collectDirectNamedImportsFromSource;

const createSafeTypeReferenceReplacementFixFn: (
    node: Parameters<typeof createSafeTypeReferenceReplacementFix>[0],
    replacementName: string,
    availableReplacementNames: ReadonlySet<string>
) => ReturnType<typeof createSafeTypeReferenceReplacementFix> =
    createSafeTypeReferenceReplacementFix;

describe(collectImportedTypeAliasMatches, () => {
    it("collects canonical named imports that are not renamed", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                createImportDeclaration([
                    createIdentifierImportSpecifier("Opaque", "Opaque"),
                    createIdentifierImportSpecifier("Expand", "Expand"),
                ]),
            ]),
            replacementsByImportedName
        );

        expect(mapToRecord(result)).toStrictEqual({
            Expand: {
                importedName: "Expand",
                replacementName: "Simplify",
                sourceValue: "type-aliases",
            },
            Opaque: {
                importedName: "Opaque",
                replacementName: "Tagged",
                sourceValue: "type-aliases",
            },
        });
    });

    it("ignores renamed imports to enforce canonical names", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                createImportDeclaration([
                    createIdentifierImportSpecifier("Opaque", "OpaqueAlias"),
                    createIdentifierImportSpecifier("Branded", "Branded"),
                ]),
            ]),
            replacementsByImportedName
        );

        expect(mapToRecord(result)).toStrictEqual({
            Branded: {
                importedName: "Branded",
                replacementName: "Tagged",
                sourceValue: "type-aliases",
            },
        });
    });

    it("returns an empty map for files without matching import declarations", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                {
                    type: "ExpressionStatement",
                },
            ]),
            replacementsByImportedName
        );

        expect(result.size).toBe(0);
    });
});

function collectDirectNamedImportsFromSourceGroup(): void {
    // no-op
}

describe(collectDirectNamedImportsFromSourceGroup, () => {
    it("collects only direct named imports from the selected source", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Simplify", "Simplify"),
                createIdentifierImportSpecifier("Expand", "ExpandAlias"),
            ]),
            {
                source: {
                    value: "other-source",
                },
                specifiers: [
                    createIdentifierImportSpecifier(
                        "ConditionalPick",
                        "ConditionalPick"
                    ),
                ],
                type: "ImportDeclaration",
            },
        ]);

        const namedImports = collectDirectNamedImportsFromSourceFn(
            sourceCode,
            "type-aliases"
        );

        expect(namedImports.has("Simplify")).toBeTruthy();
        expect(namedImports.size).toBe(1);
    });
});

function createSafeTypeReferenceReplacementFixGroup(): void {
    // no-op
}

describe(createSafeTypeReferenceReplacementFixGroup, () => {
    it("returns fixer when replacement name is directly imported and not shadowed", () => {
        expect.hasAssertions();

        const node = createTypeReferenceNode("Expand");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeDefined();
    });

    it("returns null when replacement name is not imported", () => {
        expect.hasAssertions();

        const node = createTypeReferenceNode("Expand");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set<string>()
        );

        expect(fixer).toBeNull();
    });

    it("returns null when replacement is shadowed by a type parameter", () => {
        expect.hasAssertions();

        const parameterDeclaration = {
            params: [
                {
                    name: {
                        name: "Simplify",
                    },
                },
            ],
            type: "TSTypeParameterDeclaration",
        };

        const parent = {
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        };

        const node = createTypeReferenceNode("Expand", parent);
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });
});
