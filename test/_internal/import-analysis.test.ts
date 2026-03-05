/**
 * @packageDocumentation
 * Unit tests for shared import-analysis helpers.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import {
    collectNamedImportLocalNamesByImportedNameFromSource,
    collectNamedImportSpecifierBindingsFromSource,
} from "../../src/_internal/import-analysis";

const createImportDeclaration = (
    sourceModuleName: string,
    specifiers: readonly unknown[],
    importKind: "type" | "value" = "value"
): TSESTree.ImportDeclaration =>
    ({
        attributes: [],
        importKind,
        source: {
            raw: `"${sourceModuleName}"`,
            type: "Literal",
            value: sourceModuleName,
        },
        specifiers,
        type: "ImportDeclaration",
    }) as unknown as TSESTree.ImportDeclaration;

const createImportSpecifier = ({
    importedName,
    localName,
}: Readonly<{
    importedName: string;
    localName: string;
}>): TSESTree.ImportSpecifier =>
    ({
        imported: {
            name: importedName,
            type: "Identifier",
        },
        importKind: "value",
        local: {
            name: localName,
            type: "Identifier",
        },
        type: "ImportSpecifier",
    }) as unknown as TSESTree.ImportSpecifier;

const createSourceCode = (
    body: readonly Readonly<TSESTree.ProgramStatement>[]
): Readonly<TSESLint.SourceCode> =>
    ({
        ast: {
            body,
        },
    }) as unknown as Readonly<TSESLint.SourceCode>;

describe(collectNamedImportSpecifierBindingsFromSource, () => {
    it("collects named import bindings for a source module", () => {
        const sourceCode = createSourceCode([
            createImportDeclaration("ts-extras", [
                createImportSpecifier({
                    importedName: "arrayFirst",
                    localName: "arrayFirst",
                }),
                createImportSpecifier({
                    importedName: "arrayFirst",
                    localName: "arrayFirstAlias",
                }),
            ]),
        ]);

        const bindings = collectNamedImportSpecifierBindingsFromSource({
            sourceCode,
            sourceModuleName: "ts-extras",
        });

        expect(bindings).toHaveLength(2);
        expect(bindings[0]?.importedName).toBe("arrayFirst");
        expect(bindings[1]?.localName).toBe("arrayFirstAlias");
    });
});

describe(collectNamedImportLocalNamesByImportedNameFromSource, () => {
    it("groups local aliases by imported symbol name", () => {
        const sourceCode = createSourceCode([
            createImportDeclaration("ts-extras", [
                createImportSpecifier({
                    importedName: "arrayFirst",
                    localName: "arrayFirst",
                }),
                createImportSpecifier({
                    importedName: "arrayFirst",
                    localName: "arrayFirstAlias",
                }),
            ]),
        ]);

        const localNamesByImportedName =
            collectNamedImportLocalNamesByImportedNameFromSource({
                sourceCode,
                sourceModuleName: "ts-extras",
            });

        expect(localNamesByImportedName.get("arrayFirst")).toStrictEqual(
            new Set(["arrayFirst", "arrayFirstAlias"])
        );
    });

    it("recomputes fresh alias sets across calls even if prior results are mutated", () => {
        const sourceCode = createSourceCode([
            createImportDeclaration("ts-extras", [
                createImportSpecifier({
                    importedName: "arrayFirst",
                    localName: "arrayFirst",
                }),
            ]),
        ]);

        const firstResult =
            collectNamedImportLocalNamesByImportedNameFromSource({
                sourceCode,
                sourceModuleName: "ts-extras",
            });

        const mutableFirstAliases = firstResult.get("arrayFirst") as
            | Set<string>
            | undefined;

        mutableFirstAliases?.add("tamperedAlias");

        const secondResult =
            collectNamedImportLocalNamesByImportedNameFromSource({
                sourceCode,
                sourceModuleName: "ts-extras",
            });

        expect(secondResult.get("arrayFirst")).toStrictEqual(
            new Set(["arrayFirst"])
        );
    });
});
