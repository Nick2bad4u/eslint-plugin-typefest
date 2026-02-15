import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

/**
 * @param {string} text
 * @returns {string}
 */
const normalizeTypeText = (text) => text.replaceAll(/\s+/gv, "");

const preferTypeFestValueOfRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";

        if (isTestFilePath(filePath)) {
            return {};
        }

        const { sourceCode } = context;

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSIndexedAccessType} node
             */
            TSIndexedAccessType(node) {
                if (
                    node.indexType.type !== "TSTypeOperator" ||
                    node.indexType.operator !== "keyof"
                ) {
                    return;
                }

                const objectTypeText = normalizeTypeText(
                    sourceCode.getText(node.objectType)
                );
                const keyOfTargetText = normalizeTypeText(
                    sourceCode.getText(node.indexType.typeAnnotation)
                );

                if (objectTypeText !== keyOfTargetText) {
                    return;
                }

                context.report({
                    messageId: "preferValueOf",
                    node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest ValueOf over direct T[keyof T] indexed-access unions for object value extraction.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-value-of.md",
        },
        schema: [],
        messages: {
            preferValueOf:
                "Prefer `ValueOf<T>` from type-fest over `T[keyof T]` for object value unions.",
        },
    },
    name: "prefer-type-fest-value-of",
});

export default preferTypeFestValueOfRule;
