/**
 * @packageDocumentation
 * Unit tests for shared nullish comparison parsing helpers.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";

import {
    flattenLogicalTerms,
    getNullishComparison,
} from "../../src/_internal/nullish-comparison";

const parseExpression = (sourceText: string): TSESTree.Expression => {
    const program = parser.parse(`${sourceText};`, {
        ecmaVersion: "latest",
        sourceType: "module",
    }) as unknown as TSESTree.Program;

    const [statement] = program.body;
    if (statement?.type !== AST_NODE_TYPES.ExpressionStatement) {
        throw new TypeError(
            "Expected parser to produce an expression statement"
        );
    }

    return statement.expression;
};

describe(flattenLogicalTerms, () => {
    it("flattens nested chains that use the same operator", () => {
        const expression = parseExpression(
            "value !== null && (value !== undefined && isReady)"
        );

        const terms = flattenLogicalTerms({
            expression,
            operator: "&&",
        });

        expect(terms).toHaveLength(3);
        expect(terms[0]?.type).toBe("BinaryExpression");
        expect(terms[1]?.type).toBe("BinaryExpression");
        expect(terms[2]?.type).toBe("Identifier");
    });

    it("does not flatten across different logical operators", () => {
        const expression = parseExpression(
            "value !== null && (value !== undefined || isReady)"
        );

        const terms = flattenLogicalTerms({
            expression,
            operator: "&&",
        });

        expect(terms).toHaveLength(2);
        expect(terms[1]?.type).toBe("LogicalExpression");
    });
});

describe(getNullishComparison, () => {
    it("parses direct null comparisons", () => {
        const expression = parseExpression("value != null");

        const comparison = getNullishComparison({
            expression,
            isGlobalUndefinedIdentifier: () => false,
        });

        expect(comparison).toEqual({
            comparedExpression: expect.objectContaining({
                name: "value",
                type: "Identifier",
            }),
            kind: "null",
            operator: "!=",
        });
    });

    it("parses global undefined identifier comparisons", () => {
        const expression = parseExpression("undefined === value");

        const comparison = getNullishComparison({
            expression,
            isGlobalUndefinedIdentifier: (candidateExpression) =>
                candidateExpression.type === AST_NODE_TYPES.Identifier &&
                candidateExpression.name === "undefined",
        });

        expect(comparison).toEqual({
            comparedExpression: expect.objectContaining({
                name: "value",
                type: "Identifier",
            }),
            kind: "undefined",
            operator: "===",
        });
    });

    it("respects compared identifier name filters", () => {
        const expression = parseExpression("other !== undefined");

        const comparison = getNullishComparison({
            comparedIdentifierName: "value",
            expression,
            isGlobalUndefinedIdentifier: () => true,
        });

        expect(comparison).toBeNull();
    });

    it("supports typeof guards when explicitly enabled", () => {
        const expression = parseExpression('typeof value !== "undefined"');

        const comparison = getNullishComparison({
            allowTypeofComparedIdentifierForUndefined: true,
            comparedIdentifierName: "value",
            expression,
            isGlobalUndefinedIdentifier: () => false,
        });

        expect(comparison).toEqual({
            comparedExpression: expect.objectContaining({
                name: "value",
                type: "Identifier",
            }),
            kind: "undefined",
            operator: "!==",
        });
    });

    it("does not treat typeof guards as undefined checks when disabled", () => {
        const expression = parseExpression('typeof value !== "undefined"');

        const comparison = getNullishComparison({
            comparedIdentifierName: "value",
            expression,
            isGlobalUndefinedIdentifier: () => false,
        });

        expect(comparison).toBeNull();
    });

    it("obeys allowed-operator constraints", () => {
        const expression = parseExpression("value == null");

        const comparison = getNullishComparison({
            allowedOperators: ["!=", "!=="],
            expression,
            isGlobalUndefinedIdentifier: () => false,
        });

        expect(comparison).toBeNull();
    });
});
