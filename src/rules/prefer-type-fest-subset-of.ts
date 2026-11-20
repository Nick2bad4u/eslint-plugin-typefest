/** @packageDocumentation ESLint rule for SubsetOf. */
import type { TSESTree } from "@typescript-eslint/utils";

import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

const plainReference = (
    node: Readonly<TSESTree.TypeNode>,
    name: string
): boolean =>
    isIdentifierTypeReference(node, name) && node.typeArguments === undefined;

/**
 * Prefer TypeFest SubsetOf for an identity alias that constrains its second
 * type parameter to its first.
 */
const preferTypeFestSubsetOfRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            return {
                TSTypeAliasDeclaration(node) {
                    const parameters = node.typeParameters?.params;
                    if (parameters?.length !== 2) return;
                    const [target, value] = parameters;
                    if (
                        target &&
                        value?.constraint &&
                        plainReference(value.constraint, target.name.name) &&
                        plainReference(node.typeAnnotation, value.name.name)
                    ) {
                        report(
                            node.typeAnnotation,
                            "SubsetOf",
                            target.name.name,
                            value.name.name
                        );
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest SubsetOf for an identity alias that constrains its second type parameter to its first.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-subset-of",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-subset-of",
    });
export default preferTypeFestSubsetOfRule;
