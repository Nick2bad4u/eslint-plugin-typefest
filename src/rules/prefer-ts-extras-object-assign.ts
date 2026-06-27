/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-assign`.
 */
import { reportTsExtrasGlobalMemberCall } from "../_internal/global-member-call-rule.js";
import { collectDirectNamedValueImportsFromSource } from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-ts-extras-object-assign`.
 *
 * @remarks
 * Defines metadata, diagnostics, and fixes for this rule.
 */
const preferTsExtrasObjectAssignRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="MemberExpression"][callee.object.type="Identifier"][callee.object.name="Object"][callee.property.type="Identifier"][callee.property.name="assign"]'(
                    node
                ) {
                    reportTsExtrasGlobalMemberCall({
                        context,
                        importedName: "objectAssign",
                        imports: tsExtrasImports,
                        memberName: "assign",
                        messageId: "preferTsExtrasObjectAssign",
                        node,
                        objectName: "Object",
                    });
                },
            };
        },
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras objectAssign over Object.assign for stronger object merge typing.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-assign",
            },
            fixable: "code",
            messages: {
                preferTsExtrasObjectAssign:
                    "Prefer `objectAssign` from `ts-extras` over `Object.assign(...)` for stronger object merge typing.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-assign",
    });

/**
 * Default export for the `prefer-ts-extras-object-assign` rule module.
 */
export default preferTsExtrasObjectAssignRule;
