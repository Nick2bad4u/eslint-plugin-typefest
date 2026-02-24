/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-string-split.valid.ts";
const invalidFixtureName = "prefer-ts-extras-string-split.invalid.ts";

const inlineInvalidCode = [
    "const value = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const inlineInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

const computedAccessValidCode = [
    "const value = 'a,b';",
    'const parts = value["split"](",");',
    "String(parts);",
].join("\n");

const nonStringReceiverValidCode = [
    "const helper = {",
    "    split(separator: string): readonly string[] {",
    "        return [separator];",
    "    },",
    "};",
    "const parts = helper.split(',');",
    "String(parts);",
].join("\n");
const differentStringMethodValidCode = [
    "const value = 'a,b';",
    "const normalized = value.toUpperCase();",
    "String(normalized);",
].join("\n");
const unionStringInvalidCode = [
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const unionStringInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "const value: 'a,b' | 'c,d' = 'a,b';",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const mixedUnionInvalidCode = [
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const mixedUnionInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: string | { split(separator: string): readonly string[] };",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const declaredStringUnionInvalidCode = [
    "declare const value: string | String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const declaredStringUnionInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: string | String;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");
const declaredStringObjectInvalidCode = [
    "declare const value: String;",
    "const parts = value.split(',');",
    "String(parts);",
].join("\n");
const declaredStringObjectInvalidOutput = [
    'import { stringSplit } from "ts-extras";',
    "declare const value: String;",
    "const parts = stringSplit(value, ',');",
    "String(parts);",
].join("\n");

const skipPathInvalidCode = inlineInvalidCode;
const inlineFixableCode = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = value.split(',');",
].join("\n");
const inlineFixableOutput = [
    'import { stringSplit } from "ts-extras";',
    "",
    "const value = 'a,b';",
    "const parts = stringSplit(value, ',');",
].join("\n");

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-ts-extras-string-split",
    {
        defaultOptions: [],
        docsDescription:
            "require ts-extras stringSplit over String#split for stronger tuple inference.",
        enforceRuleShape: true,
        messages: {
            preferTsExtrasStringSplit:
                "Prefer `stringSplit` from `ts-extras` over `string.split(...)` for stronger tuple inference.",
        },
        name: "prefer-ts-extras-string-split",
    }
);

describe("prefer-ts-extras-string-split source assertions", () => {
    it("keeps string-split string-like and member guards in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-string-split.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('typeText === "String" ||');
        expect(ruleSource).toContain("typeText.startsWith('\"')");
        expect(ruleSource).toContain(
            'node.callee.property.type !== "Identifier" ||'
        );
        expect(ruleSource).toContain("} catch {");
        expect(ruleSource).toContain("return;");
    });

    it("handles parser-service lookup failures without reporting", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                getTypedRuleServices: () => ({
                    checker: {
                        getTypeAtLocation: () => ({
                            isUnion: () => false,
                        }),
                        typeToString: () => "string",
                    },
                    parserServices: {
                        esTreeNodeToTSNodeMap: {
                            get: (): never => {
                                throw new Error("lookup failed");
                            },
                        },
                    },
                }),
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-ts-extras-string-split")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                [
                    "const value = 'a,b';",
                    "const parts = value.split(',');",
                ].join("\n"),
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const secondStatement = parsedResult.ast.body[1];

            expect(secondStatement?.type).toBe("VariableDeclaration");

            if (secondStatement?.type !== AST_NODE_TYPES.VariableDeclaration) {
                throw new Error("Expected variable declaration for split call");
            }

            const firstDeclarator = secondStatement.declarations[0];
            if (firstDeclarator?.init?.type !== AST_NODE_TYPES.CallExpression) {
                throw new Error(
                    "Expected call expression initializer for split call"
                );
            }

            const splitCallExpression = firstDeclarator.init;
            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-ts-extras-string-split.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            expect(() => {
                listenerMap.CallExpression?.(splitCallExpression);
            }).not.toThrowError();

            expect(report).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-string-split",
    getPluginRule("prefer-ts-extras-string-split"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                    {
                        messageId: "preferTsExtrasStringSplit",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture string.split usage",
            },
            {
                code: inlineInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports direct string.split call",
                output: inlineInvalidOutput,
            },
            {
                code: unionStringInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports literal string union split call",
                output: unionStringInvalidOutput,
            },
            {
                code: mixedUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed union split call",
                output: mixedUnionInvalidOutput,
            },
            {
                code: declaredStringUnionInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared string object union split call",
                output: declaredStringUnionInvalidOutput,
            },
            {
                code: declaredStringObjectInvalidCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports declared String object split call",
                output: declaredStringObjectInvalidOutput,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasStringSplit" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes string.split() when stringSplit import is in scope",
                output: inlineFixableOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: computedAccessValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed split member access",
            },
            {
                code: nonStringReceiverValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores custom non-string split method",
            },
            {
                code: differentStringMethodValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-split string method call",
            },
            {
                code: skipPathInvalidCode,
                filename: typedFixturePath(
                    "tests",
                    "prefer-ts-extras-string-split.skip.ts"
                ),
                name: "skips file under tests fixture path",
            },
        ],
    }
);
