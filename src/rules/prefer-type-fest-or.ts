import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-or`.
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

const OR_ALL_TYPE_NAME = "OrAll" as const;
const OR_TYPE_NAME = "Or" as const;

/** ESLint rule definition for `prefer-type-fest-or`. */
const preferTypeFestOrRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const orAllLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                OR_ALL_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            const reportIfOrAllPair = (
                node: Readonly<TSESTree.TSTypeReference>
            ): void => {
                const tupleArgumentText = getTwoElementTupleArgumentText(
                    node,
                    context.sourceCode
                );

                if (!tupleArgumentText) {
                    return;
                }

                const replacementText = `${OR_TYPE_NAME}<${tupleArgumentText.leftTypeText}, ${tupleArgumentText.rightTypeText}>`;
                const fix = createSafeTypeNodeTextReplacementFix(
                    node,
                    OR_TYPE_NAME,
                    replacementText,
                    typeFestDirectImports
                );

                reportWithOptionalFix({
                    context,
                    fix,
                    messageId: "preferOr",
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
                            orAllLocalNames,
                            typeReference.typeName.name
                        )
                    ) {
                        return;
                    }

                    reportIfOrAllPair(typeReference);
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
                        typeReference.typeName.right.name !== OR_ALL_TYPE_NAME
                    ) {
                        return;
                    }

                    reportIfOrAllPair(typeReference);
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Or over two-element OrAll boolean tuple checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-or",
            },
            fixable: "code",
            messages: {
                preferOr:
                    "Prefer `Or<A, B>` from type-fest over `OrAll<[A, B]>` for two-value boolean disjunction checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-or",
    });

export default preferTypeFestOrRule;
