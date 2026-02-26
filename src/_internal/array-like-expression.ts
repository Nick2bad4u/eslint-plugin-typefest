import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

/**
 * Determines how union member types are evaluated for array-likeness.
 */
export type UnionArrayLikeMatchMode = "every" | "some";

interface ArrayLikeExpressionCheckerOptions {
    /**
     * TypeScript checker instance used for type resolution.
     */
    readonly checker: ts.TypeChecker;

    /**
     * Parser services map for converting ESTree nodes to TypeScript nodes.
     */
    readonly parserServices: {
        readonly esTreeNodeToTSNodeMap: {
            readonly get: (key: Readonly<TSESTree.Node>) => ts.Node | undefined;
        };
    };

    /**
     * How union members should be matched.
     *
     * @default "some"
     */
    readonly unionMatchMode?: UnionArrayLikeMatchMode;
}

type TypeCheckerWithArrayHelpers = ts.TypeChecker & {
    getBaseConstraintOfType?: (
        candidateType: Readonly<ts.Type>
    ) => ts.Type | undefined;
    isArrayType?: (candidateType: Readonly<ts.Type>) => boolean;
    isTupleType?: (candidateType: Readonly<ts.Type>) => boolean;
};

/**
 * IsArrayLikeType helper.
 *
 * @param checker - Value to inspect.
 * @param type - Value to inspect.
 * @param unionMatchMode - Value to inspect.
 *
 * @returns IsArrayLikeType helper result.
 */
export const isArrayLikeType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>,
    unionMatchMode: UnionArrayLikeMatchMode = "some"
): boolean => {
    const typedChecker = checker as TypeCheckerWithArrayHelpers;
    const seenTypes = new Set<ts.Type>();

    const isArrayLikeTypeInternal = (
        candidateType: Readonly<ts.Type>
    ): boolean => {
        if (seenTypes.has(candidateType)) {
            return false;
        }

        seenTypes.add(candidateType);

        if (
            typedChecker.isArrayType?.(candidateType) ||
            typedChecker.isTupleType?.(candidateType)
        ) {
            return true;
        }

        if (candidateType.isUnion()) {
            return unionMatchMode === "every"
                ? candidateType.types.every((partType) =>
                      isArrayLikeTypeInternal(partType)
                  )
                : candidateType.types.some((partType) =>
                      isArrayLikeTypeInternal(partType)
                  );
        }

        if (candidateType.isIntersection()) {
            return candidateType.types.some((partType) =>
                isArrayLikeTypeInternal(partType)
            );
        }

        const baseConstraint =
            typedChecker.getBaseConstraintOfType?.(candidateType);
        if (
            baseConstraint !== undefined &&
            baseConstraint !== candidateType &&
            isArrayLikeTypeInternal(baseConstraint)
        ) {
            return true;
        }

        const apparentType = checker.getApparentType(candidateType);
        if (apparentType !== candidateType) {
            return isArrayLikeTypeInternal(apparentType);
        }

        return false;
    };

    return isArrayLikeTypeInternal(type);
};

/**
 * CreateIsArrayLikeExpressionChecker helper.
 *
 * @param options - Value to inspect.
 *
 * @returns CreateIsArrayLikeExpressionChecker helper result.
 */
export const createIsArrayLikeExpressionChecker =
    ({
        checker,
        parserServices,
        unionMatchMode = "some",
    }: Readonly<ArrayLikeExpressionCheckerOptions>) =>
    (expression: Readonly<TSESTree.Expression>): boolean => {
        try {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(expression);

            if (!tsNode) {
                return false;
            }

            const expressionType = checker.getTypeAtLocation(tsNode);

            return isArrayLikeType(checker, expressionType, unionMatchMode);
        } catch {
            return false;
        }
    };

/**
 * IsWriteTargetMemberExpression helper.
 *
 * @param node - Value to inspect.
 *
 * @returns IsWriteTargetMemberExpression helper result.
 */
export const isWriteTargetMemberExpression = (
    node: Readonly<TSESTree.MemberExpression>
): boolean => {
    const parentNode = node.parent;

    return parentNode.type === "AssignmentExpression"
        ? parentNode.left === node
        : parentNode.type === "UnaryExpression"
          ? parentNode.operator === "delete"
          : parentNode.type === "UpdateExpression";
};
