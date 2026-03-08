/**
 * @packageDocumentation
 * Resolve constrained TypeScript types from ESTree nodes with resilient
 * fallbacks for partially mocked parser-services in tests.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import { isDefined, safeCastTo } from "ts-extras";

import { safeTypeOperation } from "./safe-type-operation.js";
import { getTypeCheckerBaseConstraintType } from "./type-checker-compat.js";

type ConstrainedTypeParserServices = Readonly<{
    esTreeNodeToTSNodeMap: Readonly<{
        get: (key: Readonly<TSESTree.Node>) => ts.Node | undefined;
    }>;
    getTypeAtLocation?: (
        node: Readonly<TSESTree.Node>
    ) => Readonly<ts.Type> | ts.Type;
    program?: null | Readonly<{
        getTypeChecker: () => ts.TypeChecker;
    }>;
}>;

/**
 * Resolve a node type using `getConstrainedTypeAtLocation` when available, then
 * fall back to checker + node-map based resolution.
 *
 * @param checker - Type checker used for fallback type lookups.
 * @param node - ESTree node whose type should be resolved.
 * @param parserServices - Parser services with node mapping and optional typed
 *   helpers.
 * @param reason - Stable diagnostics reason fragment for safe-type wrappers.
 *
 * @returns The constrained type when resolvable; otherwise `undefined`.
 */
export const getConstrainedTypeAtLocationWithFallback = ({
    checker,
    node,
    parserServices,
    reason,
}: Readonly<{
    checker: Readonly<ts.TypeChecker>;
    node: Readonly<TSESTree.Node>;
    parserServices: ConstrainedTypeParserServices;
    reason: string;
}>): ts.Type | undefined => {
    const constrainedTypeResult = safeTypeOperation({
        operation: () => {
            if (
                typeof parserServices.getTypeAtLocation !== "function" ||
                !isDefined(parserServices.program)
            ) {
                return;
            }

            return getConstrainedTypeAtLocation(
                parserServices as Parameters<
                    typeof getConstrainedTypeAtLocation
                >[0],
                safeCastTo<Parameters<typeof getConstrainedTypeAtLocation>[1]>(
                    node
                )
            );
        },
        reason: `${reason}-constrained`,
    });

    if (constrainedTypeResult.ok && isDefined(constrainedTypeResult.value)) {
        return constrainedTypeResult.value;
    }

    const fallbackTypeResult = safeTypeOperation({
        operation: () => {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

            if (!isDefined(tsNode)) {
                return;
            }

            const rawType = checker.getTypeAtLocation(tsNode);
            const constrainedType = getTypeCheckerBaseConstraintType(
                checker,
                rawType
            );

            return constrainedType ?? rawType;
        },
        reason: `${reason}-fallback`,
    });

    if (!fallbackTypeResult.ok) {
        return undefined;
    }

    return fallbackTypeResult.value;
};
