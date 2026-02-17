import type { TSESTree } from "@typescript-eslint/utils";

import { collectImportedTypeAliasMatches } from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const BRAND_PROPERTY_NAMES = new Set([
    "__brand",
    "__tag",
    "brand",
]);
const taggedAliasReplacements = {
    Branded: "Tagged",
    Opaque: "Tagged",
} as const;

const hasAdHocBrandLiteral = (typeNode: TSESTree.TypeNode): boolean => {
    if (typeNode.type !== "TSIntersectionType") {
        return false;
    }

    return typeNode.types.some((member) => {
        if (member.type !== "TSTypeLiteral") {
            return false;
        }

        return member.members.some((literalMember) => {
            if (literalMember.type !== "TSPropertySignature") {
                return false;
            }

            const { key } = literalMember;
            return (
                key.type === "Identifier" && BRAND_PROPERTY_NAMES.has(key.name)
            );
        });
    });
};

const typeContainsTaggedReference = (typeNode: TSESTree.TypeNode): boolean => {
    if (
        typeNode.type === "TSTypeReference" &&
        typeNode.typeName.type === "Identifier" &&
        typeNode.typeName.name === "Tagged"
    ) {
        return true;
    }

    if (
        typeNode.type === "TSIntersectionType" ||
        typeNode.type === "TSUnionType"
    ) {
        return typeNode.types.some((member) =>
            typeContainsTaggedReference(member)
        );
    }

    return false;
};

const preferTypeFestTaggedBrandsRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                taggedAliasReplacements
            );

            return {
                TSTypeAliasDeclaration(node) {
                    if (typeContainsTaggedReference(node.typeAnnotation)) {
                        return;
                    }

                    if (!hasAdHocBrandLiteral(node.typeAnnotation)) {
                        return;
                    }

                    context.report({
                        data: {
                            alias: node.id.name,
                        },
                        messageId: "preferTaggedBrand",
                        node: node.id,
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
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        messageId: "preferTaggedAlias",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Tagged over ad-hoc intersection branding with __brand/__tag fields.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-tagged-brands.md",
            },
            messages: {
                preferTaggedAlias:
                    "Prefer `{{replacement}}` from type-fest over `{{alias}}`.",
                preferTaggedBrand:
                    "Type alias '{{alias}}' uses ad-hoc branding. Prefer `Tagged` from type-fest for branded primitive identifiers.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-tagged-brands",
    });

export default preferTypeFestTaggedBrandsRule;
