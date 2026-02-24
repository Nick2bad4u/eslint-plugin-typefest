import type { UnknownArray } from "type-fest";
/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type ts from "typescript";

import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";

const RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules";

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

/**
 * Create typed rules with docs URLs that point to this repository's rule docs.
 */
/* eslint-disable total-functions/no-hidden-type-assertions -- RuleCreator generic specialization is required so `meta.docs.recommended` is typed across all rules. */
export const createTypedRule: ReturnType<
    typeof ESLintUtils.RuleCreator<TypefestRuleDocs>
> = ESLintUtils.RuleCreator<TypefestRuleDocs>(
    (ruleName) => `${RULE_DOCS_URL_BASE}/${ruleName}.md`
);
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
        return checkerWithAssignable.isTypeAssignableTo(sourceType, targetType);
    }

    return (
        checker.typeToString(sourceType) === checker.typeToString(targetType)
    );
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
 * Check whether a file path looks like a test file path.
 *
 * @param filePath - Absolute or relative file path.
 *
 * @returns `true` when path matches common test-file conventions.
 */
export const isTestFilePath = (filePath: string): boolean => {
    const normalizedPath = filePath.replaceAll("\\", "/").toLowerCase();

    return (
        normalizedPath.includes("/__tests__/") ||
        normalizedPath.includes("/tests/") ||
        normalizedPath.endsWith(".test.ts") ||
        normalizedPath.endsWith(".test.tsx") ||
        normalizedPath.endsWith(".test.js") ||
        normalizedPath.endsWith(".test.jsx") ||
        normalizedPath.endsWith(".spec.ts") ||
        normalizedPath.endsWith(".spec.tsx") ||
        normalizedPath.endsWith(".spec.js") ||
        normalizedPath.endsWith(".spec.jsx") ||
        normalizedPath.endsWith(".test.mts") ||
        normalizedPath.endsWith(".spec.mts") ||
        normalizedPath.endsWith(".test.cts") ||
        normalizedPath.endsWith(".spec.cts")
    );
};
