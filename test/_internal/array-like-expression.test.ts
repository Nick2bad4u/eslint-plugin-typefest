import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import { describe, expect, it, vi } from "vitest";

import {
    createIsArrayLikeExpressionChecker,
    isArrayLikeType,
    isWriteTargetMemberExpression,
} from "../../src/_internal/array-like-expression";

/**
 * Create a lightweight mock `ts.Type` with configurable union/intersection
 * traits.
 */
const createFakeType = ({
    isIntersection = false,
    isUnion = false,
    types = [],
}: Readonly<{
    isIntersection?: boolean;
    isUnion?: boolean;
    types?: readonly ts.Type[];
}>): ts.Type =>
    ({
        isIntersection: () => isIntersection,
        isUnion: () => isUnion,
        types,
    }) as unknown as ts.Type;

/**
 * Build a focused `ts.TypeChecker` stub for array-like detection test branches.
 */
const createChecker = ({
    apparentTypeByType,
    baseConstraintByType,
    expressionType,
    isArrayType,
    isTupleType,
}: Readonly<{
    apparentTypeByType?: ReadonlyMap<ts.Type, ts.Type>;
    baseConstraintByType?: ReadonlyMap<ts.Type, ts.Type>;
    expressionType?: ts.Type;
    isArrayType?: (candidateType: Readonly<ts.Type>) => boolean;
    isTupleType?: (candidateType: Readonly<ts.Type>) => boolean;
}> = {}): ts.TypeChecker => {
    const fallbackType = createFakeType({});

    return {
        getApparentType: (candidateType: Readonly<ts.Type>) =>
            apparentTypeByType?.get(candidateType) ?? candidateType,
        getBaseConstraintOfType: (candidateType: Readonly<ts.Type>) =>
            baseConstraintByType?.get(candidateType),
        getTypeAtLocation: () => expressionType ?? fallbackType,
        isArrayType: (candidateType: Readonly<ts.Type>) =>
            isArrayType?.(candidateType) ?? false,
        isTupleType: (candidateType: Readonly<ts.Type>) =>
            isTupleType?.(candidateType) ?? false,
    } as unknown as ts.TypeChecker;
};

describe(isArrayLikeType, () => {
    it("returns true for direct array-like types", () => {
        expect.hasAssertions();

        const arrayType = createFakeType({});
        const checker = createChecker({
            isArrayType: (candidateType) => candidateType === arrayType,
        });

        expect(isArrayLikeType(checker, arrayType)).toBeTruthy();
    });

    it("supports union match modes for mixed unions", () => {
        expect.hasAssertions();

        const arrayType = createFakeType({});
        const scalarType = createFakeType({});
        const mixedUnion = createFakeType({
            isUnion: true,
            types: [arrayType, scalarType],
        });

        const checker = createChecker({
            isArrayType: (candidateType) => candidateType === arrayType,
        });

        expect(isArrayLikeType(checker, mixedUnion, "some")).toBeTruthy();
        expect(isArrayLikeType(checker, mixedUnion, "every")).toBeFalsy();
    });

    it("returns true when an intersection contains at least one array-like type", () => {
        expect.hasAssertions();

        const arrayType = createFakeType({});
        const scalarType = createFakeType({});
        const intersectionType = createFakeType({
            isIntersection: true,
            types: [scalarType, arrayType],
        });

        const checker = createChecker({
            isArrayType: (candidateType) => candidateType === arrayType,
        });

        expect(isArrayLikeType(checker, intersectionType)).toBeTruthy();
    });

    it("follows base constraints when available", () => {
        expect.hasAssertions();

        const constrainedType = createFakeType({});
        const arrayConstraint = createFakeType({});

        const checker = createChecker({
            baseConstraintByType: new Map([[constrainedType, arrayConstraint]]),
            isArrayType: (candidateType) => candidateType === arrayConstraint,
        });

        expect(isArrayLikeType(checker, constrainedType)).toBeTruthy();
    });

    it("falls back to apparent type resolution", () => {
        expect.hasAssertions();

        const sourceType = createFakeType({});
        const apparentArrayType = createFakeType({});

        const checker = createChecker({
            apparentTypeByType: new Map([[sourceType, apparentArrayType]]),
            isArrayType: (candidateType) => candidateType === apparentArrayType,
        });

        expect(isArrayLikeType(checker, sourceType)).toBeTruthy();
    });

    it("stops recursion when revisiting the same type", () => {
        expect.hasAssertions();

        const recursiveUnionType = createFakeType({ isUnion: true });

        (
            recursiveUnionType as unknown as {
                types: readonly ts.Type[];
            }
        ).types = [recursiveUnionType];

        const checker = createChecker();

        expect(isArrayLikeType(checker, recursiveUnionType)).toBeFalsy();
    });
});

