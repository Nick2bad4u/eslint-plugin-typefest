import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-property-present`.
 */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { getSingleParameterExpressionArrowFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Determine whether an arrow-callback body is a supported property-nullish
 * guard and, when matched, return the accessed property name.
 *
 * Recognized patterns (loose equality against `null` catches both `null` and
 * `undefined`):
 *
 * - `param.prop != null`
 * - `null != param.prop`
 *
 * @param body - Callback body expression to inspect.
 * @param paramName - Callback parameter identifier name.
 *
 * @returns Property name when the body is a supported guard; otherwise `null`.
 */
const extractPropertyPresentGuardBody = (
    body: Readonly<TSESTree.Expression>,
    paramName: string
): null | string => {
    if (
        body.type !== AST_NODE_TYPES.BinaryExpression ||
        body.operator !== "!="
    ) {
        return null;
    }

    const { left, right } = body;

    // `param.prop != null`
    if (
        left.type === AST_NODE_TYPES.MemberExpression &&
        !left.computed &&
        left.object.type === AST_NODE_TYPES.Identifier &&
        left.object.name === paramName &&
        left.property.type === AST_NODE_TYPES.Identifier &&
        right.type === AST_NODE_TYPES.Literal &&
        right.value === null
    ) {
        return left.property.name;
    }

    // `null != param.prop`
    if (
        right.type === AST_NODE_TYPES.MemberExpression &&
        !right.computed &&
        right.object.type === AST_NODE_TYPES.Identifier &&
        right.object.name === paramName &&
        right.property.type === AST_NODE_TYPES.Identifier &&
        left.type === AST_NODE_TYPES.Literal &&
        left.value === null
    ) {
        return right.property.name;
    }

    return null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-property-present`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsPropertyPresentRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.property.type="Identifier"][callee.property.name="filter"]'(
                    node
                ) {
                    const callbackMatch =
                        getSingleParameterExpressionArrowFilterCallback(node);
                    if (!callbackMatch) {
                        return;
                    }

                    const { callback, parameter } = callbackMatch;

                    const propName = extractPropertyPresentGuardBody(
                        callback.body,
                        parameter.name
                    );

                    if (propName === null) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "isPropertyPresent",
                            imports: tsExtrasImports,
                            replacementTextFactory: (localName) =>
                                `${localName}(${JSON.stringify(propName)})`,
                            reportFixIntent: "autofix",
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: callback,
                        }),
                        messageId: "preferTsExtrasIsPropertyPresent",
                        node: callback,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isPropertyPresent in Array.filter callbacks instead of inline property-nullish checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-property-present",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsPropertyPresent:
                    "Prefer `isPropertyPresent` from `ts-extras` over an inline property-nullish filter callback.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-property-present",
    });

/**
 * Default export for the `prefer-ts-extras-is-property-present` rule module.
 */
export default preferTsExtrasIsPropertyPresentRule;
