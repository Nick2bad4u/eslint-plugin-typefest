import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-is-tuple`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { getIsTupleTypeGuardInput } from "../_internal/type-guard-conditional-patterns.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const TYPE_NAME = "IsTuple" as const;

/** ESLint rule definition for `prefer-type-fest-is-tuple`. */
const preferTypeFestIsTupleRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSConditionalType(node: Readonly<TSESTree.TSConditionalType>) {
                    const checkedType = getIsTupleTypeGuardInput(node);

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
                        messageId: "preferIsTuple",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest IsTuple over manual length-based tuple conditional type guards.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-is-tuple",
            },
            fixable: "code",
            messages: {
                preferIsTuple:
                    "Prefer `IsTuple<T>` from type-fest over manual length-based tuple conditional type guards.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-is-tuple",
    });

export default preferTypeFestIsTupleRule;
