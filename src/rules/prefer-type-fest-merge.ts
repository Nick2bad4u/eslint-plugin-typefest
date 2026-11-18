import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-merge`.
 */
import { collectNamedImportLocalNamesFromSource } from "../_internal/imported-type-aliases.js";
import { isMergeStyleIntersectionMember } from "../_internal/merge-style-intersection.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const OMIT_TYPE_NAME = "Omit";

/**
 * ESLint rule definition for `prefer-type-fest-merge`.
 */
const preferTypeFestMergeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const exceptLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                "Except"
            );

            return {
                'TSIntersectionType > TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (
                        node.typeName.type !== AST_NODE_TYPES.Identifier ||
                        (node.typeName.name !== OMIT_TYPE_NAME &&
                            !setContainsValue(
                                exceptLocalNames,
                                node.typeName.name
                            )) ||
                        !isMergeStyleIntersectionMember(node)
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        data: { omitTypeName: node.typeName.name },
                        fix: null,
                        messageId: "preferMerge",
                        node: node.parent,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Merge over Omit/Except<Destination, keyof Source> & Source intersections.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge",
            },
            messages: {
                preferMerge:
                    "Prefer `Merge<Destination, Source>` from type-fest over `{{omitTypeName}}<Destination, keyof Source> & Source` when the second object cleanly overrides the first.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-merge",
    });

export default preferTypeFestMergeRule;
