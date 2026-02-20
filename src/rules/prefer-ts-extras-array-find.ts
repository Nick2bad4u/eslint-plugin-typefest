/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-find`.
 */
import type ts from "typescript";

import {
    collectDirectNamedValueImportsFromSource,
    createMethodToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-array-find`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayFindRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const filePath = context.filename;
            if (isTestFilePath(filePath)) {
                return {};
            }

            const { checker, parserServices } = getTypedRuleServices(context);

            const isArrayLikeType = (type: ts.Type): boolean => {
                const typedChecker = checker as ts.TypeChecker & {
                    isArrayType?: (candidateType: ts.Type) => boolean;
                    isTupleType?: (candidateType: ts.Type) => boolean;
                };

                if (
                    typedChecker.isArrayType?.(type) ||
                    typedChecker.isTupleType?.(type)
                ) {
                    return true;
                }

                if (type.isUnion()) {
                    return type.types.some((partType) =>
                        isArrayLikeType(partType)
                    );
                }

                const typeText = checker.typeToString(type);
                return (
                    typeText.endsWith("[]") || typeText.endsWith("readonly []")
                );
            };

            return {
                CallExpression(node) {
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "find"
                    ) {
                        return;
                    }

                    try {
                        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                            node.callee.object
                        );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        if (!isArrayLikeType(objectType)) {
                            return;
                        }
                    } catch {
                        /* C8 ignore start -- defensive parser-services failure path */
                        return;
                    }
                    /* C8 ignore stop */

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "arrayFind",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayFind",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras arrayFind over Array#find for stronger predicate inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-array-find.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayFind:
                    "Prefer `arrayFind` from `ts-extras` over `array.find(...)` for stronger predicate inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-find",
    });

/**
 * Default export for the `prefer-ts-extras-array-find` rule module.
 */
export default preferTsExtrasArrayFindRule;
