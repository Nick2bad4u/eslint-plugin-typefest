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
import { arrayIncludes, arrayJoin, setHas } from "ts-extras";

import type { TypefestConfigReference } from "./typefest-config-references.js";

import { registerProgramSettingsForContext } from "./plugin-settings.js";
import {
    createReportWithoutAutofixes,
    createRuleContextWithAdaptedReport,
} from "./report-adapter.js";
import { safeTypeOperation } from "./safe-type-operation.js";
import { getVariableInScopeChain } from "./scope-variable.js";
import { recommendedTypeCheckedRuleNames } from "./type-checked-rule-names.js";
import { getTypeCheckerIsTypeAssignableToResult } from "./type-checker-compat.js";

/**
 * Parser services and type checker bundle used by typed rules.
 */
type TypedRuleServices = {
    checker: ts.TypeChecker;
    parserServices: ReturnType<typeof ESLintUtils.getParserServices>;
};

type TypefestRuleCreator = ReturnType<
    typeof ESLintUtils.RuleCreator<TypefestRuleDocs>
>;

/**
 * Plugin-specific metadata extensions for `meta.docs`.
 *
 * @remarks
 * `eslint-plugin/require-meta-docs-recommended` expects `meta.docs.recommended`
 * to be boolean. Preset membership is tracked separately via
 * `meta.docs.typefestConfigs`.
 */
type TypefestRuleDocs = {
    recommended?: boolean;
    typefestConfigs?:
        | readonly TypefestConfigReference[]
        | TypefestConfigReference;
};

/**
 * Config reference expected on typed rules included in recommended typed
 * preset.
 */
const RECOMMENDED_TYPE_CHECKED_REFERENCE =
    "typefest.configs.recommended-type-checked" satisfies TypefestConfigReference;

/** Config reference that should not be present on typed-only recommended rules. */
const RECOMMENDED_REFERENCE =
    "typefest.configs.recommended" satisfies TypefestConfigReference;

/** Process-local dedupe for metadata warning logs. */
const warnedMetadataRuleNames = new Set<string>();

const normalizeTypefestConfigReferences = (
    value: TypefestRuleDocs["typefestConfigs"]
): readonly TypefestConfigReference[] => {
    if (typeof value === "string") {
        return [value];
    }

    return Array.isArray(value) ? value : [];
};

const warnTypedRuleMetadataDrift = (
    ruleDefinition: Readonly<{
        meta: {
            docs?: TypefestRuleDocs;
        };
        name: string;
    }>
): void => {
    const { name } = ruleDefinition;

    if (!name.startsWith("prefer-")) {
        return;
    }

    const typefestRuleName = name as `prefer-${string}`;

    if (
        !setHas(recommendedTypeCheckedRuleNames, typefestRuleName) ||
        setHas(warnedMetadataRuleNames, name)
    ) {
        return;
    }

    const docs = ruleDefinition.meta.docs;
    const typefestConfigs = normalizeTypefestConfigReferences(
        docs?.typefestConfigs
    );
    const hasRecommendedTypeChecked = arrayIncludes(
        typefestConfigs,
        RECOMMENDED_TYPE_CHECKED_REFERENCE
    );
    const hasRecommended = arrayIncludes(
        typefestConfigs,
        RECOMMENDED_REFERENCE
    );

    if (
        !hasRecommendedTypeChecked ||
        hasRecommended ||
        docs?.recommended === true
    ) {
        warnedMetadataRuleNames.add(name);
        const warningSegments: readonly string[] = [
            `[eslint-plugin-typefest] Typed rule \`${name}\` has metadata that may drift from preset intent.`,
            `Expected docs.typefestConfigs to include \`${RECOMMENDED_TYPE_CHECKED_REFERENCE}\` and exclude \`${RECOMMENDED_REFERENCE}\`,`,
            "with docs.recommended set to false.",
        ];

        process.emitWarning(arrayJoin(warningSegments, " "));
    }
};

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
export const createTypedRule: TypefestRuleCreator = (ruleDefinition) => {
    warnTypedRuleMetadataDrift(ruleDefinition);

    const createdRule = ESLintUtils.RuleCreator.withoutDocs(ruleDefinition);

    return {
        ...createdRule,
        create(context) {
            const settings = registerProgramSettingsForContext(context);

            const effectiveContext = settings.disableAllAutofixes
                ? createRuleContextWithAdaptedReport(
                      context,
                      createReportWithoutAutofixes
                  )
                : context;

            return createdRule.create(effectiveContext);
        },
        name: ruleDefinition.name,
    };
};

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
    const result = safeTypeOperation({
        operation: () =>
            getTypeCheckerIsTypeAssignableToResult(
                checker,
                sourceType,
                targetType
            ),
        reason: "type-assignability-check-failed",
    });

    if (!result.ok || typeof result.value !== "boolean") {
        return sourceType === targetType;
    }

    return result.value;
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
