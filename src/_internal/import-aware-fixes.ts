/**
 * @packageDocumentation
 * Shared composition helpers for import-aware report fix callbacks.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import type { ImportInsertionDecision } from "./import-fix-coordinator.js";

/**
 * Build replacement/import fixer arrays according to an import-insertion
 * coordination decision.
 *
 * @param options - Replacement and optional import-fix factories with the
 *   import-insertion decision for this report callback.
 *
 * @returns Ordered fix array (`import`, then `replacement`) when applicable;
 *   otherwise `null` when the fix must be suppressed.
 */
export const createImportAwareFixes = ({
    createImportFix,
    createReplacementFix,
    fixer,
    importInsertionDecision,
    requiresImportInsertion,
}: Readonly<{
    createImportFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => null | TSESLint.RuleFix;
    createReplacementFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => TSESLint.RuleFix;
    fixer: Readonly<TSESLint.RuleFixer>;
    importInsertionDecision: ImportInsertionDecision;
    requiresImportInsertion: boolean;
}>): null | readonly TSESLint.RuleFix[] => {
    const replacementFix = createReplacementFix(fixer);

    if (!requiresImportInsertion) {
        return [replacementFix];
    }

    if (!importInsertionDecision.shouldIncludeImportInsertionFix) {
        return importInsertionDecision.allowReplacementWithoutImportInsertion
            ? [replacementFix]
            : null;
    }

    const importFix = createImportFix(fixer);
    if (importFix === null) {
        return null;
    }

    return [importFix, replacementFix];
};
