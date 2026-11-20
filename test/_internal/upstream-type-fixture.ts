/** @packageDocumentation Construct expected fixture output while preserving unrelated declarations and formatting. */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

/** Replace the body of a named exported type alias, preserving all surrounding
source text. */
export function expectedAliasReplacement(
    code: string,
    alias: string,
    replacement: string
): string {
    const { ast } = parser.parseForESLint(code, {
        range: true,
        sourceType: "module",
    });
    for (const statement of ast.body) {
        if (
            statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
            statement.declaration?.type ===
                AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.declaration.id.name === alias
        ) {
            const [start, end] = statement.declaration.typeAnnotation.range;
            return code.slice(0, start) + replacement + code.slice(end);
        }
    }
    throw new Error(
        `Missing exported type alias ${alias} in the test fixture.`
    );
}
