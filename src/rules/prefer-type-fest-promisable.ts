/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-promisable`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const PROMISABLE_TYPE_NAME = "Promisable";
const PROMISE_TYPE_NAME = "Promise";
const promisableAliasReplacements = {
    MaybePromise: "Promisable",
} as const;

/**
 * Check whether the input is identifier type reference.
 *
 * @param node - Value to inspect.
 * @param expectedTypeName - Value to inspect.
 *
 * @returns `true` when the value is identifier type reference; otherwise `false`.
 */

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * GetPromiseInnerType helper.
 *
 * @param node - Value to inspect.
 *
 * @returns GetPromiseInnerType helper result.
 */

const getPromiseInnerType = (
    node: TSESTree.TypeNode
): null | TSESTree.TypeNode => {
    if (!isIdentifierTypeReference(node, PROMISE_TYPE_NAME)) {
        return null;
    }

    return node.typeArguments?.params[0] ?? null;
};

/**
 * ESLint rule definition for `prefer-type-fest-promisable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestPromisableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const { sourceCode } = context;
            const importedAliasMatches = collectImportedTypeAliasMatches(
                sourceCode,
                promisableAliasReplacements
            );

            return {
                TSTypeReference(node) {
                    if (node.typeName.type !== "Identifier") {
                        return;
                    }

                    const importedAliasMatch = importedAliasMatches.get(
                        node.typeName.name
                    );
                    if (!importedAliasMatch) {
                        return;
                    }

                    context.report({
                        messageId: "preferPromisable",
                        node,
                    });
                },
                TSUnionType(node) {
                    if (node.types.length !== 2) {
                        return;
                    }

                    const [firstMember, secondMember] = node.types;
                    if (!firstMember || !secondMember) {
                        return;
                    }

                    if (
                        node.types.some((member) =>
                            isIdentifierTypeReference(
                                member,
                                PROMISABLE_TYPE_NAME
                            )
                        )
                    ) {
                        return;
                    }

                    const firstPromiseInner = getPromiseInnerType(firstMember);
                    const secondPromiseInner =
                        getPromiseInnerType(secondMember);

                    const pair =
                        firstPromiseInner && !secondPromiseInner
                            ? {
                                  promiseInner: firstPromiseInner,
                                  synchronousMember: secondMember,
                              }
                            : !firstPromiseInner && secondPromiseInner
                              ? {
                                    promiseInner: secondPromiseInner,
                                    synchronousMember: firstMember,
                                }
                              : null;

                    if (pair === null) {
                        return;
                    }

                    const { promiseInner, synchronousMember } = pair;

                    if (
                        synchronousMember.type === "TSNeverKeyword" ||
                        synchronousMember.type === "TSNullKeyword" ||
                        synchronousMember.type === "TSUndefinedKeyword"
                    ) {
                        return;
                    }

                    const promiseInnerText = sourceCode.getText(promiseInner);
                    const synchronousMemberText =
                        sourceCode.getText(synchronousMember);

                    if (promiseInnerText !== synchronousMemberText) {
                        return;
                    }

                    context.report({
                        messageId: "preferPromisable",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Promisable for sync-or-async callback contracts currently expressed as Promise<T> | T unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-promisable.md",
            },
            messages: {
                preferPromisable:
                    "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-promisable",
    });

/**
 * Default export for the `prefer-type-fest-promisable` rule module.
 */
export default preferTypeFestPromisableRule;

