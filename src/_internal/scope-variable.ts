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
    let slowScope = scope;
    let fastScope = scope;

    while (slowScope !== null) {
        const variable = slowScope.set.get(variableName);
        if (isDefined(variable)) {
            return variable;
        }

        slowScope = slowScope.upper;

        for (let step = 0; step < 2; step += 1) {
            if (fastScope === null) {
                break;
            }

            fastScope = fastScope.upper;
        }

        if (
            slowScope !== null &&
            fastScope !== null &&
            slowScope === fastScope
        ) {
            return null;
        }
    }

    return null;
};