describe(createIsArrayLikeExpressionChecker, () => {
    const expression = {
        type: "Identifier",
    } as unknown as TSESTree.Expression;

    it("returns false when parser services cannot map the expression", () => {
        expect.hasAssertions();

        const checker = createChecker();
        const isArrayLikeExpression = createIsArrayLikeExpressionChecker({
            checker,
            parserServices: {
                esTreeNodeToTSNodeMap: {
                    get: () => undefined,
                },
            },
        });

        expect(isArrayLikeExpression(expression)).toBeFalsy();
    });

    it("returns false when checker.getTypeAtLocation throws", () => {
        expect.hasAssertions();

        const checker = {
            getApparentType: (candidateType: Readonly<ts.Type>) =>
                candidateType,
            getTypeAtLocation: () => {
                throw new Error("type lookup failed");
            },
            isArrayType: () => false,
            isTupleType: () => false,
        } as unknown as ts.TypeChecker;

        const tsNode = {} as ts.Node;

        const isArrayLikeExpression = createIsArrayLikeExpressionChecker({
            checker,
            parserServices: {
                esTreeNodeToTSNodeMap: {
                    get: () => tsNode,
                },
            },
        });

        expect(isArrayLikeExpression(expression)).toBeFalsy();
    });

    it("returns true for mapped array-like expression types", () => {
        expect.hasAssertions();

        const arrayType = createFakeType({});
        const checker = createChecker({
            expressionType: arrayType,
            isArrayType: (candidateType) => candidateType === arrayType,
        });

        const tsNode = {} as ts.Node;

        const isArrayLikeExpression = createIsArrayLikeExpressionChecker({
            checker,
            parserServices: {
                esTreeNodeToTSNodeMap: {
                    get: () => tsNode,
                },
            },
        });

        expect(isArrayLikeExpression(expression)).toBeTruthy();
    });

    it("memoizes array-like type resolution across repeated expression checks", () => {
        expect.hasAssertions();

        const arrayType = createFakeType({});
        const isArrayType = vi.fn<
            (candidateType: Readonly<ts.Type>) => boolean
        >((candidateType: Readonly<ts.Type>) => candidateType === arrayType);
        const checker = createChecker({
            expressionType: arrayType,
            isArrayType,
        });

        const tsNode = {} as ts.Node;

        const isArrayLikeExpression = createIsArrayLikeExpressionChecker({
            checker,
            parserServices: {
                esTreeNodeToTSNodeMap: {
                    get: () => tsNode,
                },
            },
        });

        expect(isArrayLikeExpression(expression)).toBeTruthy();
        expect(isArrayLikeExpression(expression)).toBeTruthy();
        expect(isArrayType).toHaveBeenCalledOnce();
    });
});

describe(isWriteTargetMemberExpression, () => {
    const createMemberExpressionNode = (): TSESTree.MemberExpression =>
        ({
            computed: false,
            object: {
                name: "value",
                type: "Identifier",
            },
            optional: false,
            property: {
                name: "length",
                type: "Identifier",
            },
            type: "MemberExpression",
        }) as unknown as TSESTree.MemberExpression;

    it("returns false when the node has no parent", () => {
        expect.hasAssertions();
        expect(
            isWriteTargetMemberExpression(createMemberExpressionNode())
        ).toBeFalsy();
    });

    it("returns true only for assignment left-hand targets", () => {
        expect.hasAssertions();

        const memberNode = createMemberExpressionNode();
        const assignmentParent = {
            left: memberNode,
            operator: "=",
            right: {
                type: "Literal",
                value: 1,
            },
            type: "AssignmentExpression",
        } as unknown as TSESTree.AssignmentExpression;

        (memberNode as unknown as { parent?: TSESTree.Node }).parent =
            assignmentParent;

        expect(isWriteTargetMemberExpression(memberNode)).toBeTruthy();

        const nonTargetMemberNode = createMemberExpressionNode();
        const nonTargetAssignmentParent = {
            left: {
                name: "other",
                type: "Identifier",
            },
            operator: "=",
            right: nonTargetMemberNode,
            type: "AssignmentExpression",
        } as unknown as TSESTree.AssignmentExpression;

        (
            nonTargetMemberNode as unknown as {
                parent?: TSESTree.Node;
            }
        ).parent = nonTargetAssignmentParent;

        expect(isWriteTargetMemberExpression(nonTargetMemberNode)).toBeFalsy();
    });

    it("returns true for delete targets and false for other unary operators", () => {
        expect.hasAssertions();

        const deleteTargetNode = createMemberExpressionNode();
        const deleteParent = {
            argument: deleteTargetNode,
            operator: "delete",
            prefix: true,
            type: "UnaryExpression",
        } as unknown as TSESTree.UnaryExpression;

        (deleteTargetNode as unknown as { parent?: TSESTree.Node }).parent =
            deleteParent;

        expect(isWriteTargetMemberExpression(deleteTargetNode)).toBeTruthy();

        const plusUnaryNode = createMemberExpressionNode();
        const plusUnaryParent = {
            argument: plusUnaryNode,
            operator: "+",
            prefix: true,
            type: "UnaryExpression",
        } as unknown as TSESTree.UnaryExpression;

        (plusUnaryNode as unknown as { parent?: TSESTree.Node }).parent =
            plusUnaryParent;

        expect(isWriteTargetMemberExpression(plusUnaryNode)).toBeFalsy();
    });

    it("returns true only when used as the update expression argument", () => {
        expect.hasAssertions();

        const updateTargetNode = createMemberExpressionNode();
        const updateParent = {
            argument: updateTargetNode,
            operator: "++",
            prefix: false,
            type: "UpdateExpression",
        } as unknown as TSESTree.UpdateExpression;

        (updateTargetNode as unknown as { parent?: TSESTree.Node }).parent =
            updateParent;

        expect(isWriteTargetMemberExpression(updateTargetNode)).toBeTruthy();

        const nonTargetUpdateNode = createMemberExpressionNode();
        const nonTargetUpdateParent = {
            argument: {
                name: "other",
                type: "Identifier",
            },
            operator: "--",
            prefix: true,
            type: "UpdateExpression",
        } as unknown as TSESTree.UpdateExpression;

        (
            nonTargetUpdateNode as unknown as {
                parent?: TSESTree.Node;
            }
        ).parent = nonTargetUpdateParent;

        expect(isWriteTargetMemberExpression(nonTargetUpdateNode)).toBeFalsy();
    });
});
