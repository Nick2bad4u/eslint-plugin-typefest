/**
 * @packageDocumentation
 * Scope-chain helpers for reliable variable-resolution checks.
 */
import type { TSESLint } from "@typescript-eslint/utils";

/**
 * Resolve a variable binding by walking the current scope and all parent
 * scopes.
 *
 * @param scope - Initial scope to inspect.
 * @param variableName - Identifier name to resolve.
 *
 * @returns Matched variable binding from the nearest scope chain; otherwise
 *   `null`.
 */
export const getVariableInScopeChain = (
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
