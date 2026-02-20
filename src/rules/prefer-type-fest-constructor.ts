/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-constructor`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-constructor`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestConstructorRule: ReturnType<typeof createTypedRule> =
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
            const { sourceCode } = context;

            return {
                TSConstructorType(node) {
                    if (node.abstract) {
                        return;
                    }

                    const replacementFix =
                        node.typeParameters === undefined &&
                        node.returnType !== undefined
                            ? createSafeTypeNodeTextReplacementFix(
                                  node,
                                  "Constructor",
                                  `Constructor<${sourceCode.getText(node.returnType.typeAnnotation)}, [${node.params.map((parameter) => sourceCode.getText(parameter)).join(", ")}]>`,
                                  typeFestDirectImports
                              )
                            : null;

                    context.report({
                        ...(replacementFix ? { fix: replacementFix } : {}),
                        messageId: "preferConstructorSignature",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest Constructor over explicit `new (...) => ...` constructor signatures.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-constructor.md",
            },
            fixable: "code",
            messages: {
                preferConstructorSignature:
                    "Prefer `Constructor<...>` from type-fest over explicit `new (...) => ...` constructor signatures.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-constructor",
    });

/**
 * Default export for the `prefer-type-fest-constructor` rule module.
 */
export default preferTypeFestConstructorRule;
