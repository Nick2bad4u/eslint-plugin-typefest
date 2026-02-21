import {
    collectDirectNamedValueImportsFromSource,
    createMethodToFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-string-split`.
 */
import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-string-split`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasStringSplitRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";
            if (isTestFilePath(filePath)) {
                return {};
            }

            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                "ts-extras"
            );

            const { checker, parserServices } = getTypedRuleServices(context);

            const isStringLikeType = (
                type: ReturnType<typeof checker.getTypeAtLocation>
            ): boolean => {
                if (type.isUnion()) {
                    return type.types.some((partType) =>
                        isStringLikeType(partType)
                    );
                }

                const typeText = checker.typeToString(type);
                return (
                    typeText === "string" ||
                    typeText === "String" ||
                    typeText.startsWith('"')
                );
            };

            return {
                CallExpression(node) {
                    if (
                        node.callee.type !== "MemberExpression" ||
                        node.callee.computed
                    ) {
                        return;
                    }

                    if (
                        node.callee.property.type !== "Identifier" ||
                        node.callee.property.name !== "split"
                    ) {
                        return;
                    }

                    try {
                        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                            node.callee.object
                        );
                        const objectType = checker.getTypeAtLocation(tsNode);

                        if (!isStringLikeType(objectType)) {
                            return;
                        }
                    } catch {
                        return;
                    }

                    context.report({
                        fix: createMethodToFunctionCallFix({
                            callNode: node,
                            context,
                            importedName: "stringSplit",
                            imports: tsExtrasImports,
                            sourceModuleName: "ts-extras",
                        }),
                        messageId: "preferTsExtrasStringSplit",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require ts-extras stringSplit over String#split for stronger tuple inference.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-ts-extras-string-split.md",
            },
            fixable: "code",
            messages: {
                preferTsExtrasStringSplit:
                    "Prefer `stringSplit` from `ts-extras` over `string.split(...)` for stronger tuple inference.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-string-split",
    });

/**
 * Default export for the `prefer-ts-extras-string-split` rule module.
 */
export default preferTsExtrasStringSplitRule;
