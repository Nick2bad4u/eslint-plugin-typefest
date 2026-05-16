import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * Shared rule factory for `prefer-type-fest-has-*keys` rule modules.
 */
import { getHasKeysInputType } from "./has-keys-type-patterns.js";
import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "./imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "./module-source.js";
import { reportWithOptionalFix } from "./rule-reporting.js";
import { createTypedRule } from "./typed-rule.js";

type HasKeysRuleOptions = Readonly<{
    hasKeysTypeName: string;
    keysOfTypeName: string;
    messageId: string;
    ruleName: `prefer-type-fest-has-${string}-keys`;
}>;

const toKeyKind = (keysOfTypeName: string): string => {
    switch (keysOfTypeName) {
        case "OptionalKeysOf": {
            return "optional";
        }
        case "ReadonlyKeysOf": {
            return "readonly";
        }
        case "RequiredKeysOf": {
            return "required";
        }
        case "WritableKeysOf": {
            return "writable";
        }
        default: {
            return "matching";
        }
    }
};

/**
 * Create a rule that replaces `KeysOf<T> extends never ? false : true` with the
 * matching TypeFest `Has*Keys<T>` type.
 */
export const createPreferTypeFestHasKeysRule = ({
    hasKeysTypeName,
    keysOfTypeName,
    messageId,
    ruleName,
}: HasKeysRuleOptions): ReturnType<typeof createTypedRule> => {
    const keyKind = toKeyKind(keysOfTypeName);

    return createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const keysOfLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                keysOfTypeName
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            return {
                TSConditionalType(node: Readonly<TSESTree.TSConditionalType>) {
                    const inputType = getHasKeysInputType(
                        node,
                        keysOfLocalNames,
                        typeFestNamespaceImportNames,
                        keysOfTypeName
                    );

                    if (!inputType) {
                        return;
                    }

                    const inputTypeText = context.sourceCode.getText(inputType);
                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        hasKeysTypeName,
                        `${hasKeysTypeName}<${inputTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId,
                        node,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description: `require TypeFest ${hasKeysTypeName} over ${keysOfTypeName}<T> emptiness checks.`,
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: `https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/${ruleName}`,
            },
            fixable: "code",
            messages: {
                [messageId]: `Prefer \`${hasKeysTypeName}<T>\` from type-fest over \`${keysOfTypeName}<T> extends never ? false : true\` ${keyKind}-key checks.`,
            },
            schema: [],
            type: "suggestion",
        },
        name: ruleName,
    });
};
