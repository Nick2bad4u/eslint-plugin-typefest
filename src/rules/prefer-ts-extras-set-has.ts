/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-set-has`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";
import ts from "typescript";

import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseTypes,
} from "../_internal/type-checker-compat.js";
import { reportTsExtrasTypedMemberCall } from "../_internal/typed-member-call-rule.js";
import {
    createTypedRule,
    getTypedRuleServices,
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
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);

            const hasClassOrInterfaceLikeDeclaration = (
                candidateType: Readonly<ts.Type>
            ): boolean => {
                const declarations = candidateType.getSymbol()?.declarations;
                if (!isDefined(declarations)) {
                    return false;
                }

                return declarations.some(
                    (declaration) =>
                        declaration.kind === ts.SyntaxKind.ClassDeclaration ||
                        declaration.kind === ts.SyntaxKind.InterfaceDeclaration
                );
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

                    const apparentType = getTypeCheckerApparentType(
                        checker,
                        candidateType
                    );
                    if (
                        isDefined(apparentType) &&
                        apparentType !== candidateType &&
                        isSetTypeInternal(apparentType)
                    ) {
                        return true;
                    }

                    if (!hasClassOrInterfaceLikeDeclaration(candidateType)) {
                        return false;
                    }

                    const baseTypesResult = safeTypeOperation({
                        operation: () =>
                            getTypeCheckerBaseTypes(checker, candidateType),
                        reason: "set-has-base-type-analysis-failed",
                    });

                    if (!baseTypesResult.ok) {
                        return false;
                    }

                    const baseTypes = baseTypesResult.value;

                    return (
                        baseTypes?.some((baseType) =>
                            isSetTypeInternal(baseType)
                        ) ?? false
                    );
                };

                return isSetTypeInternal(type);
            };

            const isSetLikeExpression = (
                expression: Readonly<TSESTree.Expression>
            ): boolean => {
                const result = safeTypeOperation({
                    operation: () => {
                        const tsNode =
                            parserServices.esTreeNodeToTSNodeMap.get(
                                expression
                            );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        return isSetType(objectType);
                    },
                    reason: "set-has-type-analysis-failed",
                });

                return result.ok && result.value;
            };

            return {
                CallExpression(node) {
                    reportTsExtrasTypedMemberCall({
                        context,
                        importedName: "setHas",
                        imports: tsExtrasImports,
                        isMatchingObjectExpression: isSetLikeExpression,
                        memberName: "has",
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
