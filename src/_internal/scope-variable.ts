/**
 * @packageDocumentation
 * Scope-chain helpers for reliable variable-resolution checks.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

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
    const visitedScopes = new Set<Readonly<TSESLint.Scope.Scope>>();

    while (currentScope !== null) {
        if (visitedScopes.has(currentScope)) {
            return null;
        }

        visitedScopes.add(currentScope);

        const variable = currentScope.set.get(variableName);
        if (isDefined(variable)) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
};
