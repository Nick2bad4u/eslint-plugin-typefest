import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";

import {
    areEquivalentExpressions,
    areEquivalentTypeNodes,
} from "../../src/_internal/normalize-expression-text";

/** Parse an expression and return the initializer from `const value = ...`. */
const getInitializerExpression = (
    expressionText: string
): TSESTree.Expression => {
    const parsedResult = parser.parseForESLint(
        `const value = ${expressionText};`,
        {
            ecmaVersion: "latest",
            sourceType: "module",
        }
    );

    const firstStatement = parsedResult.ast.body[0];
    if (firstStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
        throw new Error(
            "Expected first statement to be a variable declaration"
        );
    }

    const declarator = firstStatement.declarations[0];
    if (!declarator?.init) {
        throw new Error("Expected variable declarator initializer");
    }

    return declarator.init;
};

/** Parse a `type Value = ...` declaration and return its type annotation node. */
const getAliasTypeAnnotation = (annotationText: string): TSESTree.TypeNode => {
    const parsedResult = parser.parseForESLint(
        `type Value = ${annotationText};`,
        {
            ecmaVersion: "latest",
            sourceType: "module",
        }
    );

    const firstStatement = parsedResult.ast.body[0];
    if (firstStatement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration) {
        throw new Error("Expected first statement to be a type alias");
    }

    return firstStatement.typeAnnotation;
};

describe(areEquivalentExpressions, () => {
    it("treats identical expressions as equivalent", () => {
        expect.hasAssertions();

        const left = getInitializerExpression("user.profile.id");
        const right = getInitializerExpression("user.profile.id");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });

    it("treats different expressions as non-equivalent", () => {
        expect.hasAssertions();

        const left = getInitializerExpression("user.profile.id");
        const right = getInitializerExpression("user.profile.name");

        expect(areEquivalentExpressions(left, right)).toBeFalsy();
    });

    it("unwraps TS assertion wrappers for equivalence", () => {
        expect.hasAssertions();

        const left = getInitializerExpression("value as string");
        const right = getInitializerExpression("value");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });

    it("unwraps non-null and satisfies wrappers for equivalence", () => {
        expect.hasAssertions();

        const left = getInitializerExpression("value!");
        const right = getInitializerExpression("value satisfies unknown");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });

    it("unwraps TypeScript angle-bracket assertions for equivalence", () => {
        expect.hasAssertions();

        const left = getInitializerExpression("<string>value");
        const right = getInitializerExpression("value");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });

    it("handles cyclic wrapper expressions without infinite recursion", () => {
        expect.hasAssertions();

        const cyclicAsExpression = {
            expression: undefined,
            type: AST_NODE_TYPES.TSAsExpression,
        } as unknown as TSESTree.TSAsExpression;

        (
            cyclicAsExpression as unknown as {
                expression: TSESTree.Expression;
            }
        ).expression = cyclicAsExpression;

        const plainIdentifier = getInitializerExpression("value");

        expect(
            areEquivalentExpressions(
                cyclicAsExpression as unknown as TSESTree.Expression,
                plainIdentifier
            )
        ).toBeFalsy();
    });
});

