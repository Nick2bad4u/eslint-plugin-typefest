import { ESLintUtils, type TSESLint } from "@typescript-eslint/utils";
import type ts from "typescript";

const RULE_DOCS_URL_BASE =
    "https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/rules";

type TypedRuleServices = {
    checker: ts.TypeChecker;
    parserServices: ReturnType<typeof ESLintUtils.getParserServices>;
};

/** Creates a typed rule with package docs URLs. */
export const createTypedRule: ReturnType<typeof ESLintUtils.RuleCreator> = ESLintUtils.RuleCreator(
    (ruleName) => `${RULE_DOCS_URL_BASE}/${ruleName}.md`
);

/** Retrieves parser services and type checker for typed rules. */
export const getTypedRuleServices = (
    context: TSESLint.RuleContext<string, readonly unknown[]>
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

export const isTypeAssignableTo = (
    checker: ts.TypeChecker,
    sourceType: ts.Type,
    targetType: ts.Type
): boolean => {
    const checkerWithAssignable = checker as ts.TypeChecker & {
        isTypeAssignableTo?: (source: ts.Type, target: ts.Type) => boolean;
    };

    if (typeof checkerWithAssignable.isTypeAssignableTo === "function") {
        return checkerWithAssignable.isTypeAssignableTo(sourceType, targetType);
    }

    return checker.typeToString(sourceType) === checker.typeToString(targetType);
};

export const getSignatureParameterTypeAt = ({
    checker,
    signature,
    index,
    location,
}: {
    checker: ts.TypeChecker;
    signature: ts.Signature | null | undefined;
    index: number;
    location: ts.Node;
}): ts.Type | undefined => {
    const symbol = signature?.parameters[index];
    if (!symbol) {
        return undefined;
    }

    return checker.getTypeOfSymbolAtLocation(symbol, location);
};

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
