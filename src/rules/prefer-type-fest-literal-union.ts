/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-literal-union`.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Primitive families supported by TypeFest `LiteralUnion`.
 */
type LiteralUnionFamily = "bigint" | "boolean" | "number" | "string";

/**
 * Ordered family candidates evaluated when scanning union members.
 */
const literalUnionFamilies = [
    "bigint",
    "boolean",
    "number",
    "string",
] as const satisfies readonly LiteralUnionFamily[];

/**
 * Checks whether a union member is the primitive keyword for a family.
 *
 * @param node - Member node to inspect.
 * @param family - Primitive family currently being matched.
 *
 * @returns `true` when the node is the corresponding keyword type.
 */
const isKeywordMemberForFamily = (
    node: Readonly<TSESTree.TypeNode>,
    family: LiteralUnionFamily
): boolean => {
    if (family === "bigint") {
        return node.type === "TSBigIntKeyword";
    }

    if (family === "boolean") {
        return node.type === "TSBooleanKeyword";
    }

    if (family === "number") {
        return node.type === "TSNumberKeyword";
    }

    return node.type === "TSStringKeyword";
};

/**
 * Checks whether a union member is a literal of the requested primitive family.
 *
 * @param node - Member node to inspect.
 * @param family - Primitive family currently being matched.
 *
 * @returns `true` when the node is a literal member compatible with the family
 *   (including bigint parser variants).
 */
const isLiteralMemberForFamily = (
    node: Readonly<TSESTree.TypeNode>,
    family: LiteralUnionFamily
): boolean => {
    if (node.type !== "TSLiteralType" || node.literal.type !== "Literal") {
        return false;
    }

    if (family === "bigint") {
        if (typeof node.literal.value === "bigint") {
            return true;
        }

        const literalWithPotentialBigInt = node.literal as TSESTree.Literal & {
            readonly bigint?: unknown;
        };

        return typeof literalWithPotentialBigInt.bigint === "string";
    }

    if (family === "boolean") {
        return typeof node.literal.value === "boolean";
    }

    if (family === "number") {
        return typeof node.literal.value === "number";
    }

    return typeof node.literal.value === "string";
};

/**
 * Determines whether a union is structurally replaceable with
 * `LiteralUnion<...>`.
 *
 * @param node - Union node to inspect.
 *
 * @returns `true` when all members belong to a single primitive family and the
 *   union includes at least one keyword member plus one literal member.
 */
const hasLiteralUnionShape = (
    node: Readonly<TSESTree.TSUnionType>
): boolean => {
    for (const family of literalUnionFamilies) {
        let allMembersAreFamilyMembers = true;
        let hasKeywordMember = false;
        let hasLiteralMember = false;

        for (const unionMember of node.types) {
            if (isKeywordMemberForFamily(unionMember, family)) {
                hasKeywordMember = true;
                continue;
            }

            if (isLiteralMemberForFamily(unionMember, family)) {
                hasLiteralMember = true;
                continue;
            }

            allMembersAreFamilyMembers = false;
            break;
        }

        if (
            allMembersAreFamilyMembers &&
            hasKeywordMember &&
            hasLiteralMember
        ) {
            return true;
        }
    }

    return false;
};

/**
 * Resolves which primitive family a replaceable literal union belongs to.
 *
 * @param node - Union node to inspect.
 *
 * @returns The matching family when the union has a `LiteralUnion`-compatible
 *   shape; otherwise `null`.
 */
const getLiteralUnionFamily = (
    node: Readonly<TSESTree.TSUnionType>
): LiteralUnionFamily | null => {
    for (const family of literalUnionFamilies) {
        let allMembersAreFamilyMembers = true;
        let hasKeywordMember = false;
        let hasLiteralMember = false;

        for (const unionMember of node.types) {
            if (isKeywordMemberForFamily(unionMember, family)) {
                hasKeywordMember = true;
                continue;
            }

            if (isLiteralMemberForFamily(unionMember, family)) {
                hasLiteralMember = true;
                continue;
            }

            allMembersAreFamilyMembers = false;
            break;
        }

        if (
            allMembersAreFamilyMembers &&
            hasKeywordMember &&
            hasLiteralMember
        ) {
            return family;
        }
    }

    return null;
};

/**
 * Builds `LiteralUnion<...>` text for a matched family.
 *
 * @param sourceCode - Source code instance used to preserve original literal
 *   formatting.
 * @param node - Union node being replaced.
 * @param family - Primitive family for the replacement's second generic
 *   argument.
 *
 * @returns Replacement text when at least one literal member exists; otherwise
 *   `null`.
 */
const getLiteralUnionReplacementText = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: Readonly<TSESTree.TSUnionType>,
    family: LiteralUnionFamily
): null | string => {
    const literalMembers = node.types.filter((member) =>
        isLiteralMemberForFamily(member, family)
    );

    if (literalMembers.length === 0) {
        return null;
    }

    const literalText =
        literalMembers.length === 1
            ? sourceCode.getText(literalMembers[0])
            : literalMembers
                  .map((member) => sourceCode.getText(member))
                  .join(" | ");

    return `LiteralUnion<${literalText}, ${family}>`;
};

/**
 * ESLint rule definition for `prefer-type-fest-literal-union`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestLiteralUnionRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                "type-fest"
            );

            return {
                TSUnionType(node) {
                    if (!hasLiteralUnionShape(node)) {
                        return;
                    }

                    const family = getLiteralUnionFamily(node);

                    if (!family) {
                        return;
                    }

                    const replacementText = getLiteralUnionReplacementText(
                        context.sourceCode,
                        node,
                        family
                    );

                    if (
                        replacementText === null ||
                        replacementText.length === 0
                    ) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeTextReplacementFix(
                        node,
                        "LiteralUnion",
                        replacementText,
                        typeFestDirectImports
                    );

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferLiteralUnion",
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
                    "require TypeFest LiteralUnion over unions that combine primitive keywords with same-family literal members.",
                frozen: false,
                recommended: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    'typefest.configs["type-fest/types"]',
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-literal-union",
            },
            fixable: "code",
            messages: {
                preferLiteralUnion:
                    "Prefer `LiteralUnion<...>` from type-fest over unions that mix primitive keywords and same-family literal members.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-literal-union",
    });

/**
 * Default export for the `prefer-type-fest-literal-union` rule module.
 */
export default preferTypeFestLiteralUnionRule;
