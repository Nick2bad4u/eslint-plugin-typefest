import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const preferTsExtrasObjectHasOwnRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";

        if (isTestFilePath(filePath)) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const { callee } = node;

                if (
                    callee.type !== "MemberExpression" ||
                    callee.computed ||
                    callee.object.type !== "Identifier" ||
                    callee.object.name !== "Object" ||
                    callee.property.type !== "Identifier" ||
                    callee.property.name !== "hasOwn"
                ) {
                    return;
                }

                context.report({
                    messageId: "preferTsExtrasObjectHasOwn",
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
                "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-has-own.md",
        },
        schema: [],
        messages: {
            preferTsExtrasObjectHasOwn:
                "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
        },
    },
    name: "prefer-ts-extras-object-has-own",
});

export default preferTsExtrasObjectHasOwnRule;
