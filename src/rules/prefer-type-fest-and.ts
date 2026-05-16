import type { TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-and`.
 */
import { getTwoElementTupleArgumentText } from "../_internal/boolean-pair-type-patterns.js";
import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const AND_ALL_TYPE_NAME = "AndAll" as const;
const AND_TYPE_NAME = "And" as const;

/** ESLint rule definition for `prefer-type-fest-and`. */
const preferTypeFestAndRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const andAllLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                AND_ALL_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            const reportIfAndAllPair = (
                node: Readonly<TSESTree.TSTypeReference>
            ): void => {
                const tupleArgumentText = getTwoElementTupleArgumentText(
                    node,
                    context.sourceCode
                );

                if (!tupleArgumentText) {
                    return;
                }

                const replacementText = `${AND_TYPE_NAME}<${tupleArgumentText.leftTypeText}, ${tupleArgumentText.rightTypeText}>`;
                const fix = createSafeTypeNodeTextReplacementFix(
                    node,
                    AND_TYPE_NAME,
                    replacementText,
                    typeFestDirectImports
                );

                reportWithOptionalFix({
                    context,
                    fix,
                    messageId: "preferAnd",
                    node,
                });
            };

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    typeReference: Readonly<TSESTree.TSTypeReference>
                ) {
                    if (
                        typeReference.typeName.type !==
                            AST_NODE_TYPES.Identifier ||
                        !setContainsValue(
                            andAllLocalNames,
                            typeReference.typeName.name
                        )
                    ) {
                        return;
                    }

                    reportIfAndAllPair(typeReference);
                },
                'TSTypeReference[typeName.type="TSQualifiedName"]'(
                    typeReference: Readonly<TSESTree.TSTypeReference>
                ) {
                    if (
                        typeReference.typeName.type !==
                            AST_NODE_TYPES.TSQualifiedName ||
                        typeReference.typeName.left.type !==
                            AST_NODE_TYPES.Identifier ||
                        !setContainsValue(
                            typeFestNamespaceImportNames,
                            typeReference.typeName.left.name
                        ) ||
                        typeReference.typeName.right.name !== AND_ALL_TYPE_NAME
                    ) {
                        return;
                    }

                    reportIfAndAllPair(typeReference);
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest And over two-element AndAll boolean tuple checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-and",
            },
            fixable: "code",
            messages: {
                preferAnd:
                    "Prefer `And<A, B>` from type-fest over `AndAll<[A, B]>` for two-value boolean conjunction checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-and",
    });

export default preferTypeFestAndRule;
