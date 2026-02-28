/**
 * @packageDocumentation
 * Helpers for determining whether expressions/types are array-like in typed
 * rule analysis.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

/**
 * Shared inputs required to evaluate whether an ESTree expression is array-like
 * using TypeScript type information.
 */
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

/**
 * TypeChecker shape with optional helper APIs available across TypeScript
 * versions.
 */
type TypeCheckerWithArrayHelpers = ts.TypeChecker & {
    getBaseConstraintOfType?: (
        candidateType: Readonly<ts.Type>
    ) => ts.Type | undefined;
    isArrayType?: (candidateType: Readonly<ts.Type>) => boolean;
    isTupleType?: (candidateType: Readonly<ts.Type>) => boolean;
};

/**
 * Determines how union member types are evaluated for array-likeness.
 */
type UnionArrayLikeMatchMode = "every" | "some";

/**
 * Determine whether a TypeScript type resolves to an array-like shape.
 *
 * @param checker - Type checker used to inspect and unwrap candidate types.
 * @param type - Candidate type to evaluate.
 * @param unionMatchMode - Strategy for union members (`"some"` or `"every"`).
 *
 * @returns `true` when the candidate resolves to an array/tuple-like type.
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
 * Build a safe ESTree expression predicate for array-like type checks.
 *
 * @param options - Type checker and parser-service dependencies.
 *
 * @returns Function that returns `true` when the expression is array-like.
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
 * Check whether a member expression is used as a write target.
 *
 * @param node - Member expression candidate.
 *
 * @returns `true` for assignment LHS, `delete` target, or update operand.
 */
export const isWriteTargetMemberExpression = (
    node: Readonly<TSESTree.MemberExpression>
): boolean => {
    const nodeWithParent = node as Readonly<TSESTree.MemberExpression> & {
        parent?: Readonly<TSESTree.Node>;
    };
    const parentNode = nodeWithParent.parent;

    if (parentNode === undefined) {
        return false;
    }

    if (parentNode.type === "AssignmentExpression") {
        return parentNode.left === node;
    }

    if (parentNode.type === "UnaryExpression") {
        return parentNode.operator === "delete";
    }

    if (parentNode.type === "UpdateExpression") {
        return parentNode.argument === node;
    }

    return false;
};
