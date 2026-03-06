/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-set-has`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";
import ts from "typescript";

import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import { setContainsValue } from "../_internal/set-membership.js";
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

const UNION_SET_MATCHING_MODE_ALL_BRANCHES = "allBranches";
const UNION_SET_MATCHING_MODE_ANY_BRANCH = "anyBranch";
const DEFAULT_UNION_SET_MATCHING_MODE = UNION_SET_MATCHING_MODE_ALL_BRANCHES;
const unionSetMatchingModeValues = [
    UNION_SET_MATCHING_MODE_ALL_BRANCHES,
    UNION_SET_MATCHING_MODE_ANY_BRANCH,
] as const;

type PreferTsExtrasSetHasOption = Readonly<{
    unionBranchMatchingMode?: UnionSetMatchingMode;
}>;

type UnionSetMatchingMode = (typeof unionSetMatchingModeValues)[number];

const getHasCallReceiverExpression = (
    node: Readonly<TSESTree.CallExpression>
): null | Readonly<TSESTree.Expression> => {
    const callee = node.callee;

    if (callee.type !== "MemberExpression" || callee.computed) {
        return null;
    }

    if (
        callee.property.type !== "Identifier" ||
        callee.property.name !== "has"
    ) {
        return null;
    }

    if (callee.object.type === "Super") {
        return null;
    }

    return callee.object;
};

/**
 * ESLint rule definition for `prefer-ts-extras-set-has`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasSetHasRule: ReturnType<typeof createTypedRule> =
    createTypedRule<
        readonly [PreferTsExtrasSetHasOption],
        "preferTsExtrasSetHas" | "suggestTsExtrasSetHas"
    >({
        create(
            context,
            [options] = [
                {
                    unionBranchMatchingMode: DEFAULT_UNION_SET_MATCHING_MODE,
                },
            ]
        ) {
            const unionSetMatchingMode: UnionSetMatchingMode =
                options.unionBranchMatchingMode ??
                DEFAULT_UNION_SET_MATCHING_MODE;

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);
            const setTypeResolutionCaches: Readonly<
                Record<UnionSetMatchingMode, Map<Readonly<ts.Type>, boolean>>
            > = {
                [UNION_SET_MATCHING_MODE_ALL_BRANCHES]: new Map<
                    Readonly<ts.Type>,
                    boolean
                >(),
                [UNION_SET_MATCHING_MODE_ANY_BRANCH]: new Map<
                    Readonly<ts.Type>,
                    boolean
                >(),
            };

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
            const isSetType = (
                type: Readonly<ts.Type>,
                unionMatchingMode: UnionSetMatchingMode
            ): boolean => {
                const setTypeResolutionCache =
                    setTypeResolutionCaches[unionMatchingMode];

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

                    if (setContainsValue(seenTypes, candidateType)) {
                        return false;
                    }

                    seenTypes.add(candidateType);

                    if (candidateType.isUnion()) {
                        const isSetLike =
                            unionMatchingMode ===
                            UNION_SET_MATCHING_MODE_ALL_BRANCHES
                                ? candidateType.types.every((partType) =>
                                      isSetTypeInternal(partType)
                                  )
                                : candidateType.types.some((partType) =>
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
                expression: Readonly<TSESTree.Expression>,
                unionMatchingMode: UnionSetMatchingMode
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

                        return isSetType(objectType, unionMatchingMode);
                    },
                    reason: "set-has-type-analysis-failed",
                });

                return result.ok && result.value;
            };

            const canReplaceHasCallWithSetHas = (
                node: Readonly<TSESTree.CallExpression>
            ): boolean => {
                const receiverExpression = getHasCallReceiverExpression(node);

                if (receiverExpression === null) {
                    return false;
                }

                return isSetLikeExpression(
                    receiverExpression,
                    DEFAULT_UNION_SET_MATCHING_MODE
                );
            };

            return {
                CallExpression(node) {
                    reportTsExtrasTypedMemberCall({
                        canAutofix: (callNode) =>
                            isTypePredicateAutofixSafe(callNode) &&
                            canReplaceHasCallWithSetHas(callNode),
                        context,
                        importedName: "setHas",
                        imports: tsExtrasImports,
                        isMatchingObjectExpression: (expression) =>
                            isSetLikeExpression(
                                expression,
                                unionSetMatchingMode
                            ),
                        memberName: "has",
                        messageId: "preferTsExtrasSetHas",
                        node,
                        reportSuggestion: ({ fix, node: suggestionNode }) => {
                            if (!canReplaceHasCallWithSetHas(suggestionNode)) {
                                context.report({
                                    messageId: "preferTsExtrasSetHas",
                                    node: suggestionNode,
                                });

                                return;
                            }

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
        defaultOptions: [
            {
                unionBranchMatchingMode: DEFAULT_UNION_SET_MATCHING_MODE,
            },
        ],
        meta: {
            defaultOptions: [
                {
                    unionBranchMatchingMode: DEFAULT_UNION_SET_MATCHING_MODE,
                },
            ],
            deprecated: false,
            docs: {
                description:
                    "require direct ts-extras setHas over Set#has at membership call sites for stronger element narrowing.",
                frozen: false,
                recommended: true,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
            },
            fixable: "code",
            hasSuggestions: true,
            messages: {
                preferTsExtrasSetHas:
                    "Prefer `setHas` from `ts-extras` over `set.has(...)` for stronger element narrowing.",
                suggestTsExtrasSetHas:
                    "Replace this `set.has(...)` call with `setHas(...)` from `ts-extras`.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for mixed-union matching in prefer-ts-extras-set-has.",
                    minProperties: 1,
                    properties: {
                        unionBranchMatchingMode: {
                            description:
                                "How union-typed receivers are matched: allBranches requires every union branch to be Set-like, anyBranch reports when at least one branch is Set-like.",
                            enum: [...unionSetMatchingModeValues],
                            type: "string",
                        },
                    },
                    type: "object",
                },
            ],
            type: "suggestion",
        },
        name: "prefer-ts-extras-set-has",
    });

/**
 * Default export for the `prefer-ts-extras-set-has` rule module.
 */
export default preferTsExtrasSetHasRule;
