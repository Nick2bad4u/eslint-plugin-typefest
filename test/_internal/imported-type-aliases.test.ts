/**
 * @packageDocumentation
 * Unit tests for imported-type-alias helper discovery and safe replacement
 * fixers.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";
import { describe, expect, it } from "vitest";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeReplacementFixPreservingReadonly,
    createSafeTypeNodeTextReplacementFix,
    createSafeTypeNodeTextReplacementFixPreservingReadonly,
    createSafeTypeReferenceReplacementFix,
} from "../../src/_internal/imported-type-aliases";

/** Imported names covered by alias replacement tests. */
type ImportedName = "Branded" | "Expand" | "HomomorphicOmit" | "Opaque";

/** Canonical replacement names expected for deprecated imported aliases. */
const replacementsByImportedName: Readonly<Record<ImportedName, string>> = {
    Branded: "Tagged",
    Expand: "Simplify",
    HomomorphicOmit: "Except",
    Opaque: "Tagged",
};

/** Build a minimal SourceCode-like test fixture containing only AST body. */
const createSourceCode = (
    body: Readonly<UnknownArray>
): Parameters<typeof collectImportedTypeAliasMatches>[0] =>
    ({
        ast: {
            body,
        },
    }) as unknown as Parameters<typeof collectImportedTypeAliasMatches>[0];

/** Convert map output to a plain object for stable assertions. */
const mapToRecord = <TValue>(
    map: Readonly<ReadonlyMap<string, TValue>>
): Readonly<Record<string, TValue>> => Object.fromEntries(map);

/** Create an identifier-based import specifier test node. */
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

/** Create a non-identifier import specifier for negative-path tests. */
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

/** Create an import declaration targeting the fixture source module. */
const createImportDeclaration = (
    specifiers: Readonly<UnknownArray>
): unknown => ({
    source: {
        value: "type-aliases",
    },
    specifiers,
    type: "ImportDeclaration",
});

const createNamespaceImportSpecifier = (localName: string): unknown => ({
    local: {
        name: localName,
    },
    type: "ImportNamespaceSpecifier",
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
        ...(parent === undefined ? {} : { parent }),
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
    sourceCode: Readonly<Parameters<typeof collectImportedTypeAliasMatches>[0]>,
    expectedSourceValue: string
) => ReadonlySet<string> = collectDirectNamedImportsFromSource;

const collectNamedImportLocalNamesFromSourceFn: (
    sourceCode: Readonly<Parameters<typeof collectImportedTypeAliasMatches>[0]>,
    expectedSourceValue: string,
    expectedImportedName: string
) => ReadonlySet<string> = collectNamedImportLocalNamesFromSource;

const collectNamespaceImportLocalNamesFromSourceFn: (
    sourceCode: Readonly<Parameters<typeof collectImportedTypeAliasMatches>[0]>,
    expectedSourceValue: string
) => ReadonlySet<string> = collectNamespaceImportLocalNamesFromSource;

const createSafeTypeReferenceReplacementFixFn: (
    node: Readonly<Parameters<typeof createSafeTypeReferenceReplacementFix>[0]>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeReferenceReplacementFix> =
    createSafeTypeReferenceReplacementFix;

const createSafeTypeNodeReplacementFixFn: (
    node: Readonly<Parameters<typeof createSafeTypeNodeTextReplacementFix>[0]>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFix> = (
    node,
    replacementName,
    availableReplacementNames
) =>
    createSafeTypeNodeTextReplacementFix(
        node,
        replacementName,
        replacementName,
        availableReplacementNames
    );

const createSafeTypeNodeTextReplacementFixFn: (
    node: Readonly<Parameters<typeof createSafeTypeNodeTextReplacementFix>[0]>,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFix> =
    createSafeTypeNodeTextReplacementFix;

const createSafeTypeNodeReplacementFixPreservingReadonlyFn: (
    node: Readonly<
        Parameters<typeof createSafeTypeNodeReplacementFixPreservingReadonly>[0]
    >,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeReplacementFixPreservingReadonly> =
    createSafeTypeNodeReplacementFixPreservingReadonly;

const createSafeTypeNodeTextReplacementFixPreservingReadonlyFn: (
    node: Readonly<
        Parameters<
            typeof createSafeTypeNodeTextReplacementFixPreservingReadonly
        >[0]
    >,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>
) => ReturnType<typeof createSafeTypeNodeTextReplacementFixPreservingReadonly> =
    createSafeTypeNodeTextReplacementFixPreservingReadonly;

const createTypeParameterDeclarationWithNames = (
    ...parameterNames: readonly string[]
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
): Parameters<typeof createSafeTypeNodeTextReplacementFix>[0] =>
    ({
        type: "TSStringKeyword",
        ...(parent === undefined ? {} : { parent }),
    }) as unknown as Parameters<typeof createSafeTypeNodeTextReplacementFix>[0];

const createReadonlyContainerTypeReferenceNode = (
    readonlyContainerTypeName: string
): Parameters<typeof createSafeTypeNodeTextReplacementFix>[0] =>
    ({
        type: "TSTypeReference",
        typeName: {
            name: readonlyContainerTypeName,
            type: "Identifier",
        },
    }) as unknown as Parameters<typeof createSafeTypeNodeTextReplacementFix>[0];

const createReadonlyTypeOperatorNode = (): Parameters<
    typeof createSafeTypeNodeTextReplacementFix
>[0] =>
    ({
        operator: "readonly",
        type: "TSTypeOperator",
        typeAnnotation: {
            elementType: {
                type: "TSUnknownKeyword",
            },
            type: "TSArrayType",
        },
    }) as unknown as Parameters<typeof createSafeTypeNodeTextReplacementFix>[0];

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

function collectNamedImportLocalNamesFromSourceGroup(): void {
    // no-op
}

describe(collectNamedImportLocalNamesFromSourceGroup, () => {
    it("collects local names for matching named imports including aliases", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Writable", "Writable"),
                createIdentifierImportSpecifier("Writable", "MutableAlias"),
                createIdentifierImportSpecifier("Other", "Other"),
            ]),
        ]);

        const localNames = collectNamedImportLocalNamesFromSourceFn(
            sourceCode,
            "type-aliases",
            "Writable"
        );

        expect(localNames).toStrictEqual(new Set(["MutableAlias", "Writable"]));
    });

    it("returns an empty set when no matching named imports exist", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createIdentifierImportSpecifier("Other", "Other"),
            ]),
        ]);

        const localNames = collectNamedImportLocalNamesFromSourceFn(
            sourceCode,
            "type-aliases",
            "Writable"
        );

        expect(localNames.size).toBe(0);
    });
});

