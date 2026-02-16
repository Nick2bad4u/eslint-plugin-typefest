import { type TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const isReflectHasCall = (node: TSESTree.CallExpression): boolean => {
    if (node.callee.type !== "MemberExpression" || node.callee.computed) {
        return false;
    }

    return (
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "Reflect" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "has"
    );
};

const preferTsExtrasObjectHasInRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        name: "prefer-ts-extras-object-has-in",
        meta: {
            type: "suggestion",
            docs: {
                description:
                    "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-has-in.md",
            },
            schema: [],
            messages: {
                preferTsExtrasObjectHasIn:
                    "Prefer `objectHasIn` from `ts-extras` over `Reflect.has` for better type narrowing.",
            },
        },
        defaultOptions: [],
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                CallExpression(node) {
                    if (!isReflectHasCall(node)) {
                        return;
                    }

                    if (node.arguments.length < 2) {
                        return;
                    }

                    context.report({
                        node,
                        messageId: "preferTsExtrasObjectHasIn",
                    });
                },
            };
        },
    });

export default preferTsExtrasObjectHasInRule;
