import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const BRAND_PROPERTY_NAMES = new Set([
    "__brand",
    "__tag",
    "brand",
]);

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
        name: "prefer-type-fest-tagged-brands",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require TypeFest Tagged over ad-hoc intersection branding with __brand/__tag fields.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-tagged-brands.md",
            },
            schema: [],
            messages: {
                preferTaggedBrand:
                    "Type alias '{{alias}}' uses ad-hoc branding. Prefer `Tagged` from type-fest for branded primitive identifiers.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSTypeAliasDeclaration(node) {
                    if (typeContainsTaggedReference(node.typeAnnotation)) {
                        return;
                    }

                    if (!hasAdHocBrandLiteral(node.typeAnnotation)) {
                        return;
                    }

                    context.report({
                        node: node.id,
                        messageId: "preferTaggedBrand",
                        data: {
                            alias: node.id.name,
                        },
                    });
                },
            };
        },
    });

export default preferTypeFestTaggedBrandsRule;
