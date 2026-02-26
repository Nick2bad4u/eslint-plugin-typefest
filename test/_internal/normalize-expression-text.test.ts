import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";

import { areEquivalentExpressions } from "../../src/_internal/normalize-expression-text";

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
    if (firstStatement?.type !== "VariableDeclaration") {
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
