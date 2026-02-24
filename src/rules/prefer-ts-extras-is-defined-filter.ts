/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-defined-filter`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueReferenceReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

type UndefinedInequalityMatch = {
    readonly comparedExpression: TSESTree.Expression;
    readonly operator: "!=" | "!==";
};

const isIdentifierWithName = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>,
    name: string
): node is TSESTree.Identifier =>
    node.type === "Identifier" && node.name === name;

const isUndefinedStringLiteral = (
    node: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): node is TSESTree.Literal & { value: "undefined" } =>
    node.type === "Literal" && node.value === "undefined";

const isTypeofParameter = (
    node: Readonly<TSESTree.Expression>,
    parameterName: string
): node is TSESTree.UnaryExpression & { argument: TSESTree.Identifier } =>
    node.type === "UnaryExpression" &&
    node.operator === "typeof" &&
    isIdentifierWithName(node.argument, parameterName);

const getUndefinedInequalityMatch = (
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
        isIdentifierWithName(body.right, "undefined")
    ) {
        return {
            comparedExpression: body.left,
            operator: body.operator,
        };
    }

    if (
        isIdentifierWithName(body.right, parameterName) &&
        isIdentifierWithName(body.left, "undefined")
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

    return null;
};

/**
 * Check whether the input is undefined filter guard body.
 *
 * @param body - Value to inspect.
 * @param parameterName - Value to inspect.
 *
 * @returns `true` when the value is undefined filter guard body; otherwise
 *   `false`.
 */

const isUndefinedFilterGuardBody = (
    body: Readonly<TSESTree.Expression>,
    parameterName: string
): boolean => getUndefinedInequalityMatch(body, parameterName) !== null;

/**
 * ESLint rule definition for `prefer-ts-extras-is-defined-filter`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsDefinedFilterRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            return {
                CallExpression(node) {
                    const { callee } = node;

                    if (callee.type !== "MemberExpression") {
                        return;
                    }

                    if (callee.computed) {
                        return;
                    }

                    if (callee.property.type !== "Identifier") {
                        return;
                    }

                    if (callee.property.name !== "filter") {
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
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-is-defined-filter.md",
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

