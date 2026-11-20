import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-merge`.
 */
import { collectNamedImportSpecifierBindingsFromSource } from "../_internal/import-analysis.js";
import { getMergeStyleIntersectionOperands } from "../_internal/merge-style-intersection.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import {
    isGlobalTypeReferenceNamed,
    unwrapParenthesizedTypeNode,
} from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const OMIT_TYPE_NAME = "Omit";
const unsupportedOperandTypes: ReadonlySet<AST_NODE_TYPES> = new Set([
    AST_NODE_TYPES.TSConstructorType,
    AST_NODE_TYPES.TSFunctionType,
    AST_NODE_TYPES.TSUnionType,
]);
const unsupportedMemberTypes: ReadonlySet<AST_NODE_TYPES> = new Set([
    AST_NODE_TYPES.TSCallSignatureDeclaration,
    AST_NODE_TYPES.TSConstructSignatureDeclaration,
    AST_NODE_TYPES.TSIndexSignature,
]);

/** Skip operands whose visible syntax can give Merge different semantics. */
const hasUnsupportedMergeShape = (
    operand: Readonly<TSESTree.TypeNode>
): boolean => {
    const node = unwrapParenthesizedTypeNode(operand);
    return (
        setContainsValue(unsupportedOperandTypes, node.type) ||
        (node.type === AST_NODE_TYPES.TSTypeLiteral &&
            node.members.some((member) =>
                setContainsValue(unsupportedMemberTypes, member.type)
            ))
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-merge`.
 */
const preferTypeFestMergeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const exceptReferences = new Set(
                collectNamedImportSpecifierBindingsFromSource({
                    allowTypeImportDeclaration: true,
                    allowTypeImportSpecifier: true,
                    sourceCode: context.sourceCode,
                    sourceModuleName: TYPE_FEST_MODULE_SOURCE,
                })
                    .filter((binding) => binding.importedName === "Except")
                    .flatMap(({ specifier }) =>
                        context.sourceCode.getDeclaredVariables(specifier)
                    )
                    .flatMap((variable) =>
                        variable.references.map(
                            (reference) => reference.identifier
                        )
                    )
            );

            return {
                'TSIntersectionType > TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (
                        node.typeName.type !== AST_NODE_TYPES.Identifier ||
                        (!setContainsValue(exceptReferences, node.typeName) &&
                            !isGlobalTypeReferenceNamed(
                                context,
                                node,
                                OMIT_TYPE_NAME
                            ))
                    ) {
                        return;
                    }

                    const operands = getMergeStyleIntersectionOperands(node);
                    if (
                        !operands ||
                        operands.some((operand) =>
                            hasUnsupportedMergeShape(operand)
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        data: { omitTypeName: node.typeName.name },
                        fix: null,
                        messageId: "preferMerge",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Merge over Omit/Except<Destination, keyof Source> & Source intersections.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge",
            },
            messages: {
                preferMerge:
                    "For plain object types, consider replacing the `{{omitTypeName}}<Destination, keyof Source>` and `Source` members with `Merge<Destination, Source>` from type-fest. Keep the other intersection members.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-merge",
    });

export default preferTypeFestMergeRule;
