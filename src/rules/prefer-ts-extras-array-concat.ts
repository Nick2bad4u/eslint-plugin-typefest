/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-array-concat`.
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
 * ESLint rule definition for `prefer-ts-extras-array-concat`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasArrayConcatRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename;
            if (isTestFilePath(filePath)) {
                return {};
            }

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);

            const isArrayLikeType = (type: Readonly<ts.Type>): boolean => {
                const typedChecker = checker as ts.TypeChecker & {
                    isArrayType?: (candidateType: Readonly<ts.Type>) => boolean;
                    isTupleType?: (candidateType: Readonly<ts.Type>) => boolean;
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

                const typeText = checker.typeToString(type).trim();
                return typeText.endsWith("[]");
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
                        node.callee.property.name !== "concat"
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
                            importedName: "arrayConcat",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasArrayConcat",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras arrayConcat over Array#concat for stronger tuple and readonly-array typing.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://eslint-plugin-typefest.nick2bad4u.com/rules/prefer-ts-extras-array-concat",
            },
            fixable: "code",
            messages: {
                preferTsExtrasArrayConcat:
                    "Prefer `arrayConcat` from `ts-extras` over `array.concat(...)` for stronger tuple and readonly-array typing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-array-concat",
    });

/**
 * Default export for the `prefer-ts-extras-array-concat` rule module.
 */
export default preferTsExtrasArrayConcatRule;
