import type { UnknownArray, UnknownRecord } from "type-fest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-writable-deep.test` behavior.
 */
import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import * as fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule, repoPath } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const writableDeepRule = getPluginRule("prefer-type-fest-writable-deep");

const validFixtureName = "prefer-type-fest-writable-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-writable-deep.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-type-fest-writable-deep fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { WritableDeep } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "WritableDeep<TeamConfig>",
        sourceText: invalidFixtureCode,
        target: "DeepMutable<TeamConfig>",
    }
)}`;
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "WritableDeep<TeamConfig>",
    sourceText: fixtureFixableOutputCode,
    target: "MutableDeep<TeamConfig>",
});
const inlineFixableInvalidCode = [
    'import type { DeepMutable } from "type-aliases";',
    'import type { WritableDeep } from "type-fest";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type MutableUser = DeepMutable<User>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type MutableUser = WritableDeep<User>;",
    sourceText: inlineFixableInvalidCode,
    target: "type MutableUser = DeepMutable<User>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { DeepMutable } from "type-aliases";',
    "",
    "type User = {",
    "    readonly id: string;",
    "};",
    "",
    "type Wrapper<WritableDeep> = DeepMutable<User>;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const writableDeepAliasArbitrary = fc.constantFrom(
    "DeepMutable",
    "MutableDeep"
);
const writableDeepTypeNameArbitrary = fc.constantFrom(
    "User",
    "TeamConfig",
    "Payload",
    "FeatureFlags"
);

const parseWritableDeepTypeReferenceFromCode = (sourceText: string) => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from WritableDeep<T>"
    );
};

ruleTester.run("prefer-type-fest-writable-deep", writableDeepRule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferWritableDeep" },
                { messageId: "preferWritableDeep" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture DeepMutable aliases",
            output: [
                fixtureFixableOutputCode,
                fixtureFixableSecondPassOutputCode,
            ],
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferWritableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline DeepMutable alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [{ messageId: "preferWritableDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports DeepMutable alias when replacement identifier is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
    ],
});

describe("prefer-type-fest-writable-deep parse-safety guards", () => {
    it("fast-check: WritableDeep replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                writableDeepAliasArbitrary,
                writableDeepTypeNameArbitrary,
                (aliasName, typeName) => {
                    const generatedCode = [
                        'import type { WritableDeep } from "type-fest";',
                        `type Candidate = ${aliasName}<${typeName}>;`,
                    ].join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: `WritableDeep<${typeName}>`,
                        sourceText: generatedCode,
                        target: `${aliasName}<${typeName}>`,
                    });

                    const typeReference =
                        parseWritableDeepTypeReferenceFromCode(replacedCode);

                    expect(typeReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        typeReference.typeName.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(typeReference.typeName.name).toBe(
                            "WritableDeep"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

interface WritableDeepRuleMetadataSnapshot {
    defaultOptions?: Readonly<UnknownArray>;
    meta?: {
        docs?: {
            description?: string;
            url?: string;
        };
        messages?: Record<string, string>;
    };
    name?: string;
}

const loadWritableDeepRuleMetadata =
    async (): Promise<WritableDeepRuleMetadataSnapshot> => {
        vi.resetModules();
        const moduleUnderTest =
            await import("../src/rules/prefer-type-fest-writable-deep");

        return moduleUnderTest.default as WritableDeepRuleMetadataSnapshot;
    };

describe("prefer-type-fest-writable-deep metadata", () => {
    it("declares stable metadata values", async () => {
        const metadataRule = await loadWritableDeepRuleMetadata();
        const metadataDefaultOptions =
            "defaultOptions" in metadataRule
                ? (metadataRule as { defaultOptions?: unknown }).defaultOptions
                : undefined;

        expect(metadataDefaultOptions).toStrictEqual([]);
        expect(metadataRule.name).toBe("prefer-type-fest-writable-deep");
        expect(metadataRule.meta?.docs?.description).toBe(
            "require TypeFest WritableDeep over `DeepMutable` and `MutableDeep` aliases."
        );
        expect(metadataRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
        );
        expect(writableDeepRule.meta?.docs?.url).toBe(
            "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
        );
        expect(metadataRule.meta?.messages?.["preferWritableDeep"]).toBe(
            "Prefer `WritableDeep` from type-fest over `DeepMutable`/`MutableDeep`."
        );

        const writableDeepRuleSource = fs.readFileSync(
            repoPath("src", "rules", "prefer-type-fest-writable-deep.ts"),
            "utf8"
        );

        expect(writableDeepRuleSource).toMatch(
            /\/docs\/rules\/prefer-type-fest-writable-deep"/v
        );
    });

    it("declares authored docs url literal before RuleCreator decoration", async () => {
        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: () => false,
            }));

            const undecoratedModule =
                (await import("../src/rules/prefer-type-fest-writable-deep")) as {
                    default: WritableDeepRuleMetadataSnapshot;
                };

            expect(undecoratedModule.default.meta?.docs?.url).toBe(
                "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-writable-deep"
            );
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

interface WritableDeepRuleModuleForCreate {
    create: (
        context: Readonly<{
            filename?: string | undefined;
            sourceCode: object;
        }>
    ) => UnknownRecord;
}

describe("prefer-type-fest-writable-deep filename fallback", () => {
    it("short-circuits missing filenames as test-path matches", async () => {
        const collectDirectNamedImportsFromSourceMock = vi.fn(() => {
            throw new Error(
                "collectDirectNamedImportsFromSource should not run when filename is missing"
            );
        });

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (filePath: string): boolean => filePath === "",
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource:
                    collectDirectNamedImportsFromSourceMock,
                createSafeTypeReferenceReplacementFix: () => undefined,
            }));

            const moduleUnderTest =
                (await import("../src/rules/prefer-type-fest-writable-deep")) as unknown as {
                    default: WritableDeepRuleModuleForCreate;
                };

            const listeners = moduleUnderTest.default.create({
                sourceCode: {},
            });

            expect(listeners).toStrictEqual({});
            expect(
                collectDirectNamedImportsFromSourceMock
            ).not.toHaveBeenCalled();
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.resetModules();
        }
    });
});