function collectNamespaceImportLocalNamesFromSourceGroup(): void {
    // no-op
}

describe(collectNamespaceImportLocalNamesFromSourceGroup, () => {
    it("collects namespace import local names for the selected source", () => {
        expect.hasAssertions();

        const sourceCode = createSourceCode([
            createImportDeclaration([
                createNamespaceImportSpecifier("TypeFest"),
            ]),
            {
                source: {
                    value: "other-source",
                },
                specifiers: [createNamespaceImportSpecifier("OtherNamespace")],
                type: "ImportDeclaration",
            },
        ]);

        const localNames = collectNamespaceImportLocalNamesFromSourceFn(
            sourceCode,
            "type-aliases"
        );

        expect(localNames).toStrictEqual(new Set(["TypeFest"]));
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

    it("returns fixer when replacement name is not imported", () => {
        expect.hasAssertions();

        const node = createTypeReferenceNode("Expand");
        const fixer = createSafeTypeReferenceReplacementFixFn(
            node,
            "Simplify",
            new Set<string>()
        );

        expect(fixer).toBeTypeOf("function");
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

    it("inserts missing import after directive prologue when no imports are present", () => {
        expect.hasAssertions();

        const directiveStatement = {
            directive: "use client",
            expression: {
                type: "Literal",
                value: "use client",
            },
            range: [0, 12],
            type: "ExpressionStatement",
        };
        const firstStatement = {
            range: [13, 32],
            type: "TSTypeAliasDeclaration",
        };
        const programNode = {
            body: [directiveStatement, firstStatement],
            range: [0, 32],
            type: "Program",
        };

        const node = createTypeNode(programNode);
        const fix = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify<string>",
            new Set<string>()
        );

        expect(fix).toBeTypeOf("function");

        const insertAfterCalls: { target: unknown; text: string }[] = [];
        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fakeFixer = {
            insertTextAfter(target: unknown, text: string): string {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange(
                range: readonly [number, number],
                text: string
            ): string {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
            replaceText: (): string => "Simplify<string>",
        } as unknown as TSESLint.RuleFixer;

        fix?.(fakeFixer);

        expect(insertAfterCalls).toStrictEqual([
            {
                target: directiveStatement,
                text: '\nimport type { Simplify } from "type-fest";',
            },
        ]);
        expect(insertBeforeRangeCalls).toStrictEqual([]);
    });

    it("inserts missing import before first statement when file has no imports or directives", () => {
        expect.hasAssertions();

        const firstStatement = {
            range: [8, 28],
            type: "TSTypeAliasDeclaration",
        };
        const programNode = {
            body: [firstStatement],
            range: [0, 28],
            type: "Program",
        };

        const node = createTypeNode(programNode);
        const fix = createSafeTypeNodeTextReplacementFixFn(
            node,
            "Simplify",
            "Simplify<string>",
            new Set<string>()
        );

        expect(fix).toBeTypeOf("function");

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fakeFixer = {
            insertTextAfter: (): string => "",
            insertTextBeforeRange(
                range: readonly [number, number],
                text: string
            ): string {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
            replaceText: (): string => "Simplify<string>",
        } as unknown as TSESLint.RuleFixer;

        fix?.(fakeFixer);

        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [8, 8],
                text: 'import type { Simplify } from "type-fest";\n',
            },
        ]);
    });
});

function createSafeTypeNodeReplacementFixPreservingReadonlyGroup(): void {
    // no-op
}

describe(createSafeTypeNodeReplacementFixPreservingReadonlyGroup, () => {
    it("wraps replacement text in Readonly<> when the source node is an explicit readonly container reference", () => {
        expect.hasAssertions();

        const node = createReadonlyContainerTypeReferenceNode("ReadonlyMap");
        const fixer = createSafeTypeNodeReplacementFixPreservingReadonlyFn(
            node,
            "UnknownMap",
            new Set(["UnknownMap"])
        );

        expect(fixer).toBeTypeOf("function");

        const replacementTexts: string[] = [];
        const fakeFixer = {
            insertTextAfterRange: (): string => "",
            replaceText: (_targetNode: unknown, text: string): string => {
                replacementTexts.push(text);

                return text;
            },
        };

        const fixOutput = fixer?.(
            fakeFixer as unknown as Parameters<typeof fixer>[0]
        );

        expect(fixOutput).toBe("Readonly<UnknownMap>");
        expect(replacementTexts).toStrictEqual(["Readonly<UnknownMap>"]);
    });

    it("does not add Readonly<> for qualified readonly container references", () => {
        expect.hasAssertions();

        const node = createQualifiedTypeReferenceNode(
            "Collections",
            "ReadonlyMap"
        );
        const fixer = createSafeTypeNodeReplacementFixPreservingReadonlyFn(
            node,
            "UnknownMap",
            new Set(["UnknownMap"])
        );

        expect(fixer).toBeTypeOf("function");

        const replacementTexts: string[] = [];
        const fakeFixer = {
            insertTextAfterRange: (): string => "",
            replaceText: (_targetNode: unknown, text: string): string => {
                replacementTexts.push(text);

                return text;
            },
        };

        const fixOutput = fixer?.(
            fakeFixer as unknown as Parameters<typeof fixer>[0]
        );

        expect(fixOutput).toBe("UnknownMap");
        expect(replacementTexts).toStrictEqual(["UnknownMap"]);
    });
});

function createSafeTypeNodeTextReplacementFixPreservingReadonlyGroup(): void {
    // no-op
}

describe(createSafeTypeNodeTextReplacementFixPreservingReadonlyGroup, () => {
    it("keeps existing Readonly<> wrappers untouched to avoid double wrapping", () => {
        expect.hasAssertions();

        const node = createReadonlyTypeOperatorNode();
        const fixer = createSafeTypeNodeTextReplacementFixPreservingReadonlyFn(
            node,
            "UnknownArray",
            "Readonly<UnknownArray>",
            new Set(["UnknownArray"])
        );

        expect(fixer).toBeTypeOf("function");

        const replacementTexts: string[] = [];
        const fakeFixer = {
            insertTextAfterRange: (): string => "",
            replaceText: (_targetNode: unknown, text: string): string => {
                replacementTexts.push(text);

                return text;
            },
        };

        const fixOutput = fixer?.(
            fakeFixer as unknown as Parameters<typeof fixer>[0]
        );

        expect(fixOutput).toBe("Readonly<UnknownArray>");
        expect(replacementTexts).toStrictEqual(["Readonly<UnknownArray>"]);
    });
});
