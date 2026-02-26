import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";

import {
    areEquivalentExpressions,
    areEquivalentTypeNodes,
} from "../../src/_internal/normalize-expression-text";

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
        const left = getInitializerExpression("user.profile.id");
        const right = getInitializerExpression("user.profile.id");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });

    it("treats different expressions as non-equivalent", () => {
        const left = getInitializerExpression("user.profile.id");
        const right = getInitializerExpression("user.profile.name");

        expect(areEquivalentExpressions(left, right)).toBeFalsy();
    });

    it("unwraps TS assertion wrappers for equivalence", () => {
        const left = getInitializerExpression("value as string");
        const right = getInitializerExpression("value");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });

    it("unwraps non-null and satisfies wrappers for equivalence", () => {
        const left = getInitializerExpression("value!");
        const right = getInitializerExpression("value satisfies unknown");

        expect(areEquivalentExpressions(left, right)).toBeTruthy();
    });
});

describe(areEquivalentTypeNodes, () => {
    it("treats equivalent type nodes as equivalent", () => {
        const left = getAliasTypeAnnotation("Readonly<{ alpha: string }>");
        const right = getAliasTypeAnnotation("Readonly<{ alpha: string }>");

        expect(areEquivalentTypeNodes(left, right)).toBeTruthy();
    });

    it("treats different type nodes as non-equivalent", () => {
        const left = getAliasTypeAnnotation("Readonly<{ alpha: string }>");
        const right = getAliasTypeAnnotation("Readonly<{ beta: string }>");

        expect(areEquivalentTypeNodes(left, right)).toBeFalsy();
    });
});
