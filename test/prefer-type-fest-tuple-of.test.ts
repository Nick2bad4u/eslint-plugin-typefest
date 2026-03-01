import { addTypeFestRuleMetadataAndFilenameFallbackTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-tuple-of.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-tuple-of";
const docsDescription =
    "require TypeFest TupleOf over imported aliases such as ReadonlyTuple and Tuple.";
const preferTupleOfMessage =
    "Prefer `{{replacement}}` from type-fest to model fixed-length homogeneous tuples instead of legacy alias `{{alias}}`.";

const validFixtureName = "prefer-type-fest-tuple-of.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-tuple-of.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-tuple-of.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const createFixtureFixableOutputCode = (sourceText: string): string => {
    const sourceLineEnding = sourceText.includes("\r\n") ? "\r\n" : "\n";
    const importPattern =
        /import\s+type\s*\{\s*ReadonlyTuple\s*\}\s+from\s+"type-aliases";\r?\n/u;
    // The fixer currently emits an LF between the existing import and inserted import,
    // then keeps native source newlines for the rest of the file. Mirror that output here.
    const withTypeFestImport = sourceText.replace(
        importPattern,
        `import type { ReadonlyTuple } from "type-aliases";\nimport type { TupleOf } from "type-fest";${sourceLineEnding}`
    );

    if (withTypeFestImport === sourceText) {
        throw new TypeError(
            "Expected tuple-of fixture to include a replaceable ReadonlyTuple import declaration"
        );
    }

    const withTupleReplacement = withTypeFestImport.replace(
        /type\s+MonitorTuple\s*=\s*ReadonlyTuple<string,\s*3>;/u,
        "type MonitorTuple = Readonly<TupleOf<3, string>>;"
    );

    if (withTupleReplacement === withTypeFestImport) {
        throw new TypeError(
            "Expected tuple-of fixture to include a replaceable ReadonlyTuple type alias"
        );
    }

    return withTupleReplacement;
};

const fixtureFixableOutputCode =
    createFixtureFixableOutputCode(invalidFixtureCode);
const inlineFixableReadonlyTupleInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineFixableReadonlyTupleOutputCode =
    inlineFixableReadonlyTupleInvalidCode.replace(
        "type Values = ReadonlyTuple<string, 3>;",
        "type Values = Readonly<TupleOf<3, string>>;"
    );

const inlineFixableTupleInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Values = Tuple<string, 3>;",
].join("\n");

const inlineFixableTupleOutputCode = inlineFixableTupleInvalidCode.replace(
    "type Values = Tuple<string, 3>;",
    "type Values = TupleOf<3, string>;"
);

const inlineNoFixShadowedTupleOfInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<TupleOf> = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineNoFixTupleAliasShadowedTupleOfInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<TupleOf> = Tuple<string, 3>;",
].join("\n");

const inlineNoFixShadowedReadonlyInvalidCode = [
    'import type { ReadonlyTuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = ReadonlyTuple<string, 3>;",
].join("\n");

const inlineFixTupleWhenReadonlyShadowedInvalidCode = [
    'import type { Tuple } from "type-aliases";',
    'import type { TupleOf } from "type-fest";',
    "",
    "type Box<Readonly> = Tuple<string, 3>;",
].join("\n");

const inlineFixTupleWhenReadonlyShadowedOutputCode =
    inlineFixTupleWhenReadonlyShadowedInvalidCode.replace(
        "type Box<Readonly> = Tuple<string, 3>;",
        "type Box<Readonly> = TupleOf<3, string>;"
    );

type TupleOfReportDescriptor = Readonly<{
    data?: {
        alias?: string;
        replacement?: string;
    };
    fix?: unknown;
    messageId?: string;
}>;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const aliasNameArbitrary = fc.constantFrom("Tuple", "ReadonlyTuple");

const elementTypeTextArbitrary = fc.constantFrom(
    "string",
    "{ readonly id: string }",
    "Promise<number>",
    "readonly string[]"
);

const lengthTypeTextArbitrary = fc.constantFrom(
    "3",
    "Length",
    "1 | 2",
    "number"
);

const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return "";
    }

    const nodeRange = (
        node as Readonly<{
            range?: readonly [number, number];
        }>
    ).range;

    if (nodeRange === undefined) {
        return "";
    }

    return code.slice(nodeRange[0], nodeRange[1]);
};

const parseTupleAliasTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    typeReference: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return {
                ast: parsed.ast,
                typeReference: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a tuple alias reference"
    );
};

