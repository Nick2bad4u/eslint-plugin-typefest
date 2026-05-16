import type { TSESTree } from "@typescript-eslint/utils";

import { assertNever } from "ts-extras";

/**
 * @packageDocumentation
 * Shared rule factory for `prefer-type-fest-*keys-of` rule modules.
 */
import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "./imported-type-aliases.js";
import {
    getExcludeKeyExtractionInputType,
    getMappedKeyExtractionInputType,
} from "./key-extraction-type-patterns.js";
import { TYPE_FEST_MODULE_SOURCE } from "./module-source.js";
import { reportWithOptionalFix } from "./rule-reporting.js";
import { createTypedRule } from "./typed-rule.js";

type KeyExtractionPattern =
    | Readonly<{
          guardTypeName: string;
          kind: "mapped-guard";
      }>
    | Readonly<{
          keysOfTypeName: string;
          kind: "exclude-keys";
      }>;

type KeysOfRuleOptions = Readonly<{
    keyKind: string;
    messageId: string;
    preferredTypeName: string;
    ruleName: `prefer-type-fest-${string}-keys-of`;
    sourcePattern: KeyExtractionPattern;
}>;

const getSourceTypeName = (sourcePattern: KeyExtractionPattern): string => {
    switch (sourcePattern.kind) {
        case "exclude-keys": {
            return sourcePattern.keysOfTypeName;
        }
        case "mapped-guard": {
            return sourcePattern.guardTypeName;
        }
        default: {
            return assertNever(sourcePattern);
        }
    }
};

/**
 * Create a rule that replaces exact TypeFest helper compositions with the
 * matching `*KeysOf<T>` type.
 */
export const createPreferTypeFestKeysOfRule = ({
    keyKind,
    messageId,
    preferredTypeName,
    ruleName,
    sourcePattern,
}: KeysOfRuleOptions): ReturnType<typeof createTypedRule> => {
    const sourceTypeName = getSourceTypeName(sourcePattern);

    return createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const sourceTypeLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                sourceTypeName
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            return {
                TSConditionalType(node: Readonly<TSESTree.TSConditionalType>) {
                    const inputType =
                        sourcePattern.kind === "mapped-guard"
                            ? getMappedKeyExtractionInputType(
                                  node,
                                  sourceTypeLocalNames,
                                  typeFestNamespaceImportNames,
                                  sourcePattern.guardTypeName,
                                  context.sourceCode
                              )
                            : getExcludeKeyExtractionInputType(
                                  node,
                                  sourceTypeLocalNames,
                                  typeFestNamespaceImportNames,
                                  sourcePattern.keysOfTypeName,
                                  context.sourceCode
                              );

                    if (!inputType) {
                        return;
                    }

                    const inputTypeText = context.sourceCode.getText(inputType);
                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        preferredTypeName,
                        `${preferredTypeName}<${inputTypeText}>`,
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
                description: `require TypeFest ${preferredTypeName} over expanded ${keyKind}-key extraction helpers.`,
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
                [messageId]: `Prefer \`${preferredTypeName}<T>\` from type-fest over expanded ${keyKind}-key extraction helpers.`,
            },
            schema: [],
            type: "suggestion",
        },
        name: ruleName,
    });
};
