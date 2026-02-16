import { type TSESTree } from "@typescript-eslint/utils";

import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const PROMISABLE_TYPE_NAME = "Promisable";
const PROMISE_TYPE_NAME = "Promise";
const promisableAliasReplacements = {
    MaybePromise: "Promisable",
} as const;

const isIdentifierTypeReference = (
    node: TSESTree.TypeNode,
    expectedTypeName: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

const getPromiseInnerType = (
    node: TSESTree.TypeNode
): TSESTree.TypeNode | null => {
    if (!isIdentifierTypeReference(node, PROMISE_TYPE_NAME)) {
        return null;
    }

    return node.typeArguments?.params[0] ?? null;
};

const preferTypeFestPromisableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-type-fest-promisable",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest Promisable for sync-or-async callback contracts currently expressed as Promise<T> | T unions.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-promisable.md",
            },
            schema: [],
            messages: {
                preferPromisable:
                    "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
            },
        },
        defaultOptions: [],
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
                        node,
                        messageId: "preferPromisable",
                    });
                },
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
                        node,
                        messageId: "preferPromisable",
                    });
                },
            };
        },
    });

export default preferTypeFestPromisableRule;
