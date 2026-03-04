/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-has-own.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

import {
    fastCheckRunConfig,
    isSafeGeneratedIdentifier,
} from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const invalidFixtureName = "prefer-ts-extras-object-has-own.invalid.ts";
const validFixtureName = "prefer-ts-extras-object-has-own.valid.ts";
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
            `Expected prefer-ts-extras-object-has-own fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement: 'objectHasOwn(candidate, "status")',
    sourceText: replaceOrThrow({
        replacement:
            'import { objectHasOwn } from "ts-extras";\ndeclare const candidate: unknown;\r\n',
        sourceText: invalidFixtureCode,
        target: "declare const candidate: unknown;\r\n",
    }),
    target: 'Object.hasOwn(candidate, "status")',
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "objectHasOwn(variants, propertyName)",
    sourceText: fixtureFixableOutputCode,
    target: "Object.hasOwn(variants, propertyName)",
});
const fixtureFixableThirdPassOutputCode = replaceOrThrow({
    replacement: 'objectHasOwn(variants, "success")',
    sourceText: fixtureFixableSecondPassOutputCode,
    target: 'Object.hasOwn(variants, "success")',
});
const inlineFixableCode = [
    'import { objectHasOwn } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const hasAlpha = Object.hasOwn(sample, 'alpha');",
].join("\n");
const inlineFixableOutput = [
    'import { objectHasOwn } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const hasAlpha = objectHasOwn(sample, 'alpha');",
].join("\n");
const inlineValidComputedObjectHasOwnCode = [
    "declare const variants: { readonly success: string };",
    "",
    'const hasSuccess = Object["hasOwn"](variants, "success");',
    "",
    "String(hasSuccess);",
].join("\n");
const inlineValidReflectHasOwnCode = [
    "declare const variants: { readonly success: string };",
    "",
    'const hasSuccess = Reflect.has(variants, "success");',
    "",
    "String(hasSuccess);",
].join("\n");
const inlineValidCustomObjectHasOwnCode = [
    "const helper = {",
    "    hasOwn(value: object, key: PropertyKey): boolean {",
    "        return Object.prototype.hasOwnProperty.call(value, key);",
    "    },",
    "};",
    "const sample = { alpha: 1 } as const;",
    'const hasAlpha = helper.hasOwn(sample, "alpha");',
    "String(hasAlpha);",
].join("\n");
const inlineValidObjectKeysCode = [
    "const sample = { alpha: 1 } as const;",
    "const keys = Object.keys(sample);",
    "String(keys.length);",
].join("\n");
const shadowedObjectBindingValidCode = [
    "const Object = {",
    "    hasOwn(target: object, key: PropertyKey): boolean {",
    "        return key in target;",
    "    },",
    "};",
    'const hasStatus = Object.hasOwn({ status: "ok" }, "status");',
    "String(hasStatus);",
].join("\n");

type ObjectHasOwnKeyExpression = "identifier" | "stringLiteral";

type ObjectHasOwnReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const objectIdentifierArbitrary = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate))
    .filter(
        (candidate) =>
            !new Set([
                "Object",
                "objectHasOwn",
                "propertyName",
            ]).has(candidate)
    );

const objectHasOwnKeyExpressionArbitrary =
    fc.constantFrom<ObjectHasOwnKeyExpression>("identifier", "stringLiteral");

const parseObjectHasOwnCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    return {
                        ast: parsed.ast,
                        callExpression: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable declaration initialized from an Object.hasOwn call"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-object-has-own", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectHasOwn:
            "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
    },
    name: "prefer-ts-extras-object-has-own",
});

describe("prefer-ts-extras-object-has-own source assertions", () => {
    it("keeps object-has-own callee guard clauses in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-ts-extras-object-has-own.ts"
            ),
            "utf8"
        );

        expect(ruleSource).toContain('callee.object.name !== "Object" ||');
        expect(ruleSource).toContain("isGlobalIdentifierNamed(");
        expect(ruleSource).toContain(
            'callee.property.type !== "Identifier" ||'
        );
        expect(ruleSource).toContain('callee.property.name !== "hasOwn"');
    });

    it("fast-check: objectHasOwn replacement remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueReferenceReplacementFixMock = vi.fn(
                (...args: readonly unknown[]) =>
                    args.length >= 0 ? "FIX" : "UNREACHABLE"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    node: Readonly<{ name?: string; type: string }>,
                    expectedName: string
                ): boolean =>
                    node.type === "Identifier" && node.name === expectedName,
            }));

            vi.doMock("../src/_internal/imported-value-symbols.js", () => ({
                collectDirectNamedValueImportsFromSource: () =>
                    new Set<string>(),
                createSafeValueReferenceReplacementFix:
                    createSafeValueReferenceReplacementFixMock,
            }));

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-object-has-own")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    objectIdentifierArbitrary,
                    objectHasOwnKeyExpressionArbitrary,
                    fc.boolean(),
                    (
                        objectIdentifier,
                        keyExpressionKind,
                        includeUnicodeLine
                    ) => {
                        createSafeValueReferenceReplacementFixMock.mockClear();

                        const keyExpression =
                            keyExpressionKind === "identifier"
                                ? "propertyName"
                                : '"status"';
                        const unicodeLine = includeUnicodeLine
                            ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                            : "";

                        const generatedCode = [
                            `const ${objectIdentifier} = { status: true } as const;`,
                            'const propertyName = "status" as const;',
                            unicodeLine,
                            `const hasStatus = Object.hasOwn(${objectIdentifier}, ${keyExpression});`,
                            "String(hasStatus);",
                        ]
                            .filter((line) => line.length > 0)
                            .join("\n");

                        const { ast, callExpression } =
                            parseObjectHasOwnCallFromCode(generatedCode);
                        const reports: ObjectHasOwnReportDescriptor[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-ts-extras-object-has-own.invalid.ts",
                            report: (
                                descriptor: ObjectHasOwnReportDescriptor
                            ) => {
                                reports.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                            },
                        });

                        listeners.CallExpression?.(callExpression);

                        expect(reports).toHaveLength(1);
                        expect(reports[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTsExtrasObjectHasOwn",
                        });

                        expect(
                            createSafeValueReferenceReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const fixDescriptor =
                            createSafeValueReferenceReplacementFixMock.mock
                                .calls[0]?.[0] as
                                | undefined
                                | {
                                      importedName?: string;
                                      targetNode?: Readonly<{
                                          range?: readonly [number, number];
                                      }>;
                                  };

                        expect(fixDescriptor?.importedName).toBe(
                            "objectHasOwn"
                        );

                        const calleeRange = fixDescriptor?.targetNode?.range;

                        expect(calleeRange).toBeDefined();

                        if (calleeRange === undefined) {
                            throw new Error(
                                "Expected objectHasOwn replacement target range"
                            );
                        }

                        const fixedCode = `${generatedCode.slice(0, calleeRange[0])}objectHasOwn${generatedCode.slice(calleeRange[1])}`;

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrowError();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-ts-extras-object-has-own",
    getPluginRule("prefer-ts-extras-object-has-own"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    { messageId: "preferTsExtrasObjectHasOwn" },
                    { messageId: "preferTsExtrasObjectHasOwn" },
                    { messageId: "preferTsExtrasObjectHasOwn" },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture Object.hasOwn checks",
                output: fixtureFixableThirdPassOutputCode,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferTsExtrasObjectHasOwn" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes Object.hasOwn when objectHasOwn import is in scope",
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
                code: inlineValidComputedObjectHasOwnCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores computed Object.hasOwn member access",
            },
            {
                code: inlineValidReflectHasOwnCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Reflect.has usage",
            },
            {
                code: inlineValidCustomObjectHasOwnCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores non-Object hasOwn helper calls",
            },
            {
                code: inlineValidObjectKeysCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Object member calls that are not hasOwn",
            },
            {
                code: shadowedObjectBindingValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores Object.hasOwn call when Object binding is shadowed",
            },
        ],
    }
);
