/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and
 * plugin wiring.
 */
import type { UnknownArray } from "type-fest";
import type ts from "typescript";

import {
    ESLintUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import type { TypefestConfigReference } from "./typefest-config-references.js";

import { registerProgramSettingsForContext } from "./plugin-settings.js";
import { createReportWithoutAutofixes } from "./report-adapter.js";
import { createRuleDocsUrl } from "./rule-docs-url.js";
import { safeTypeOperation } from "./safe-type-operation.js";

/**
 * Parser services and type checker bundle used by typed rules.
 */
type TypedRuleServices = {
    checker: ts.TypeChecker;
    parserServices: ReturnType<typeof ESLintUtils.getParserServices>;
};

/**
 * Plugin-specific metadata extensions for `meta.docs`.
 *
 * @remarks
 * `eslint-plugin/require-meta-docs-recommended` expects this field and the
 * repository config allows non-boolean values for multi-preset tagging.
 */
type TypefestRuleDocs = {
    recommended?:
        | boolean
        | readonly TypefestConfigReference[]
        | TypefestConfigReference;
};

/**
 * Resolve a variable binding by searching the current scope and all parents.
 */
const getVariableInScopeChain = (
    scope: Readonly<null | Readonly<TSESLint.Scope.Scope>>,
    variableName: string
): null | TSESLint.Scope.Variable => {
    let currentScope = scope;

    while (currentScope !== null) {
        const variable = currentScope.set.get(variableName);
        if (variable !== undefined) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
};

/**
 * Create a RuleContext facade that overrides only the `report` function while
 * preserving all original context behavior and own-property descriptors.
 */
const createContextWithOverriddenReport = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    report: TSESLint.RuleContext<MessageIds, Options>["report"]
): TSESLint.RuleContext<MessageIds, Options> => {
    const propertyDescriptors = Object.getOwnPropertyDescriptors(context);
    const reportDescriptor = propertyDescriptors.report;

    return Object.create(Object.getPrototypeOf(context), {
        ...propertyDescriptors,
        report: {
            configurable: true,
            enumerable: reportDescriptor?.enumerable ?? true,
            value: report,
            writable: true,
        },
    }) as TSESLint.RuleContext<MessageIds, Options>;
};

/**
 * Create typed rules with docs URLs that point to this repository's rule docs.
 */
/* eslint-disable total-functions/no-hidden-type-assertions -- RuleCreator generic specialization is required so `meta.docs.recommended` is typed across all rules. */
const baseTypedRuleCreator = ESLintUtils.RuleCreator<TypefestRuleDocs>(
    (ruleName) => createRuleDocsUrl(ruleName)
);

/**
 * Rule-creator wrapper used by all plugin rules.
 *
 * @remarks
 * This wrapper automatically registers per-program plugin settings and
 * transparently strips fixer callbacks when
 * `settings.typefest.disableAllAutofixes` is enabled for the current lint run.
 *
 * @param ruleDefinition - Rule module definition passed to
 *   `ESLintUtils.RuleCreator`.
 *
 * @returns Rule module factory output that auto-registers program settings and
 *   conditionally strips autofixes.
 */
export const createTypedRule: ReturnType<
    typeof ESLintUtils.RuleCreator<TypefestRuleDocs>
> = ((ruleDefinition) => {
    const createdRule = baseTypedRuleCreator(ruleDefinition);

    return {
        ...createdRule,
        create(context) {
            const settings = registerProgramSettingsForContext(context);

            const effectiveContext = settings.disableAllAutofixes
                ? createContextWithOverriddenReport(
                      context,
                      createReportWithoutAutofixes(context.report)
                  )
                : context;

            return createdRule.create(effectiveContext);
        },
    };
}) as ReturnType<typeof ESLintUtils.RuleCreator<TypefestRuleDocs>>;
/* eslint-enable total-functions/no-hidden-type-assertions -- Re-enable hidden-type-assertion checks for the rest of the module. */

/**
 * Retrieve parser services and type checker for typed rules.
 *
 * @param context - Rule context from the current lint evaluation.
 *
 * @returns Parser services and type checker references bound to the current
 *   program.
 *
 * @throws Throws when `parserServices.program` is unavailable, which indicates
 *   the current lint run is not configured for type-aware analysis.
 */
export const getTypedRuleServices = (
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>
): TypedRuleServices => {
    const parserServices = ESLintUtils.getParserServices(context, true);

    if (!parserServices.program) {
        throw new Error(
            "Typed rule requires parserServices.program; ensure projectService is enabled for this lint run."
        );
    }

    return {
        checker: parserServices.program.getTypeChecker(),
        parserServices,
    };
};

/**
 * Determine whether one TypeScript type is assignable to another.
 *
 * @remarks
 * Uses `checker.isTypeAssignableTo` when available and falls back to strict
 * reference equality if the checker API is unavailable or throws.
 *
 * @param checker - TypeScript type checker.
 * @param sourceType - Candidate source type.
 * @param targetType - Candidate target type.
 *
 * @returns `true` when assignable; otherwise `false`.
 */
export const isTypeAssignableTo = (
    checker: Readonly<ts.TypeChecker>,
    sourceType: Readonly<ts.Type>,
    targetType: Readonly<ts.Type>
): boolean => {
    const checkerWithAssignable = checker as ts.TypeChecker & {
        isTypeAssignableTo?: (
            source: Readonly<ts.Type>,
            target: Readonly<ts.Type>
        ) => boolean;
    };

    if (typeof checkerWithAssignable.isTypeAssignableTo === "function") {
        const result = safeTypeOperation({
            operation: () =>
                checkerWithAssignable.isTypeAssignableTo(
                    sourceType,
                    targetType
                ),
            reason: "type-assignability-check-failed",
        });

        if (!result.ok) {
            return sourceType === targetType;
        }

        return result.value;
    }

    return sourceType === targetType;
};

/**
 * Resolve the type of a signature parameter by index.
 *
 * @param checker - TypeScript type checker.
 * @param index - Parameter index in the signature.
 * @param location - Source location used for contextual type lookup.
 * @param signature - Candidate call signature.
 *
 * @returns Parameter type when available; otherwise `undefined`.
 */
export const getSignatureParameterTypeAt = ({
    checker,
    index,
    location,
    signature,
}: Readonly<{
    checker: ts.TypeChecker;
    index: number;
    location: ts.Node;
    signature: null | ts.Signature | undefined;
}>): ts.Type | undefined => {
    const symbol = signature?.parameters[index];
    if (!symbol) {
        return undefined;
    }

    return checker.getTypeOfSymbolAtLocation(symbol, location);
};

/**
 * Determine whether an expression references an unshadowed global identifier.
 *
 * @param context - Rule context used for scope resolution.
 * @param expression - Expression to inspect.
 * @param identifierName - Expected identifier name.
 *
 * @returns `true` when the expression is an Identifier with the expected name
 *   and resolves to the global binding.
 */
export const isGlobalIdentifierNamed = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    expression: Readonly<TSESTree.Expression>,
    identifierName: string
): expression is TSESTree.Identifier => {
    if (
        expression.type !== "Identifier" ||
        expression.name !== identifierName
    ) {
        return false;
    }

    const result = safeTypeOperation({
        operation: () => {
            const initialScope = context.sourceCode.getScope(expression);
            const variable = getVariableInScopeChain(
                initialScope,
                identifierName
            );

            return variable === null || variable.defs.length === 0;
        },
        reason: "scope-resolution-failed",
    });

    if (!result.ok) {
        return false;
    }

    return result.value;
};

/**
 * Determine whether an expression references the global `undefined` binding
 * (not a shadowed user-defined symbol).
 *
 * @param context - Rule context used for scope resolution.
 * @param expression - Expression to inspect.
 *
 * @returns `true` when the expression is an Identifier named `undefined` that
 *   resolves to the global binding.
 */
export const isGlobalUndefinedIdentifier = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Identifier =>
    isGlobalIdentifierNamed(context, expression, "undefined");
