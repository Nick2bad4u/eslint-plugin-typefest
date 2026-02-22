/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import { describe, expect, it } from "vitest";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeNodeReplacementFix,
    createSafeTypeNodeTextReplacementFix,
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

const createNonIdentifierImportSpecifier = (localName: string): unknown => ({
    imported: {
        type: "Literal",
        value: "Opaque",
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
    }) as unknown as Parameters<
        typeof createSafeTypeReferenceReplacementFix
    >[0];

const createQualifiedTypeReferenceNode = (
    leftName: string,
    rightName: string
): Parameters<typeof createSafeTypeReferenceReplacementFix>[0] =>
    ({
        type: "TSTypeReference",
        typeName: {
            left: {
                name: leftName,
                type: "Identifier",
            },
            right: {
                name: rightName,
                type: "Identifier",
            },
            type: "TSQualifiedName",
        },
    }) as unknown as Parameters<
        typeof createSafeTypeReferenceReplacementFix
    >[0];

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

const createSafeTypeNodeReplacementFixFn: (
    node: Parameters<typeof createSafeTypeNodeReplacementFix>[0],
    replacementName: string,
    availableReplacementNames: ReadonlySet<string>
) => ReturnType<typeof createSafeTypeNodeReplacementFix> =
    createSafeTypeNodeReplacementFix;

const createSafeTypeNodeTextReplacementFixFn: (
    node: Parameters<typeof createSafeTypeNodeTextReplacementFix>[0],
    replacementName: string,
    replacementText: string,
    availableReplacementNames: ReadonlySet<string>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFix> =
    createSafeTypeNodeTextReplacementFix;

const createTypeParameterDeclarationWithNames = (
    ...parameterNames: string[]
): {
    params: {
        name: {
            name: string;
        };
    }[];
    type: "TSTypeParameterDeclaration";
} => ({
    params: parameterNames.map((parameterName) => ({
        name: {
            name: parameterName,
        },
    })),
    type: "TSTypeParameterDeclaration",
});

const createTypeNode = (
    parent?: unknown
): Parameters<typeof createSafeTypeNodeReplacementFix>[0] =>
    ({
        type: "TSStringKeyword",
        ...(parent ? { parent } : {}),
    }) as unknown as Parameters<typeof createSafeTypeNodeReplacementFix>[0];

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

    it("ignores non-identifier imported specifiers and supports non-string import source values", () => {
        expect.hasAssertions();

        const result = collectImportedTypeAliasMatches(
            createSourceCode([
                {
                    source: {
                        value: 42,
                    },
                    specifiers: [
                        createNonIdentifierImportSpecifier("Opaque"),
                        createIdentifierImportSpecifier("Opaque", "Opaque"),
                    ],
                    type: "ImportDeclaration",
                },
            ]),
            replacementsByImportedName
        );

        expect(mapToRecord(result)).toStrictEqual({
            Opaque: {
                importedName: "Opaque",
                replacementName: "Tagged",
                sourceValue: "",
            },
        });
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

    it("ignores non-Identifier import specifiers for the selected source", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createNonIdentifierImportSpecifier("Tagged"),
                createIdentifierImportSpecifier("Tagged", "Tagged"),
            ]),
        ]);

        const namedImports = collectDirectNamedImportsFromSourceFn(
            sourceCode,
            "type-aliases"
        );

        expect(namedImports.has("Tagged")).toBeTruthy();
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

        expect(fixer).toBeTypeOf("function");
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

        const parameterDeclaration =
            createTypeParameterDeclarationWithNames("Simplify");

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

    it("returns null when replacement is shadowed by one of multiple type parameters", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Other",
            "Simplify",
            "Tail"
        );

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

    it("returns fixer when type parameters exist but replacement name is not shadowed", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Other",
            "Tail"
        );

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

        expect(fixer).toBeTypeOf("function");
    });

    it("returns null for qualified type references", () => {
        expect.hasAssertions();

        const node = createQualifiedTypeReferenceNode("TypeFest", "Opaque");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Tagged",
            new Set(["Tagged"])
        );

        expect(fixer).toBeNull();
    });
});

function createSafeTypeNodeReplacementFixGroup(): void {
    // no-op
}

describe(createSafeTypeNodeReplacementFixGroup, () => {
    it("returns null when replacement is shadowed for whole-node replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration =
            createTypeParameterDeclarationWithNames("Simplify");
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });

    it("returns fixer when replacement is available and not shadowed for whole-node replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Other",
            "Tail"
        );
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeReplacementFixFn(
            node,
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });
});

function createSafeTypeNodeTextReplacementFixGroup(): void {
    // no-op
}

describe(createSafeTypeNodeTextReplacementFixGroup, () => {
    it("returns null when replacement is shadowed for custom text replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration =
            createTypeParameterDeclarationWithNames("Simplify");
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify",
            new Set(["Simplify"])
        );

        expect(fixer).toBeNull();
    });

    it("returns fixer when replacement is available and not shadowed for custom text replacement", () => {
        expect.hasAssertions();

        const parameterDeclaration = createTypeParameterDeclarationWithNames(
            "Head",
            "Tail"
        );
        const node = createTypeNode({
            type: "TSTypeAliasDeclaration",
            typeParameters: parameterDeclaration,
        });

        const fixer = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify<Head>",
            new Set(["Simplify"])
        );

        expect(fixer).toBeTypeOf("function");
    });
});
