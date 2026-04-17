/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert-never`.
 */
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
    getFunctionCallArgumentText,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import {
    reportWithOptionalFix,
    reportWithTypefestPolicy,
} from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-assert-never`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasAssertNeverRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                VariableDeclaration(node) {
                    // Only handle const statements with a single declarator
                    if (
                        node.kind !== "const" ||
                        node.declarations.length !== 1
                    ) {
                        return;
                    }

                    const [declarator] = node.declarations;

                    // Guard: declarator must exist and have an Identifier id
                    if (declarator?.id.type !== "Identifier") {
                        return;
                    }

                    // Guard: the id must have a `never` type annotation
                    const { typeAnnotation } = declarator.id;
                    if (
                        typeAnnotation?.typeAnnotation.type !== "TSNeverKeyword"
                    ) {
                        return;
                    }

                    // Guard: there must be an initializer
                    const { init } = declarator;
                    if (!init) {
                        return;
                    }

                    const initArgumentText = getFunctionCallArgumentText({
                        argumentNode: init,
                        sourceCode: context.sourceCode,
                    });

                    if (initArgumentText === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssertNever",
                            node,
                        });

                        return;
                    }

                    const replacementFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "assertNever",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}(${initArgumentText})`,
                            reportFixIntent: "suggestion",
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        });

                    if (replacementFix === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssertNever",
                            node,
                        });

                        return;
                    }

                    reportWithTypefestPolicy({
                        context,
                        descriptor: {
                            messageId: "preferTsExtrasAssertNever",
                            node,
                            suggest: [
                                {
                                    fix: replacementFix,
                                    messageId: "suggestTsExtrasAssertNever",
                                },
                            ],
                        },
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras assertNever over manual `const _: never = value` exhaustiveness checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert-never",
            },
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssertNever:
                    "Prefer `assertNever` from `ts-extras` over a manual `const _: never` exhaustiveness assertion.",
                suggestTsExtrasAssertNever:
                    "Replace this manual exhaustiveness check with `assertNever(...)` from `ts-extras`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert-never",
    });

/**
 * Default export for the `prefer-ts-extras-assert-never` rule module.
 */
export default preferTsExtrasAssertNeverRule;