addTypeFestRuleMetadataAndFilenameFallbackTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTupleOf: preferTupleOfMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-tuple-of source assertions", () => {
    it("fast-check: Tuple/TupleOf replacement text remains parseable", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeTypeNodeTextReplacementFixMock = vi.fn(
                (..._args: readonly unknown[]) => "FIX"
            );

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            vi.doMock("../src/_internal/imported-type-aliases.js", () => ({
                collectDirectNamedImportsFromSource: () => new Set<string>(),
                collectImportedTypeAliasMatches: () =>
                    new Map([
                        [
                            "Tuple",
                            {
                                importedName: "Tuple",
                                replacementName: "TupleOf<Length, Element>",
                                sourceValue: "type-aliases",
                            },
                        ],
                        [
                            "ReadonlyTuple",
                            {
                                importedName: "ReadonlyTuple",
                                replacementName:
                                    "Readonly<TupleOf<Length, Element>>",
                                sourceValue: "type-aliases",
                            },
                        ],
                    ]),
                createSafeTypeNodeTextReplacementFix:
                    createSafeTypeNodeTextReplacementFixMock,
                isTypeParameterNameShadowed: () => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-tuple-of")) as {
                    default: {
                        create: (context: unknown) => {
                            TSTypeReference?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    aliasNameArbitrary,
                    elementTypeTextArbitrary,
                    lengthTypeTextArbitrary,
                    (aliasName, elementTypeText, lengthTypeText) => {
                        createSafeTypeNodeTextReplacementFixMock.mockClear();

                        const code = [
                            "declare const marker: unique symbol;",
                            `type Candidate = ${aliasName}<${elementTypeText}, ${lengthTypeText}>;`,
                            "void marker;",
                        ].join("\n");

                        const { ast, typeReference } =
                            parseTupleAliasTypeReferenceFromCode(code);
                        const reportCalls: TupleOfReportDescriptor[] = [];

                        const listeners = undecoratedRuleModule.default.create({
                            filename:
                                "fixtures/typed/prefer-type-fest-tuple-of.invalid.ts",
                            report: (descriptor: TupleOfReportDescriptor) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    return getSourceTextForNode({ code, node });
                                },
                            },
                        });

                        listeners.TSTypeReference?.(typeReference);

                        expect(reportCalls).toHaveLength(1);
                        expect(reportCalls[0]).toMatchObject({
                            fix: "FIX",
                            messageId: "preferTupleOf",
                        });
                        expect(
                            createSafeTypeNodeTextReplacementFixMock
                        ).toHaveBeenCalledTimes(1);

                        const replacementText =
                            createSafeTypeNodeTextReplacementFixMock.mock
                                .calls[0]?.[2];

                        expect(typeof replacementText).toBe("string");

                        if (typeof replacementText !== "string") {
                            throw new TypeError(
                                "Expected TupleOf replacement text to be a string"
                            );
                        }

                        const fixedCode = `${code.slice(0, typeReference.range[0])}${replacementText}${code.slice(typeReference.range[1])}`;

                        expect(() => {
                            parser.parseForESLint(fixedCode, parserOptions);
                        }).not.toThrowError();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-type-aliases.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture ReadonlyTuple and Tuple aliases",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableReadonlyTupleInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline ReadonlyTuple alias import",
            output: inlineFixableReadonlyTupleOutputCode,
        },
        {
            code: inlineFixableTupleInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline Tuple alias import",
            output: inlineFixableTupleOutputCode,
        },
        {
            code: inlineNoFixShadowedTupleOfInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyTuple alias when TupleOf identifier is shadowed",
            output: null,
        },
        {
            code: inlineNoFixTupleAliasShadowedTupleOfInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Tuple alias when TupleOf identifier is shadowed",
            output: null,
        },
        {
            code: inlineNoFixShadowedReadonlyInvalidCode,
            errors: [
                {
                    data: {
                        alias: "ReadonlyTuple",
                        replacement: "Readonly<TupleOf<Length, Element>>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports ReadonlyTuple alias when Readonly identifier is shadowed",
            output: null,
        },
        {
            code: inlineFixTupleWhenReadonlyShadowedInvalidCode,
            errors: [
                {
                    data: {
                        alias: "Tuple",
                        replacement: "TupleOf<Length, Element>",
                    },
                    messageId: "preferTupleOf",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Tuple alias even when Readonly identifier is shadowed",
            output: inlineFixTupleWhenReadonlyShadowedOutputCode,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: readTypedFixture(namespaceValidFixtureName),
            filename: typedFixturePath(namespaceValidFixtureName),
            name: "accepts namespace-qualified FixedLengthArray references",
        },
    ],
});
