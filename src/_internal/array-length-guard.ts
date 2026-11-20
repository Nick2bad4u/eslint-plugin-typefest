import type { UnknownArray } from "type-fest";
import type ts from "typescript";

/**
 * @packageDocumentation
 * Type-aware matching for positive lower bounds on a native array's length.
 */
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { isDefined, isSafeInteger } from "ts-extras";

import { isArrayLikeType } from "./array-like-expression.js";
import { getConstrainedTypeAtLocationWithFallback } from "./constrained-type-at-location.js";
import { getTypedRuleServices } from "./typed-rule.js";
import { createTypeScriptEslintNodeExpressionSkipChecker } from "./typescript-eslint-node-autofix.js";

type LengthGuard = "hasAtLeast" | "isNonEmpty";

/** Only single literal minima below 1000 select the upstream narrowing overload. */
const MAXIMUM_NARROWING_MINIMUM = 999;

const getMinimum = (
    operator: TSESTree.BinaryExpression["operator"],
    literal: number,
    lengthOnLeft: boolean
): number | undefined => {
    if (operator === "!=" || operator === "!==") {
        return literal === 0 ? 1 : undefined;
    }

    if (operator === (lengthOnLeft ? ">" : "<")) {
        return literal + 1;
    }

    const inclusiveOperator = lengthOnLeft ? ">=" : "<=";
    return operator === inclusiveOperator ? literal : undefined;
};

const getLengthReceiver = (node: Readonly<TSESTree.Node>) => {
    if (
        node.type === AST_NODE_TYPES.MemberExpression &&
        !node.computed &&
        !node.optional &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        node.property.name === "length" &&
        node.object.type !== AST_NODE_TYPES.Super
    ) {
        return { array: node.object, length: node };
    }
    return undefined;
};

const getIntegerLiteral = (
    node: Readonly<TSESTree.Node>
): number | undefined =>
    node.type === AST_NODE_TYPES.Literal &&
    typeof node.value === "number" &&
    isSafeInteger(node.value)
        ? node.value
        : undefined;

const getLengthComparison = (node: Readonly<TSESTree.BinaryExpression>) => {
    const lengthOnLeft = node.left.type === AST_NODE_TYPES.MemberExpression;
    const access = getLengthReceiver(lengthOnLeft ? node.left : node.right);
    const limit = getIntegerLiteral(lengthOnLeft ? node.right : node.left);
    if (!access || !isDefined(limit)) {
        return undefined;
    }

    const minimum = getMinimum(node.operator, limit, lengthOnLeft);
    return isDefined(minimum) &&
        minimum >= 1 &&
        minimum <= MAXIMUM_NARROWING_MINIMUM
        ? { ...access, minimum }
        : undefined;
};

/**
 * Literal tuple lengths can already establish the outcome or narrow an
 * inequality.
 */
const benefitsFromLengthGuard = (
    type: ts.Type,
    minimum: number,
    operator: TSESTree.BinaryExpression["operator"]
): boolean => {
    const parts = type.isUnion() ? type.types : [type];
    const literalLengths = parts.filter((part) => part.isNumberLiteral());
    if (literalLengths.length !== parts.length) return true;
    if (operator === "!=" || operator === "!==") return false;
    return (
        literalLengths.some((part) => part.value < minimum) &&
        literalLengths.some((part) => part.value >= minimum)
    );
};

/** Build the listener shared by the nonempty and minimum-length rules. */
export const createArrayLengthGuardListener = <MessageId extends string>(
    context: Readonly<TSESLint.RuleContext<MessageId, UnknownArray>>,
    helper: LengthGuard,
    messageId: MessageId
): TSESLint.RuleListener => {
    const { checker, parserServices } = getTypedRuleServices(context);
    const skipExpression = createTypeScriptEslintNodeExpressionSkipChecker(
        context,
        { checker, parserServices }
    );

    return {
        BinaryExpression(node) {
            const comparison = getLengthComparison(node);
            if (
                !comparison ||
                (helper === "isNonEmpty") !== (comparison.minimum === 1)
            ) {
                return;
            }

            const { array, length, minimum } = comparison;
            const type = getConstrainedTypeAtLocationWithFallback(
                checker,
                array,
                parserServices,
                "array-length-guard-type-resolution-failed"
            );
            if (
                !type ||
                !isArrayLikeType(checker, type, "every") ||
                skipExpression(array)
            ) {
                return;
            }

            const lengthType = checker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(length)
            );
            if (benefitsFromLengthGuard(lengthType, minimum, node.operator)) {
                context.report({ messageId, node });
            }
        },
    };
};
