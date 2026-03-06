/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-as-writable`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { setHas } from "ts-extras";

import {
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
} from "../_internal/imported-type-aliases.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-as-writable`;

const TYPE_FEST_PACKAGE_NAME = "type-fest" as const;
const WRITABLE_TYPE_NAME = "Writable" as const;

/**
 * ESLint rule definition for `prefer-ts-extras-as-writable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAsWritableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const writableLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_PACKAGE_NAME,
                WRITABLE_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_PACKAGE_NAME
                );

            /**
             * Check whether a type annotation references `Writable` from
             * `type-fest` (direct import or namespace member).
             */
            const isWritableTypeReference = (
                typeAnnotation: Readonly<TSESTree.TypeNode>
            ): boolean => {
                if (typeAnnotation.type !== "TSTypeReference") {
                    return false;
                }

                if (typeAnnotation.typeName.type === "Identifier") {
                    return setHas(writableLocalNames, typeAnnotation.typeName.name);
                }

                if (typeAnnotation.typeName.type !== "TSQualifiedName") {
                    return false;
                }

                return (
                    typeAnnotation.typeName.left.type === "Identifier" &&
                    typeFestNamespaceImportNames.has(
                        typeAnnotation.typeName.left.name
                    ) &&
                    typeAnnotation.typeName.right.type === "Identifier" &&
                    typeAnnotation.typeName.right.name === WRITABLE_TYPE_NAME
                );
            };

            /**
             * Report and optionally autofix `Writable<...>` type assertions to
             * `asWritable(...)` calls.
             */
            const reportIfWritableAssertion = (
                node: Readonly<TSESTree.Node>,
                expression: Readonly<TSESTree.Expression>,
                typeAnnotation: Readonly<TSESTree.TypeNode>
            ): void => {
                if (!isWritableTypeReference(typeAnnotation)) {
                    return;
                }

                const fix = createSafeValueNodeTextReplacementFix({
                    context,
                    importedName: "asWritable",
                    imports: tsExtrasImports,
                    replacementTextFactory: (replacementName) =>
                        `${replacementName}(${context.sourceCode.getText(expression)})`,
                    sourceModuleName: "ts-extras",
                    targetNode: node,
                });

                reportWithOptionalFix({
                    context,
                    fix,
                    messageId: "preferTsExtrasAsWritable",
                    node,
                });
            };

            return {
                TSAsExpression(node) {
                    reportIfWritableAssertion(
                        node,
                        node.expression,
                        node.typeAnnotation
                    );
                },
                TSTypeAssertion(node) {
                    reportIfWritableAssertion(
                        node,
                        node.expression,
                        node.typeAnnotation
                    );
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras asWritable over Writable<T> style assertions from type-fest.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            messages: {
                preferTsExtrasAsWritable:
                    "Prefer `asWritable(value)` from `ts-extras` over `Writable<...>` assertions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-as-writable",
    });

/**
 * Default export for the `prefer-ts-extras-as-writable` rule module.
 */
export default preferTsExtrasAsWritableRule;
