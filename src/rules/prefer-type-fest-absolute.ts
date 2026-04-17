/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-absolute`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { setHas } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Common alias names used for numeric absolute-value type utilities.
 */
const ABSOLUTE_ALIAS_NAMES: ReadonlySet<string> = new Set([
    "Abs",
    "AbsoluteValue",
]);

/**
 * ESLint rule definition for `prefer-type-fest-absolute`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestAbsoluteRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        !setHas(ABSOLUTE_ALIAS_NAMES, node.typeName.name)
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "Absolute",
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        data: { aliasName: node.typeName.name },
                        fix: aliasReplacementFix,
                        messageId: "preferAbsolute",
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest `Absolute` over common `Abs` or `AbsoluteValue` aliases.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-absolute",
            },
            fixable: "code",
            messages: {
                preferAbsolute:
                    "Prefer `Absolute` from type-fest over `{{aliasName}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-absolute",
    });

/**
 * Default export for the `prefer-type-fest-absolute` rule module.
 */
export default preferTypeFestAbsoluteRule;
