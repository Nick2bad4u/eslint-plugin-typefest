/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-string-split`.
 */
import type ts from "typescript";

import { isDefined } from "ts-extras";

import {
    collectDirectNamedValueImportsFromSource,
    createMethodToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "../_internal/member-call.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerStringType,
} from "../_internal/type-checker-compat.js";
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

            /**
             * Determine whether a type behaves like a string, traversing
             * unions/intersections and apparent types while guarding cycles.
             */
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

                    if (
                        isDefined(stringPrimitiveType) &&
                        isTypeAssignableTo(
                            checker,
                            candidateType,
                            stringPrimitiveType
                        )
                    ) {
                        return true;
                    }

                    if (candidateType.getSymbol()?.getName() === "String") {
                        return true;
                    }

                    const apparentType = getTypeCheckerApparentType(
                        checker,
                        candidateType
                    );
                    return !isDefined(apparentType) ||
                        apparentType === candidateType
                        ? false
                        : isStringLikeTypeInternal(apparentType);
                };

                return isStringLikeTypeInternal(type);
            };

            return {
                CallExpression(node) {
                    const splitCall = getIdentifierPropertyMemberCall({
                        memberName: "split",
                        node,
                    });

                    if (splitCall === null) {
                        return;
                    }

                    const callCallee = splitCall.callee;

                    const result = safeTypeOperation({
                        operation: () => {
                            const tsNode =
                                parserServices.esTreeNodeToTSNodeMap.get(
                                    callCallee.object
                                );
                            const objectType =
                                checker.getTypeAtLocation(tsNode);

                            return isStringLikeType(objectType);
                        },
                        reason: "string-split-type-analysis-failed",
                    });

                    if (!result.ok || !result.value) {
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
