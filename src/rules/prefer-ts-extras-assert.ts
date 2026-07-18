import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-assert`.
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
import {
    getThrowStatementFromConsequent,
    isThrowOnlyConsequent,
} from "../_internal/throw-consequent.js";
import {
    createTypedRule,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";

/** Concrete rule context type inferred from `createTypedRule`. */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Extract source text for an eagerly safe `Error` message argument.
 *
 * @remarks
 * `assert(condition, message)` evaluates `message` even when `condition` is
 * truthy, while `throw new Error(message)` only evaluates it in the failing
 * branch. Restricting this helper to static strings avoids changing evaluation
 * timing or side effects. An omitted `Error` message becomes an explicit empty
 * string because `new Error()` has an empty message while `assert(condition)`
 * uses ts-extras' `"Assertion failed"` default.
 *
 * @param context - Active rule context for global-binding and source checks.
 * @param throwStatement - Throw statement from the guard consequent.
 *
 * @returns Static message argument text that preserves `Error#message`, or
 *   `null` when the throw shape is not an exact migration candidate.
 */
const getStaticGlobalErrorMessageArgumentText = ({
    context,
    throwStatement,
}: Readonly<{
    context: RuleContext;
    throwStatement: Readonly<TSESTree.ThrowStatement>;
}>): null | string => {
    const thrownExpression = throwStatement.argument;

    if (
        thrownExpression.type !== AST_NODE_TYPES.NewExpression ||
        thrownExpression.callee.type !== AST_NODE_TYPES.Identifier ||
        thrownExpression.callee.name !== "Error" ||
        !isGlobalIdentifierNamed(context, thrownExpression.callee, "Error")
    ) {
        return null;
    }

    if (thrownExpression.arguments.length === 0) {
        return '""';
    }

    if (thrownExpression.arguments.length !== 1) {
        return null;
    }

    const [messageArgument] = thrownExpression.arguments;
    if (
        !messageArgument ||
        messageArgument.type === AST_NODE_TYPES.SpreadElement
    ) {
        return null;
    }

    const isStaticStringMessage =
        (messageArgument.type === AST_NODE_TYPES.Literal &&
            typeof messageArgument.value === "string") ||
        (messageArgument.type === AST_NODE_TYPES.TemplateLiteral &&
            messageArgument.expressions.length === 0);

    if (!isStaticStringMessage) {
        return null;
    }

    return getFunctionCallArgumentText({
        argumentNode: messageArgument,
        sourceCode: context.sourceCode,
    });
};

/**
 * ESLint rule definition for `prefer-ts-extras-assert`.
 *
 * @remarks
 * Reports only exact negated-condition guards that throw the unshadowed global
 * `Error` with an omitted or static string message. Replacements are
 * suggestions rather than autofixes because migrating to a helper changes error
 * stack provenance even when the thrown error type and message are preserved.
 */
const preferTsExtrasAssertRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'IfStatement[test.type="UnaryExpression"][test.operator="!"]'(
                    node: Readonly<TSESTree.IfStatement>
                ) {
                    if (
                        node.alternate !== null ||
                        node.test.type !== AST_NODE_TYPES.UnaryExpression ||
                        node.test.operator !== "!" ||
                        !isThrowOnlyConsequent(node.consequent)
                    ) {
                        return;
                    }

                    const throwStatement = getThrowStatementFromConsequent(
                        node.consequent
                    );
                    if (throwStatement === null) {
                        return;
                    }

                    const messageArgumentText =
                        getStaticGlobalErrorMessageArgumentText({
                            context,
                            throwStatement,
                        });
                    if (messageArgumentText === null) {
                        return;
                    }

                    const conditionArgumentText = getFunctionCallArgumentText({
                        argumentNode: node.test.argument,
                        sourceCode: context.sourceCode,
                    });

                    const hasComments =
                        context.sourceCode.getCommentsInside(node).length > 0;
                    const replacementFix =
                        conditionArgumentText === null || hasComments
                            ? null
                            : createSafeValueNodeTextReplacementFix({
                                  context,
                                  importedName: "assert",
                                  imports: tsExtrasImports,
                                  replacementTextFactory: (replacementName) =>
                                      `${replacementName}(${conditionArgumentText}, ${messageArgumentText});`,
                                  reportFixIntent: "suggestion",
                                  sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                                  targetNode: node,
                              });

                    if (replacementFix === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasAssert",
                            node,
                        });

                        return;
                    }

                    reportWithTypefestPolicy({
                        context,
                        descriptor: {
                            messageId: "preferTsExtrasAssert",
                            node,
                            suggest: [
                                {
                                    fix: replacementFix,
                                    messageId: "suggestTsExtrasAssert",
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
                    "require ts-extras assert over exact manual negated-condition Error guards.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-assert",
            },
            hasSuggestions: true,
            messages: {
                preferTsExtrasAssert:
                    "Prefer `assert` from `ts-extras` over a manual negated-condition `Error` guard.",
                suggestTsExtrasAssert:
                    "Replace this guard with `assert(...)` from `ts-extras` while preserving the error message.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-assert",
    });

/** Default export for the `prefer-ts-extras-assert` rule module. */
export default preferTsExtrasAssertRule;
