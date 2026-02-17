import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

const preferTsExtrasObjectHasOwnRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
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
            docs: {
                description:
                    "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-object-has-own.md",
            },
            messages: {
                preferTsExtrasObjectHasOwn:
                    "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-has-own",
    });

export default preferTsExtrasObjectHasOwnRule;
