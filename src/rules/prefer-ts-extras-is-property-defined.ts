/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-property-defined`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { getSingleParameterExpressionArrowFilterCallback } from "../_internal/filter-callback.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    isGlobalUndefinedIdentifier,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Extract the property name from a `typeof param.prop !== "undefined"` (or
 * reversed) check, returning `null` when the shape does not match.
 *
 * @param typeofSide - Expected `typeof` unary expression side.
 * @param stringSide - Expected `"undefined"` string literal side.
 * @param operator - Binary expression operator.
 * @param paramName - Expected parameter identifier name.
 *
 * @returns Property name when matched; otherwise `null`.
 */
const extractTypeofPropertyDefinedCheck = (
    typeofSide: Readonly<TSESTree.Expression>,
    stringSide: Readonly<TSESTree.Expression>,
    operator: string,
    paramName: string
): null | string => {
    // Typeof checks are always strict
    if (operator !== "!==") {
        return null;
    }

    if (
        typeofSide.type !== "UnaryExpression" ||
        typeofSide.operator !== "typeof"
    ) {
        return null;
    }

    const { argument } = typeofSide;

    if (
        argument.type !== "MemberExpression" ||
        argument.computed ||
        argument.object.type !== "Identifier" ||
        argument.object.name !== paramName ||
        argument.property.type !== "Identifier"
    ) {
        return null;
    }

    if (stringSide.type !== "Literal" || stringSide.value !== "undefined") {
        return null;
    }

    return argument.property.name;
};

/**
 * Determine whether an arrow-callback body is a supported property-undefined
 * guard and, when matched, return the accessed property name.
 *
 * Recognized patterns:
 *
 * - `param.prop !== undefined`
 * - `undefined !== param.prop`
 * - `param.prop != undefined`
 * - `undefined != param.prop`
 * - `typeof param.prop !== "undefined"`
 * - `"undefined" !== typeof param.prop`
 *
 * @param context - Active rule context for global-binding checks.
 * @param body - Callback body expression to inspect.
 * @param paramName - Callback parameter identifier name.
 *
 * @returns Property name when the body is a supported guard; otherwise `null`.
 */
const extractPropertyDefinedGuardBody = (
    context: RuleContext,
    body: Readonly<TSESTree.Expression>,
    paramName: string
): null | string => {
    if (body.type !== "BinaryExpression") {
        return null;
    }

    const { left, operator, right } = body;

    if (operator !== "!==" && operator !== "!=") {
        return null;
    }

    // Typeof form: `typeof param.prop !== "undefined"` or reversed
    const typeofLeftResult = extractTypeofPropertyDefinedCheck(
        left,
        right,
        operator,
        paramName
    );
    if (typeofLeftResult !== null) {
        return typeofLeftResult;
    }

    const typeofRightResult = extractTypeofPropertyDefinedCheck(
        right,
        left,
        operator,
        paramName
    );
    if (typeofRightResult !== null) {
        return typeofRightResult;
    }

    // Standard binary: `param.prop !== undefined` or `undefined !== param.prop`
    if (
        left.type === "MemberExpression" &&
        !left.computed &&
        left.object.type === "Identifier" &&
        left.object.name === paramName &&
        left.property.type === "Identifier" &&
        isGlobalUndefinedIdentifier(context, right)
    ) {
        return left.property.name;
    }

    if (
        right.type === "MemberExpression" &&
        !right.computed &&
        right.object.type === "Identifier" &&
        right.object.name === paramName &&
        right.property.type === "Identifier" &&
        isGlobalUndefinedIdentifier(context, left)
    ) {
        return right.property.name;
    }

    return null;
};

/**
 * ESLint rule definition for `prefer-ts-extras-is-property-defined`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsPropertyDefinedRule: ReturnType<typeof createTypedRule> =
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

                    const propName = extractPropertyDefinedGuardBody(
                        context,
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
                            importedName: "isPropertyDefined",
                            imports: tsExtrasImports,
                            replacementTextFactory: (localName) =>
                                `${localName}(${JSON.stringify(propName)})`,
                            reportFixIntent: "autofix",
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: callback,
                        }),
                        messageId: "preferTsExtrasIsPropertyDefined",
                        node: callback,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isPropertyDefined in Array.filter callbacks instead of inline property-undefined checks.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-property-defined",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsPropertyDefined:
                    "Prefer `isPropertyDefined` from `ts-extras` over an inline property-undefined filter callback.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-property-defined",
    });

/**
 * Default export for the `prefer-ts-extras-is-property-defined` rule module.
 */
export default preferTsExtrasIsPropertyDefinedRule;
