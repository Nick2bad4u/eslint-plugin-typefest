/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-string-split`.
 */
import ts from "typescript";

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
 * ESLint rule definition for `prefer-ts-extras-string-split`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasStringSplitRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);

            const isStringLikeType = (
                type: Readonly<ReturnType<typeof checker.getTypeAtLocation>>
            ): boolean => {
                const seenTypes = new Set<ts.Type>();

                const isStringLikeTypeInternal = (
                    candidateType: Readonly<ts.Type>
                ): boolean => {
                    if (seenTypes.has(candidateType)) {
                        return false;
                    }

                    seenTypes.add(candidateType);

                    if (candidateType.isUnion()) {
                        return candidateType.types.some((partType) =>
                            isStringLikeTypeInternal(partType)
                        );
                    }

                    if (candidateType.isIntersection()) {
                        return candidateType.types.some((partType) =>
                            isStringLikeTypeInternal(partType)
                        );
                    }

                    if ((candidateType.flags & ts.TypeFlags.StringLike) !== 0) {
                        return true;
                    }

                    if (candidateType.getSymbol()?.getName() === "String") {
                        return true;
                    }

                    const apparentType = checker.getApparentType(candidateType);
                    return apparentType === candidateType
                        ? false
                        : isStringLikeTypeInternal(apparentType);
                };

                return isStringLikeTypeInternal(type);
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
                        node.callee.property.name !== "split"
                    ) {
                        return;
                    }

                    try {
                        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                            node.callee.object
                        );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        if (!isStringLikeType(objectType)) {
                            return;
                        }
                    } catch {
                        return;
                    }

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "stringSplit",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasStringSplit",
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
                    "require ts-extras stringSplit over String#split for stronger tuple inference.",
                frozen: false,
                recommended: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-string-split",
            },
            fixable: "code",
            messages: {
                preferTsExtrasStringSplit:
                    "Prefer `stringSplit` from `ts-extras` over `string.split(...)` for stronger tuple inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-string-split",
    });

/**
 * Default export for the `prefer-ts-extras-string-split` rule module.
 */
export default preferTsExtrasStringSplitRule;
