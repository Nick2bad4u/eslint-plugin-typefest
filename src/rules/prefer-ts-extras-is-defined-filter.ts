/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isFilterCallExpression } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Normalized metadata extracted from a supported undefined inequality guard.
 */
type UndefinedInequalityMatch = {
    readonly comparedExpression: TSESTree.Expression;
    readonly operator: "!=" | "!==";
};

/**
 * Narrow a node to an Identifier with an expected name.
 */
const isIdentifierWithName = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    name: string
): node is TSESTree.Identifier =>
    node.type === "Identifier" && node.name === name;

/**
 * Narrow a node to the string literal `"undefined"`.
 */
const isUndefinedStringLiteral = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Literal & { value: "undefined" } =>
    node.type === "Literal" && node.value === "undefined";

/**
 * Narrow an expression to `typeof <parameterName>`.
 */
const isTypeofParameter = (
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.UnaryExpression & { argument: TSESTree.Identifier } =>
    node.type === "UnaryExpression" &&
    node.operator === "typeof" &&
    isIdentifierWithName(node.argument, parameterName);

/**
 * Match supported undefined-inequality patterns used in `filter` callbacks.
 */
const getUndefinedInequalityMatch = (
    context: RuleContext,
    body: Readonly<TSESTree.Expression>,
    parameterName: string
): null | UndefinedInequalityMatch => {
    if (body.type !== "BinaryExpression") {
        return null;
    }

    if (body.operator !== "!==" && body.operator !== "!=") {
        return null;
    }

    if (
        isIdentifierWithName(body.left, parameterName) &&
        body.right.type === "Identifier" &&
        isGlobalUndefinedIdentifier(context, body.right)
    ) {
        return {
            comparedExpression: body.left,
            operator: body.operator,
        };
    }

    if (
        isIdentifierWithName(body.right, parameterName) &&
        body.left.type === "Identifier" &&
        isGlobalUndefinedIdentifier(context, body.left)
    ) {
        return {
            comparedExpression: body.right,
            operator: body.operator,
        };
    }

    if (
        isTypeofParameter(body.left, parameterName) &&
        isUndefinedStringLiteral(body.right)
    ) {
        return {
            comparedExpression: body.left.argument,
            operator: body.operator,
        };
    }

    if (
        isTypeofParameter(body.right, parameterName) &&
        isUndefinedStringLiteral(body.left)
    ) {
        return {
            comparedExpression: body.right.argument,
            operator: body.operator,
        };
    }

    return null;
};

/**
 * Check whether a callback body is a supported undefined guard expression.
 *
 * @param context - Active rule context for global-binding checks.
 * @param body - Callback body expression to inspect.
 * @param parameterName - Callback parameter name.
 *
 * @returns `true` when the body can be replaced with `isDefined`.
 */
const isUndefinedFilterGuardBody = (
    context: RuleContext,
    body: Readonly<TSESTree.Expression>,
    parameterName: string
): boolean =>
    getUndefinedInequalityMatch(context, body, parameterName) !== null;

/**
 * ESLint rule definition for `prefer-ts-extras-is-defined-filter`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsDefinedFilterRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    if (!isFilterCallExpression(node)) {
                        return;
                    }

                    const callback = node.arguments[0];

                    if (callback?.type !== "ArrowFunctionExpression") {
                        return;
                    }

                    if (callback.params.length !== 1) {
                        return;
                    }

                    if (callback.body.type === "BlockStatement") {
                        return;
                    }

                    const parameter = callback.params[0];
                    if (parameter?.type !== "Identifier") {
                        return;
                    }

                    if (
                        !isUndefinedFilterGuardBody(
                            context,
                            callback.body,
                            parameter.name
                        )
                    ) {
                        return;
                    }

                    context.report({
                        fix: createSafeValueReferenceReplacementFix({
                            context,
                            importedName: "isDefined",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                            targetNode: callback,
                        }),
                        messageId: "preferTsExtrasIsDefinedFilter",
                        node: callback,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isDefined in Array.filter callbacks instead of inline undefined checks.",
                frozen: false,
                recommended: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-defined-filter",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsDefinedFilter:
                    "Prefer `isDefined` from `ts-extras` in `filter(...)` callbacks over inline undefined comparisons.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-defined-filter",
    });

/**
 * Default export for the `prefer-ts-extras-is-defined-filter` rule module.
 */
export default preferTsExtrasIsDefinedFilterRule;
