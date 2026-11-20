/** @packageDocumentation ESLint rule for MinimumLengthArray. */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { arrayAt } from "ts-extras";

import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

/**
 * Prefer TypeFest MinimumLengthArray for homogeneous open tuples with two or
 * more required elements.
 */
const preferTypeFestMinimumLengthArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            return {
                TSTupleType(node) {
                    if (
                        node.elementTypes.length < 3 ||
                        (node.parent.type === AST_NODE_TYPES.TSTypeOperator &&
                            node.parent.operator === "readonly")
                    )
                        return;
                    const rest = arrayAt(node.elementTypes, -1);
                    if (
                        rest?.type !== AST_NODE_TYPES.TSRestType ||
                        rest.typeAnnotation.type !== AST_NODE_TYPES.TSArrayType
                    )
                        return;
                    const item = rest.typeAnnotation.elementType;
                    if (
                        item.type !== AST_NODE_TYPES.TSTypeReference &&
                        !item.type.endsWith("Keyword")
                    )
                        return;
                    if (
                        item.type === AST_NODE_TYPES.TSTypeReference &&
                        (item.typeName.type !== AST_NODE_TYPES.Identifier ||
                            item.typeArguments)
                    )
                        return;
                    const text = context.sourceCode.getText(item);
                    if (
                        node.elementTypes
                            .slice(0, -1)
                            .every(
                                (element) =>
                                    element.type === item.type &&
                                    context.sourceCode.getText(element) === text
                            )
                    ) {
                        report(
                            node,
                            "MinimumLengthArray",
                            text,
                            String(node.elementTypes.length - 1)
                        );
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest MinimumLengthArray for homogeneous open tuples with two or more required elements.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-minimum-length-array",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-minimum-length-array",
    });
export default preferTypeFestMinimumLengthArrayRule;
