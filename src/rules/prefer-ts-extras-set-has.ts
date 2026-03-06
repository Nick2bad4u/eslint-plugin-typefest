/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-set-has`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined, setHas } from "ts-extras";
import ts from "typescript";

import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { RULE_DOCS_URL_BASE } from "../_internal/rule-docs-url.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseTypes,
} from "../_internal/type-checker-compat.js";
import { isTypePredicateAutofixSafe } from "../_internal/type-predicate-autofix-safety.js";
import { reportTsExtrasTypedMemberCall } from "../_internal/typed-member-call-rule.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

const RULE_DOCS_URL = `${RULE_DOCS_URL_BASE}/prefer-ts-extras-set-has`;

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
            const setTypeResolutionCache = new Map<
                Readonly<ts.Type>,
                boolean
            >();

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
                const cachedRootResult = setTypeResolutionCache.get(type);
                if (isDefined(cachedRootResult)) {
                    return cachedRootResult;
                }

                const seenTypes = new Set<ts.Type>();

                const isSetTypeInternal = (
                    candidateType: Readonly<ts.Type>
                ): boolean => {
                    const cachedResult =
                        setTypeResolutionCache.get(candidateType);

                    if (isDefined(cachedResult)) {
                        return cachedResult;
                    }

                    if (setHas(seenTypes, candidateType)) {
                        return false;
                    }

                    seenTypes.add(candidateType);

                    if (candidateType.isUnion()) {
                        const isSetLike = candidateType.types.some((partType) =>
                            isSetTypeInternal(partType)
                        );
                        setTypeResolutionCache.set(candidateType, isSetLike);

                        return isSetLike;
                    }

                    if (candidateType.isIntersection()) {
                        const isSetLike = candidateType.types.some((partType) =>
                            isSetTypeInternal(partType)
                        );
                        setTypeResolutionCache.set(candidateType, isSetLike);

                        return isSetLike;
                    }

                    const symbolName = candidateType.getSymbol()?.getName();
                    if (symbolName === "ReadonlySet" || symbolName === "Set") {
                        setTypeResolutionCache.set(candidateType, true);

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
                        setTypeResolutionCache.set(candidateType, true);

                        return true;
                    }

                    if (!hasClassOrInterfaceLikeDeclaration(candidateType)) {
                        setTypeResolutionCache.set(candidateType, false);

                        return false;
                    }

                    const baseTypesResult = safeTypeOperation({
                        operation: () =>
                            getTypeCheckerBaseTypes(checker, candidateType),
                        reason: "set-has-base-type-analysis-failed",
                    });

                    if (!baseTypesResult.ok) {
                        setTypeResolutionCache.set(candidateType, false);

                        return false;
                    }

                    const baseTypes = baseTypesResult.value;

                    const isSetLike =
                        baseTypes?.some((baseType) =>
                            isSetTypeInternal(baseType)
                        ) ?? false;

                    setTypeResolutionCache.set(candidateType, isSetLike);

                    return isSetLike;
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

                        if (!isDefined(tsNode)) {
                            return false;
                        }

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
                        canAutofix: isTypePredicateAutofixSafe,
                        context,
                        importedName: "setHas",
                        imports: tsExtrasImports,
                        isMatchingObjectExpression: isSetLikeExpression,
                        memberName: "has",
                        messageId: "preferTsExtrasSetHas",
                        node,
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            context.report({
                                messageId: "preferTsExtrasSetHas",
                                node: suggestionNode,
                                suggest: [
                                    {
                                        fix,
                                        messageId: "suggestTsExtrasSetHas",
                                    },
                                ],
                            });
                        },
                        suggestionMessageId: "suggestTsExtrasSetHas",
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
                url: RULE_DOCS_URL,
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasSetHas:
                    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.",
                suggestTsExtrasSetHas:
                    "Replace this `set.has(...)` call with `setHas(...)` from `ts-extras`.",
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
