/**
 * @packageDocumentation
 * Shared import-insertion coordination used by import-aware replacement fixers.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getProgramNode } from "./ast-node.js";
import { isImportInsertionFixesDisabledForNode } from "./plugin-settings.js";

/**
 * Delivery channel for a report fix callback.
 *
 * @remarks
 * - `autofix`: fix supplied through `context.report({ fix })` and coordinated so
 *   only one report emits a specific import insertion per file/lint pass.
 * - `suggestion`: fix supplied through `context.report({ suggest })`; each
 *   suggestion remains self-contained and therefore keeps import insertion.
 */
export type ImportFixIntent = "autofix" | "suggestion";

/** Internal classification for coordinated import insertion keys. */
type ImportBindingKind = "type" | "value";

/** Claimed import-insertion keys for one Program node. */
type ProgramImportClaims = Set<string>;

/** Program-scoped claimed import keys cache. */
const claimedImportKeysByProgram = new WeakMap<
    Readonly<TSESTree.Program>,
    ProgramImportClaims
>();

/**
 * Build a deterministic coordination key for one import binding.
 */
const createImportCoordinationKey = ({
    importBindingKind,
    importedName,
    sourceModuleName,
}: Readonly<{
    importBindingKind: ImportBindingKind;
    importedName: string;
    sourceModuleName: string;
}>): string =>
    `${importBindingKind}\u0000${sourceModuleName}\u0000${importedName}`;

/**
 * Decide whether a report fix callback should include import insertion.
 *
 * @remarks
 * This decision is made during fixer construction (AST traversal) to keep
 * behavior deterministic across repeated fix callback evaluation.
 */
export const shouldIncludeImportInsertionForReportFix = ({
    importBindingKind,
    importedName,
    referenceNode,
    reportFixIntent,
    sourceModuleName,
}: Readonly<{
    importBindingKind: ImportBindingKind;
    importedName: string;
    referenceNode: Readonly<TSESTree.Node>;
    reportFixIntent: ImportFixIntent;
    sourceModuleName: string;
}>): boolean => {
    if (reportFixIntent === "suggestion") {
        return true;
    }

    if (isImportInsertionFixesDisabledForNode(referenceNode)) {
        return true;
    }

    const programNode = getProgramNode(referenceNode);
    if (!programNode) {
        return true;
    }

    const coordinationKey = createImportCoordinationKey({
        importBindingKind,
        importedName,
        sourceModuleName,
    });

    const claimedImportKeys = claimedImportKeysByProgram.get(programNode);
    if (claimedImportKeys?.has(coordinationKey) === true) {
        return false;
    }

    if (claimedImportKeys === undefined) {
        claimedImportKeysByProgram.set(programNode, new Set([coordinationKey]));

        return true;
    }

    claimedImportKeys.add(coordinationKey);

    return true;
};
