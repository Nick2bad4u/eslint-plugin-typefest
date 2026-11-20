/**
 * @packageDocumentation
 * Prefer RequireNone over a mapped type that forbids a set of keys.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isDefined } from "ts-extras";

import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isTypeParameterReference } from "../_internal/type-parameter-reference.js";
import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Match an optional-never map that keeps property names and modifiers. */
const isOptionalNeverMap = (
    node: Readonly<TSESTree.TypeNode>
): node is TSESTree.TSMappedType =>
    node.type === AST_NODE_TYPES.TSMappedType &&
    (node.optional === true || node.optional === "+") &&
    !isDefined(node.readonly) &&
    node.nameType === null &&
    node.typeAnnotation?.type === AST_NODE_TYPES.TSNeverKeyword;

/** Rule definition for prefer-type-fest-require-none. */
const preferTypeFestRequireNoneRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSTypeAliasDeclaration(node) {
                    const parameters = node.typeParameters?.params;
                    const mapped = node.typeAnnotation;
                    if (
                        parameters?.length !== 1 ||
                        !isOptionalNeverMap(mapped)
                    ) {
                        return;
                    }
                    const [keys] = parameters;
                    const constraint = keys?.constraint;
                    if (
                        !keys ||
                        !constraint ||
                        !isGlobalTypeReferenceNamed(
                            context,
                            constraint,
                            "PropertyKey"
                        ) ||
                        constraint.typeArguments !== undefined ||
                        !isTypeParameterReference(
                            context.sourceCode,
                            keys,
                            mapped.constraint
                        )
                    ) {
                        return;
                    }
                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferRequireNone",
                        node: mapped,
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest RequireNone over an optional-never mapped type on a property-key parameter.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-require-none",
            },
            messages: {
                preferRequireNone:
                    "Use `RequireNone` from type-fest for this optional-never mapped type.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-require-none",
    });

export default preferTypeFestRequireNoneRule;
