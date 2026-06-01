import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-is-unknown`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    getSingleTupleElementType,
    hasFalseTrueBranches,
} from "../_internal/type-guard-conditional-patterns.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const TYPE_NAME = "IsUnknown" as const;

const getIsUnknownTypeGuardInput = (
    node: Readonly<TSESTree.TSConditionalType>,
    sourceCode: Readonly<TSESLint.SourceCode>
): TSESTree.TypeNode | undefined => {
    if (
        node.checkType.type !== AST_NODE_TYPES.TSUnknownKeyword ||
        node.trueType.type !== AST_NODE_TYPES.TSConditionalType ||
        !hasFalseTrueBranches(node.trueType) ||
        node.falseType.type !== AST_NODE_TYPES.TSLiteralType ||
        node.falseType.literal.type !== AST_NODE_TYPES.Literal ||
        node.falseType.literal.value !== false
    ) {
        return undefined;
    }

    const innerCheckedType = getSingleTupleElementType(node.trueType.checkType);
    const innerExtendsType = getSingleTupleElementType(
        node.trueType.extendsType
    );

    if (!innerCheckedType) {
        return undefined;
    }

    if (
        innerExtendsType?.type !== AST_NODE_TYPES.TSNullKeyword ||
        sourceCode.getText(innerCheckedType) !==
            sourceCode.getText(node.extendsType)
    ) {
        return undefined;
    }

    return node.extendsType;
};

/** ESLint rule definition for `prefer-type-fest-is-unknown`. */
const preferTypeFestIsUnknownRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSConditionalType(node: Readonly<TSESTree.TSConditionalType>) {
                    const checkedType = getIsUnknownTypeGuardInput(
                        node,
                        context.sourceCode
                    );

                    if (!checkedType) {
                        return;
                    }

                    const checkedTypeText =
                        context.sourceCode.getText(checkedType);
                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        TYPE_NAME,
                        `${TYPE_NAME}<${checkedTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferIsUnknown",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest IsUnknown over manual unknown conditional type guards.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-is-unknown",
            },
            fixable: "code",
            messages: {
                preferIsUnknown:
                    "Prefer `IsUnknown<T>` from type-fest over manual unknown conditional type guards.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-is-unknown",
    });

export default preferTypeFestIsUnknownRule;
