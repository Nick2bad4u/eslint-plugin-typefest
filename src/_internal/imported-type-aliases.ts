/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type { TSESLint } from "@typescript-eslint/utils";

export type ImportedTypeAliasMatch = {
    importedName: string;
    replacementName: string;
    sourceValue: string;
};

/**
 * Collects imported type alias local names that should be replaced by canonical
 * type-fest utility names.
 */
export const collectImportedTypeAliasMatches = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    replacementsByImportedName: Readonly<Record<string, string>>
): ReadonlyMap<string, ImportedTypeAliasMatch> => {
    const aliasMatches = new Map<string, ImportedTypeAliasMatch>();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        const sourceValue =
            typeof statement.source.value === "string"
                ? statement.source.value
                : "";

        for (const specifier of statement.specifiers) {
            if (specifier.type !== "ImportSpecifier") {
                continue;
            }

            if (specifier.imported.type !== "Identifier") {
                continue;
            }

            const replacementName =
                replacementsByImportedName[specifier.imported.name];
            if (!replacementName) {
                continue;
            }

            aliasMatches.set(specifier.local.name, {
                importedName: specifier.imported.name,
                replacementName,
                sourceValue,
            });
        }
    }

    return aliasMatches;
};
