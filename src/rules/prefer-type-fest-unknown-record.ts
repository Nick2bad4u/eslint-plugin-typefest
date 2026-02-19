/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-record`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.js";

/**
 * Check whether the input is record string unknown.
 *
 * @param node - Value to inspect.
 *
 * @returns `true` when the value is record string unknown; otherwise `false`.
 */

const isRecordStringUnknown = (node: TSESTree.TSTypeReference): boolean => {
    if (
        node.typeName.type !== "Identifier" ||
        node.typeName.name !== "Record" ||
        node.typeArguments?.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = node.typeArguments.params;
    return (
        keyType?.type === "TSStringKeyword" &&
        valueType?.type === "TSUnknownKeyword"
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-record`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownRecordRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const filePath = context.filename ?? "";

            if (isTestFilePath(filePath)) {
                return {};
            }

            return {
                TSTypeReference(node) {
                    if (!isRecordStringUnknown(node)) {
                        return;
                    }

                    context.report({
                        messageId: "preferUnknownRecord",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            docs: {
                description:
                    "require TypeFest UnknownRecord over Record<string, unknown> in architecture-critical layers.",
                url: "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules/prefer-type-fest-unknown-record.md",
            },
            messages: {
                preferUnknownRecord:
                    "Prefer `UnknownRecord` from type-fest over `Record<string, unknown>` for clearer intent and stronger shared typing conventions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-record",
    });

/**
 * Default export for the `prefer-type-fest-unknown-record` rule module.
 */
export default preferTypeFestUnknownRecordRule;
