/** @packageDocumentation Recognize readonly Date projections with every setter removed. */
import type { TSESTree } from "@typescript-eslint/utils";

import { isEmpty } from "ts-extras";

import { getDateWithoutSetters } from "../_internal/date-setter-omit.js";
import { isGlobalTypeReferenceNamed } from "../_internal/type-reference-node.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";
import { createUpstreamTypeReporter } from "../_internal/upstream-type-replacement.js";

/** ESLint rule definition for `prefer-type-fest-readonly-date`. */
const preferTypeFestReadonlyDateRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const report = createUpstreamTypeReporter(context);
            const { checker, parserServices } = getTypedRuleServices(context);
            return {
                'TSTypeReference[typeName.name="Readonly"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    const outer = node.typeArguments?.params;
                    if (
                        outer?.length !== 1 ||
                        !isGlobalTypeReferenceNamed(context, node, "Readonly")
                    ) {
                        return;
                    }
                    const [omit] = outer;
                    if (
                        !omit ||
                        !isGlobalTypeReferenceNamed(context, omit, "Omit")
                    ) {
                        return;
                    }
                    const date = getDateWithoutSetters(context, omit);
                    if (!date) {
                        return;
                    }
                    // Omit collapses named keys covered by an index signature, unlike TypeFest's mapped type.
                    const dateType = checker.getTypeAtLocation(
                        parserServices.esTreeNodeToTSNodeMap.get(date)
                    );
                    if (isEmpty(checker.getIndexInfosOfType(dateType))) {
                        report(node, "ReadonlyDate");
                    }
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest ReadonlyDate over readonly omissions of every Date setter.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                requiresUpstream: "type-fest@6",
                typefestConfigs: [
                    "typefest.configs.all",
                    "typefest.configs.experimental",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-readonly-date",
            },
            fixable: "code",
            messages: {
                preferUpstreamType:
                    "Use `{{replacement}}` from type-fest for this type expression.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-readonly-date",
    });
export default preferTypeFestReadonlyDateRule;
