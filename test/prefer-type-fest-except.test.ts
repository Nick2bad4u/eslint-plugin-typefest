/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-except.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { describe, expect, it, vi } from "vitest";

import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-type-fest-except");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-except.valid.ts";
const invalidFixtureName = "prefer-type-fest-except.invalid.ts";
const inlineFixableInvalidCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    'import type { Except } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");

const inlineFixableOutputCode = inlineFixableInvalidCode.replace(
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
    'type UserWithoutId = Except<User, "id">;'
);
const inlineNoFixWithoutExceptImportCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = HomomorphicOmit<User, "id">;',
].join("\n");
const inlineNoFixWithoutExceptImportOutputCode =
    inlineNoFixWithoutExceptImportCode
        .replace(
            'import type { HomomorphicOmit } from "type-aliases";',
            'import type { HomomorphicOmit } from "type-aliases";\nimport type { Except } from "type-fest";'
        )
        .replace(
            'type UserWithoutId = HomomorphicOmit<User, "id">;',
            'type UserWithoutId = Except<User, "id">;'
        );
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { HomomorphicOmit } from "type-aliases";',
    "",
    'type Wrapper<Except extends object> = HomomorphicOmit<Except, "id">;',
].join("\n");
const inlineValidNamespaceAliasCode = [
    'import type * as TypeAliases from "type-aliases";',
    "",
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    'type UserWithoutId = TypeAliases.HomomorphicOmit<User, "id">;',
].join("\n");
const inlineValidOmitWithoutTypeArgumentsCode = [
    "type User = {",
    "    id: string;",
    "    name: string;",
    "};",
    "",
    "type UserWithoutId = Omit<User>;",
].join("\n");
const inlineValidBareOmitReferenceCode = "type OmitFactory = Omit;";

addTypeFestRuleMetadataAndFilenameFallbackTests("prefer-type-fest-except", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest Except over Omit when removing properties from object types.",
    enforceRuleShape: true,
    messages: {
        preferExcept:
            "Prefer `Except<T, K>` from type-fest over `Omit<T, K>` for stricter omitted-key modeling.",
    },
    name: "prefer-type-fest-except",
});

describe("prefer-type-fest-except source assertions", () => {
    it("reports builtin Omit type references in undecorated visitor", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-except")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            const parsedResult = parser.parseForESLint(
                'type UserWithoutId = Omit<{ id: string; name: string }, "id">;',
                {
                    ecmaVersion: "latest",
                    loc: true,
                    range: true,
                    sourceType: "module",
                }
            );

            const [firstStatement] = parsedResult.ast.body;

            expect(firstStatement?.type).toBe("TSTypeAliasDeclaration");

            if (
                firstStatement?.type !== AST_NODE_TYPES.TSTypeAliasDeclaration
            ) {
                throw new Error("Expected a type alias declaration statement");
            }

            const aliasAnnotation = firstStatement.typeAnnotation;

            expect(aliasAnnotation.type).toBe("TSTypeReference");

            if (aliasAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
                throw new Error("Expected a type reference in the type alias");
            }

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename: "fixtures/typed/prefer-type-fest-except.invalid.ts",
                report,
                sourceCode: {
                    ast: parsedResult.ast,
                },
            });

            listenerMap.TSTypeReference?.(aliasAnnotation);

            expect(report).toHaveBeenCalledTimes(1);
            expect(report).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageId: "preferExcept",
                    node: aliasAnnotation,
                })
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run("prefer-type-fest-except", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferExcept",
                },
                {
                    messageId: "preferExcept",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Omit-alias usage",
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes imported HomomorphicOmit alias",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixWithoutExceptImportCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports alias usage without available Except import fix",
            output: inlineNoFixWithoutExceptImportOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [{ messageId: "preferExcept" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports HomomorphicOmit alias when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidNamespaceAliasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores namespace-qualified alias reference",
        },
        {
            code: inlineValidOmitWithoutTypeArgumentsCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Omit with missing second type argument",
        },
        {
            code: inlineValidBareOmitReferenceCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores bare Omit type reference",
        },
    ],
});
