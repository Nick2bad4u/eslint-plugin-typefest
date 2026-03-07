/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-string-split`.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import { isDefined } from "ts-extras";

import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import { setContainsValue } from "../_internal/set-membership.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerStringType,
} from "../_internal/type-checker-compat.js";
import { reportTsExtrasTypedMemberCall } from "../_internal/typed-member-call-rule.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isTypeAssignableTo,
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
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);
            const stringPrimitiveType = getTypeCheckerStringType(checker);
            const stringTypeResolutionCache = new Map<
                Readonly<ts.Type>,
                boolean
            >();

            /**
             * Determine whether a type behaves like a string, traversing
             * unions/intersections and apparent types while guarding cycles.
             */
            const isStringLikeType = (
                type: Readonly<ReturnType<typeof checker.getTypeAtLocation>>
            ): boolean => {
                const cachedRootResult = stringTypeResolutionCache.get(type);

                if (isDefined(cachedRootResult)) {
                    return cachedRootResult;
                }

                const seenTypes = new Set<ts.Type>();

                const isStringLikeTypeInternal = (
                    candidateType: Readonly<ts.Type>
                ): boolean => {
                    const cachedResult =
                        stringTypeResolutionCache.get(candidateType);

                    if (isDefined(cachedResult)) {
                        return cachedResult;
                    }

                    if (setContainsValue(seenTypes, candidateType)) {
                        return false;
                    }

                    seenTypes.add(candidateType);

                    if (candidateType.isUnion()) {
                        const isStringLike = candidateType.types.some(
                            (partType) => isStringLikeTypeInternal(partType)
                        );

                        stringTypeResolutionCache.set(
                            candidateType,
                            isStringLike
                        );

                        return isStringLike;
                    }

                    if (candidateType.isIntersection()) {
                        const isStringLike = candidateType.types.some(
                            (partType) => isStringLikeTypeInternal(partType)
                        );

                        stringTypeResolutionCache.set(
                            candidateType,
                            isStringLike
                        );

                        return isStringLike;
                    }

                    if (
                        isDefined(stringPrimitiveType) &&
                        isTypeAssignableTo(
                            checker,
                            candidateType,
                            stringPrimitiveType
                        )
                    ) {
                        stringTypeResolutionCache.set(candidateType, true);

                        return true;
                    }

                    if (candidateType.getSymbol()?.getName() === "String") {
                        stringTypeResolutionCache.set(candidateType, true);

                        return true;
                    }

                    const apparentType = getTypeCheckerApparentType(
                        checker,
                        candidateType
                    );

                    const isStringLike =
                        !isDefined(apparentType) ||
                        apparentType === candidateType
                            ? false
                            : isStringLikeTypeInternal(apparentType);

                    stringTypeResolutionCache.set(candidateType, isStringLike);

                    return isStringLike;
                };

                return isStringLikeTypeInternal(type);
            };

            const isStringLikeExpression = (
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

                        return isStringLikeType(objectType);
                    },
                    reason: "string-split-type-analysis-failed",
                });

                return result.ok && result.value;
            };

            return {
                'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.type="Identifier"][callee.property.name="split"]'(
                    node
                ) {
                    reportTsExtrasTypedMemberCall({
                        context,
                        importedName: "stringSplit",
                        imports: tsExtrasImports,
                        isMatchingObjectExpression: isStringLikeExpression,
                        memberName: "split",
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
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
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
