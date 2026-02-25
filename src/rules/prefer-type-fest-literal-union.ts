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

type LiteralUnionFamily = "bigint" | "boolean" | "number" | "string";

const literalUnionFamilies = [
    "bigint",
    "boolean",
    "number",
    "string",
] as const satisfies readonly LiteralUnionFamily[];

/**
 * Check whether the input is keyword member for family.
 *
 * @param node - Value to inspect.
 * @param family - Expected literal union family.
 *
 * @returns `true` when the value is matching keyword member.
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
 * Check whether the input is literal member for family.
 *
 * @param node - Value to inspect.
 * @param family - Expected literal union family.
 *
 * @returns `true` when the value is matching literal member.
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
 * Check whether has literal union shape.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when has literal union shape; otherwise `false`.
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
