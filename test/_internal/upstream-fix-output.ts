/** @packageDocumentation Exercise the installed rule wiring and actual ESLint edit passes. */
import parser from "@typescript-eslint/parser";
import { Linter } from "eslint";

import typefest from "../../src/plugin";

/**
 * Apply a single rule to a real fixture filename and require a clean final
 * pass.
 */
export function applyUpstreamRuleFix(
    ruleName: string,
    code: string,
    filename: string
): string {
    const linter = new Linter();
    const docs = typefest.rules?.[ruleName]?.meta?.docs;
    const projectService =
        docs !== undefined &&
        "requiresTypeChecking" in docs &&
        docs.requiresTypeChecking === true;
    const result = linter.verifyAndFix(
        code,
        [
            {
                files: ["**/*.ts"],
                languageOptions: {
                    parser,
                    parserOptions: {
                        projectService,
                        tsconfigRootDir: process.cwd(),
                    },
                },
                plugins: { typefest },
                rules: { [`typefest/${ruleName}`]: "error" },
            },
        ],
        { filename }
    );
    if (!result.fixed || result.messages.length > 0) {
        throw new Error(
            `Expected a clean ESLint fix for ${ruleName}: ${result.messages.map((message) => message.message).join(", ")}`
        );
    }
    return result.output;
}
