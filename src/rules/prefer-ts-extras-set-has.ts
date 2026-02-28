/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-set-has`.
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
 * ESLint rule definition for `prefer-ts-extras-set-has`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasSetHasRule: ReturnType<typeof createTypedRule> =
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
            const checkerWithApparentType = checker as ts.TypeChecker & {
                getApparentType?: (type: Readonly<ts.Type>) => ts.Type;
            };

            /**
             * Determine whether a type resolves to `Set`/`ReadonlySet`,
             * traversing unions, intersections, apparent types, and base
             * interfaces.
             */
            const isSetType = (type: Readonly<ts.Type>): boolean => {
                const seenTypes = new Set<ts.Type>();

                const isSetTypeInternal = (
                    candidateType: Readonly<ts.Type>
                ): boolean => {
                    if (seenTypes.has(candidateType)) {
                        return false;
                    }

                    seenTypes.add(candidateType);

                    if (candidateType.isUnion()) {
                        return candidateType.types.some((partType) =>
                            isSetTypeInternal(partType)
                        );
                    }

                    if (candidateType.isIntersection()) {
                        return candidateType.types.some((partType) =>
                            isSetTypeInternal(partType)
                        );
                    }

                    const symbolName = candidateType.getSymbol()?.getName();
                    if (symbolName === "ReadonlySet" || symbolName === "Set") {
                        return true;
                    }

                    const apparentType =
                        checkerWithApparentType.getApparentType?.(
                            candidateType
                        );
                    if (
                        apparentType !== undefined &&
                        apparentType !== candidateType &&
                        isSetTypeInternal(apparentType)
                    ) {
                        return true;
                    }

                    const typeDeclarations =
                        candidateType.getSymbol()?.declarations ?? [];
                    const isClassOrInterfaceLikeType = typeDeclarations.some(
                        (declaration) =>
                            declaration.kind ===
                                ts.SyntaxKind.ClassDeclaration ||
                            declaration.kind ===
                                ts.SyntaxKind.InterfaceDeclaration
                    );

                    if (!isClassOrInterfaceLikeType) {
                        return false;
                    }

                    const baseTypes = checker.getBaseTypes(
                        candidateType as ts.InterfaceType
                    );

                    return (
                        baseTypes?.some((baseType) =>
                            isSetTypeInternal(baseType)
                        ) ?? false
                    );
                };

                return isSetTypeInternal(type);
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
                        node.callee.property.name !== "has"
                    ) {
                        return;
                    }

                    try {
                        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                            node.callee.object
                        );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        if (!isSetType(objectType)) {
                            return;
                        }
                    } catch {
                        return;
                    }

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "setHas",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasSetHas",
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
                    "require ts-extras setHas over Set#has for stronger element narrowing.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["ts-extras/type-guards"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-set-has",
            },
            fixable: "code",
            messages: {
                preferTsExtrasSetHas:
                    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-set-has",
    });

/**
 * Default export for the `prefer-ts-extras-set-has` rule module.
 */
export default preferTsExtrasSetHasRule;
