import type { UnknownArray } from "type-fest";
/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type ts from "typescript";

import {
    ESLintUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { registerProgramSettingsForContext } from "./plugin-settings.js";
import { createRuleDocsUrl } from "./rule-docs-url.js";

type ReportDescriptor<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = Parameters<TSESLint.RuleContext<MessageIds, Options>["report"]>[0];

/**
 * Parser services and type checker bundle used by typed rules.
 */
type TypedRuleServices = {
    checker: ts.TypeChecker;
    parserServices: ReturnType<typeof ESLintUtils.getParserServices>;
};

/**
 * Fully-qualified preset references used in rule docs metadata.
 */
type TypefestConfigReference =
    | "typefest.configs.all"
    | "typefest.configs.minimal"
    | "typefest.configs.recommended"
    | "typefest.configs.strict"
    | "typefest.configs.ts-extras/type-guards"
    | "typefest.configs.type-fest/types"
    | 'typefest.configs["ts-extras/type-guards"]'
    | 'typefest.configs["type-fest/types"]';

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

const TEST_DIRECTORY_SEGMENT_PATTERN = /(?:^|\/)(?:__tests__|tests)(?:\/|$)/u;
const TEST_FILE_SUFFIX_PATTERN = /\.(?:spec|test)\.(?:cts|js|jsx|mts|ts|tsx)$/u;

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

const stripFixFromReportDescriptor = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    descriptor: Readonly<ReportDescriptor<MessageIds, Options>>
): ReportDescriptor<MessageIds, Options> => {
    if (
        typeof descriptor !== "object" ||
        descriptor === null ||
        !Object.hasOwn(descriptor, "fix")
    ) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    const fixPropertyDescriptor = Object.getOwnPropertyDescriptor(
        descriptor,
        "fix"
    );

    if (!fixPropertyDescriptor) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    if (
        "value" in fixPropertyDescriptor &&
        typeof fixPropertyDescriptor.value !== "function"
    ) {
        return descriptor as ReportDescriptor<MessageIds, Options>;
    }

    const descriptorProperties = {
        ...Object.getOwnPropertyDescriptors(descriptor),
    };

    Reflect.deleteProperty(descriptorProperties, "fix");

    const descriptorWithoutFix = Object.defineProperties(
        {},
        descriptorProperties
    );

    return descriptorWithoutFix as ReportDescriptor<MessageIds, Options>;
};

const createContextWithoutAutofixes = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>
): Readonly<TSESLint.RuleContext<MessageIds, Options>> => {
    const reportWithoutAutofixes: typeof context.report = (descriptor) => {
        context.report(stripFixFromReportDescriptor(descriptor));
    };

    const effectiveContext = Object.create(context) as TSESLint.RuleContext<
        MessageIds,
        Options
    >;

    Object.defineProperty(effectiveContext, "report", {
        configurable: true,
        enumerable: true,
        value: reportWithoutAutofixes,
        writable: false,
    });

    return effectiveContext;
};

/**
 * Create typed rules with docs URLs that point to this repository's rule docs.
 */
/* eslint-disable total-functions/no-hidden-type-assertions -- RuleCreator generic specialization is required so `meta.docs.recommended` is typed across all rules. */
const baseTypedRuleCreator = ESLintUtils.RuleCreator<TypefestRuleDocs>(
    (ruleName) => createRuleDocsUrl(ruleName)
);

export const createTypedRule: ReturnType<
    typeof ESLintUtils.RuleCreator<TypefestRuleDocs>
> = ((ruleDefinition) => {
    const createdRule = baseTypedRuleCreator(ruleDefinition);

    return {
        ...createdRule,
        create(context) {
            const settings = registerProgramSettingsForContext(context);

            const effectiveContext = settings.disableAllAutofixes
                ? createContextWithoutAutofixes(context)
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
 * @returns Parser services and type checker references.
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
        try {
            return checkerWithAssignable.isTypeAssignableTo(
                sourceType,
                targetType
            );
        } catch {
            return sourceType === targetType;
        }
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
 * Determine whether a file path appears to reference a test file.
 *
 * @param filePath - Absolute or relative file path.
 *
 * @returns `true` when the path contains a dedicated test directory segment or
 *   ends with a known `.{spec|test}.<ext>` suffix.
 */
export const isTestFilePath = (filePath: string): boolean => {
    const normalizedLowercaseFilePath = filePath
        .replaceAll("\\", "/")
        .toLowerCase();

    return (
        TEST_DIRECTORY_SEGMENT_PATTERN.test(normalizedLowercaseFilePath) ||
        TEST_FILE_SUFFIX_PATTERN.test(normalizedLowercaseFilePath)
    );
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

    try {
        const initialScope = context.sourceCode.getScope(expression);
        const variable = getVariableInScopeChain(initialScope, identifierName);

        return variable === null || variable.defs.length === 0;
    } catch {
        return false;
    }
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