describe(areEquivalentTypeNodes, () => {
    it("treats equivalent type nodes as equivalent", () => {
        expect.hasAssertions();

        const left = getAliasTypeAnnotation("Readonly<{ alpha: string }>");
        const right = getAliasTypeAnnotation("Readonly<{ alpha: string }>");

        expect(areEquivalentTypeNodes(left, right)).toBeTruthy();
    });

    it("treats different type nodes as non-equivalent", () => {
        expect.hasAssertions();

        const left = getAliasTypeAnnotation("Readonly<{ alpha: string }>");
        const right = getAliasTypeAnnotation("Readonly<{ beta: string }>");

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false for array-vs-non-array structures", () => {
        expect.hasAssertions();

        const left = ["alpha"] as unknown as TSESTree.TypeNode;
        const right = { alpha: true } as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false when compared values have mismatched runtime types", () => {
        expect.hasAssertions();

        const left = 42 as unknown as TSESTree.TypeNode;
        const right = "42" as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false when one side is null", () => {
        expect.hasAssertions();

        const left = null as unknown as TSESTree.TypeNode;
        const right = { alpha: true } as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false for arrays with different lengths", () => {
        expect.hasAssertions();

        const left = ["alpha"] as unknown as TSESTree.TypeNode;
        const right = ["alpha", "beta"] as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false for non-comparable primitive-like values", () => {
        expect.hasAssertions();

        const left = 1 as unknown as TSESTree.TypeNode;
        const right = 2 as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false for object nodes with different comparable key counts", () => {
        expect.hasAssertions();

        const left = { alpha: 1, beta: 2 } as unknown as TSESTree.TypeNode;
        const right = { alpha: 1 } as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("returns false for object nodes with different comparable key names", () => {
        expect.hasAssertions();

        const left = { alpha: 1 } as unknown as TSESTree.TypeNode;
        const right = { beta: 1 } as unknown as TSESTree.TypeNode;

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });

    it("supports cyclic object graphs by reusing seen-pair tracking", () => {
        expect.hasAssertions();

        const left: { self?: unknown } = {};
        const right: { self?: unknown } = {};

        left.self = left;
        right.self = right;

        expect(
            areEquivalentTypeNodes(
                left as unknown as TSESTree.TypeNode,
                right as unknown as TSESTree.TypeNode
            )
        ).toBeTruthy();
    });

    it("supports repeated array pair checks through seen-pair tracking", () => {
        expect.hasAssertions();

        const left: unknown[] = [];
        const right: unknown[] = [];

        left.push(left, left);
        right.push(right, right);

        expect(
            areEquivalentTypeNodes(
                left as unknown as TSESTree.TypeNode,
                right as unknown as TSESTree.TypeNode
            )
        ).toBeTruthy();
    });

    it("returns false when right-side own keys are removed between key scan and property comparison", () => {
        expect.hasAssertions();

        const right: { alpha?: number } = { alpha: 1 };
        let descriptorReadCount = 0;

        const left = new Proxy(
            {
                alpha: 1,
            },
            {
                getOwnPropertyDescriptor(target, property): PropertyDescriptor {
                    descriptorReadCount += 1;

                    if (descriptorReadCount >= 2 && property === "alpha") {
                        delete right.alpha;
                    }

                    return (
                        Reflect.getOwnPropertyDescriptor(target, property) ?? {
                            configurable: true,
                            enumerable: true,
                            value: undefined,
                            writable: true,
                        }
                    );
                },
            }
        );

        expect(
            areEquivalentTypeNodes(
                left as unknown as TSESTree.TypeNode,
                right as unknown as TSESTree.TypeNode
            )
        ).toBeFalsy();
    });

    it("tracks multiple right-side pairs for the same left-side node", () => {
        expect.hasAssertions();

        const sharedLeft = {
            value: 1,
        };
        const rightFirst = {
            value: 1,
        };
        const rightSecond = {
            value: 1,
        };

        const left = {
            first: sharedLeft,
            second: sharedLeft,
        };
        const right = {
            first: rightFirst,
            second: rightSecond,
        };

        expect(
            areEquivalentTypeNodes(
                left as unknown as TSESTree.TypeNode,
                right as unknown as TSESTree.TypeNode
            )
        ).toBeTruthy();
    });

    it("fails closed for deeply nested structures to avoid stack overflows", () => {
        expect.hasAssertions();

        const leftRoot: { child?: unknown } = {};
        const rightRoot: { child?: unknown } = {};

        let leftCursor: { child?: unknown } = leftRoot;
        let rightCursor: { child?: unknown } = rightRoot;

        for (let depth = 0; depth < 512; depth += 1) {
            const nextLeft: { child?: unknown } = {};
            const nextRight: { child?: unknown } = {};

            leftCursor.child = nextLeft;
            rightCursor.child = nextRight;

            leftCursor = nextLeft;
            rightCursor = nextRight;
        }

        expect(
            areEquivalentTypeNodes(
                leftRoot as unknown as TSESTree.TypeNode,
                rightRoot as unknown as TSESTree.TypeNode
            )
        ).toBeFalsy();
    });
});
