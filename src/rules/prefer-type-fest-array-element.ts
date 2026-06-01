import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-array-element`.
 */
import { isArrayLikeType } from "../_internal/array-like-expression.js";
import { getConstrainedTypeAtLocationWithFallback } from "../_internal/constrained-type-at-location.js";
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

const ARRAY_ELEMENT_TYPE_NAME = "ArrayElement" as const;

const isNumberIndexType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === AST_NODE_TYPES.TSNumberKeyword;

/**
 * ESLint rule definition for `prefer-type-fest-array-element`.
 *
 * @remarks
 * Defines metadata, diagnostics, and fixes for this rule.
 */
const preferTypeFestArrayElementRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const { checker, parserServices } = getTypedRuleServices(context);

            return {
                TSIndexedAccessType(node) {
                    if (
                        !isNumberIndexType(node.indexType) ||
                        node.objectType.type === AST_NODE_TYPES.TSTypeQuery
                    ) {
                        return;
                    }

                    const objectType = getConstrainedTypeAtLocationWithFallback(
                        checker,
                        node.objectType,
                        parserServices,
                        "prefer-type-fest-array-element-type-resolution-failed"
                    );

                    if (
                        !objectType ||
                        !isArrayLikeType(checker, objectType, "every")
                    ) {
                        return;
                    }

                    const objectTypeText = context.sourceCode.getText(
                        node.objectType
                    );

                    if (objectTypeText.trim().length === 0) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        ARRAY_ELEMENT_TYPE_NAME,
                        `${ARRAY_ELEMENT_TYPE_NAME}<${objectTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferArrayElement",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest ArrayElement over array and tuple `T[number]` element extraction.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-array-element",
            },
            fixable: "code",
            messages: {
                preferArrayElement:
                    "Prefer `ArrayElement<T>` from type-fest over array and tuple `T[number]` element extraction.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-array-element",
    });

/**
 * Default export for the `prefer-type-fest-array-element` rule module.
 */
export default preferTypeFestArrayElementRule;
