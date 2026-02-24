/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-literal-union.test` behavior.
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

const validFixtureName = "prefer-type-fest-literal-union.valid.ts";
const invalidFixtureName = "prefer-type-fest-literal-union.invalid.ts";
const inlineInvalidBigIntLiteralUnionCode = "type SessionNonce = bigint | 1n;";
const inlineInvalidBooleanLiteralUnionCode =
    "type FeatureFlag = true | false | boolean;";
const inlineInvalidNumberLiteralUnionCode =
    "type HttpCode = 200 | 404 | number;";
const inlineInvalidWithoutFixCode =
    "type EnvironmentName = 'dev' | 'prod' | string;";
const inlineInvalidBigIntLiteralUnionOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type SessionNonce = LiteralUnion<1n, bigint>;",
].join("\n");
const inlineInvalidBooleanLiteralUnionOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type FeatureFlag = LiteralUnion<true | false, boolean>;",
].join("\n");
const inlineInvalidNumberLiteralUnionOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type HttpCode = LiteralUnion<200 | 404, number>;",
].join("\n");
const inlineInvalidWithoutFixOutputCode = [
    'import type { LiteralUnion } from "type-fest";',
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const fixtureFixableOutputCode = `import type { LiteralUnion } from "type-fest";\n${invalidFixtureCode.replace(
    '"dev" | "prod" | string',
    'LiteralUnion<"dev" | "prod", string>'
)}`;
const fixtureFixableSecondPassOutputCode = fixtureFixableOutputCode.replace(
    "200 | 404 | number",
    "LiteralUnion<200 | 404, number>"
);
const inlineFixableCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | 'prod' | string;",
].join("\n");
const inlineFixableOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev' | 'prod', string>;",
].join("\n");
const inlineFixableBooleanCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = true | false | boolean;",
].join("\n");
const inlineFixableBooleanOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = LiteralUnion<true | false, boolean>;",
].join("\n");
const inlineFixableNumberCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = 200 | 404 | number;",
].join("\n");
const inlineFixableNumberOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = LiteralUnion<200 | 404, number>;",
].join("\n");
const inlineFixableSingleLiteralStringCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = 'dev' | string;",
].join("\n");
const inlineFixableSingleLiteralStringOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type EnvironmentName = LiteralUnion<'dev', string>;",
].join("\n");
const inlineFixableBigIntCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type SessionNonce = bigint | 1n;",
].join("\n");
const inlineFixableBigIntOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type SessionNonce = LiteralUnion<1n, bigint>;",
].join("\n");
const inlineFixableSingleLiteralBooleanCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = true | boolean;",
].join("\n");
const inlineFixableSingleLiteralBooleanOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type FeatureFlag = LiteralUnion<true, boolean>;",
].join("\n");
const inlineFixableSingleLiteralNumberCode = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = 200 | number;",
].join("\n");
const inlineFixableSingleLiteralNumberOutput = [
    'import type { LiteralUnion } from "type-fest";',
    "",
    "type HttpCode = LiteralUnion<200, number>;",
].join("\n");
const mixedFamilyUnionValidCode =
    "type EnvironmentName = 'dev' | number | string;";
const literalOnlyUnionValidCode = "type EnvironmentName = 'dev' | 'prod';";
const literalOnlyBooleanUnionValidCode = "type FeatureFlag = true | false;";
const literalOnlyBigIntUnionValidCode = "type SessionNonce = 1n | 2n;";
const mixedLiteralFamiliesValidCode = "type Marker = true | 'dev' | string;";
const keywordOnlyStringUnionValidCode =
    "type EnvironmentName = string | string;";
const keywordOnlyNumberUnionValidCode = "type HttpCode = number | number;";
const keywordOnlyBooleanUnionValidCode =
    "type FeatureFlag = boolean | boolean;";
const keywordOnlyBigIntUnionValidCode = "type SessionNonce = bigint | bigint;";
const literalAndTypeReferenceUnionValidCode =
    "type EnvironmentName = 'dev' | CustomAlias | string;";
const mismatchedBigIntLiteralFamilyValidCode =
    "type SessionNonce = bigint | 1 | 2;";
const templateLiteralAndStringKeywordValidCode =
    "type EnvironmentName = `dev` | string;";

addTypeFestRuleMetadataAndFilenameFallbackTests(
    "prefer-type-fest-literal-union",
    {
        defaultOptions: [],
        docsDescription:
            "require TypeFest LiteralUnion over unions that combine primitive keywords with same-family literal members.",
        enforceRuleShape: true,
        messages: {
            preferLiteralUnion:
                "Prefer `LiteralUnion<...>` from type-fest over unions that mix primitive keywords and same-family literal members.",
        },
        name: "prefer-type-fest-literal-union",
    }
);

describe("prefer-type-fest-literal-union source assertions", () => {
    it("keeps critical literal-union guard expressions in source", () => {
        const ruleSource = readFileSync(
            path.resolve(
                process.cwd(),
                "src/rules/prefer-type-fest-literal-union.ts"
            ),
            "utf8"
        );

        const matchCount = (pattern: Readonly<RegExp>): number =>
            [...ruleSource.matchAll(pattern)].length;

        expect(ruleSource).toContain(
            'if (typeof node.literal.value === "bigint")'
        );
        expect(ruleSource).toContain(
            'return typeof literalWithPotentialBigInt.bigint === "string";'
        );
        expect(ruleSource).toContain("if (!hasLiteralUnionShape(node)) {");
        expect(ruleSource).toContain("if (literalMembers.length === 0) {");
        expect(ruleSource).toContain("literalMembers.length === 1");

        expect(matchCount(/let hasKeywordMember = false;/gv)).toBe(2);
        expect(matchCount(/let hasLiteralMember = false;/gv)).toBe(2);
        expect(
            matchCount(
                /if \(isLiteralMemberForFamily\(unionMember, family\)\)/gv
            )
        ).toBe(2);
        expect(matchCount(/allMembersAreFamilyMembers = false;/gv)).toBe(2);

        expect(
            matchCount(
                /allMembersAreFamilyMembers\s*&&\s*hasKeywordMember\s*&&\s*hasLiteralMember/gv
            )
        ).toBe(2);
    });

    it("tSUnionType visitor handles bigint-literal variants and rejects cross-family unions", async () => {
        const code = [
            "type BigIntValue = bigint | 1n;",
            "type BigIntText = bigint | 2n;",
            'type BooleanAndString = boolean | "dev";',
            'type NumberAndString = number | "dev";',
        ].join("\n");

        try {
            vi.resetModules();

            vi.doMock("../src/_internal/typed-rule.js", () => ({
                createTypedRule: (definition: unknown): unknown => definition,
                isTestFilePath: (): boolean => false,
            }));

            const undecoratedRuleModule =
                (await import("../src/rules/prefer-type-fest-literal-union")) as {
                    default: {
                        create: (context: unknown) => {
                            TSUnionType?: (node: unknown) => void;
                        };
                    };
                };

            const parsed = parser.parseForESLint(code, {
                ecmaVersion: "latest",
                loc: true,
                range: true,
                sourceType: "module",
            });

            const unionByAliasName = new Map<string, unknown>();

            for (const statement of parsed.ast.body) {
                if (
                    statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
                    statement.typeAnnotation.type === AST_NODE_TYPES.TSUnionType
                ) {
                    unionByAliasName.set(
                        statement.id.name,
                        statement.typeAnnotation
                    );
                }
            }

            const getRequiredUnion = (aliasName: string): unknown => {
                const unionNode = unionByAliasName.get(aliasName);

                if (unionNode === undefined) {
                    throw new Error(`Expected union type alias '${aliasName}'`);
                }

                return unionNode;
            };

            const bigIntValueUnion = getRequiredUnion("BigIntValue") as {
                types: unknown[];
            };
            const bigIntTextUnion = getRequiredUnion("BigIntText") as {
                types: unknown[];
            };
            const booleanAndStringUnion = getRequiredUnion("BooleanAndString");
            const numberAndStringUnion = getRequiredUnion("NumberAndString");

            const secondBigIntValueMember = bigIntValueUnion.types[1] as {
                literal?: { bigint?: unknown };
                type?: string;
            };
            if (
                secondBigIntValueMember.type === "TSLiteralType" &&
                secondBigIntValueMember.literal
            ) {
                Reflect.deleteProperty(
                    secondBigIntValueMember.literal,
                    "bigint"
                );
                secondBigIntValueMember.literal.bigint = undefined;
            }

            const secondBigIntTextMember = bigIntTextUnion.types[1] as {
                literal?: { bigint?: unknown; value?: unknown };
                type?: string;
            };
            if (
                secondBigIntTextMember.type === "TSLiteralType" &&
                secondBigIntTextMember.literal
            ) {
                secondBigIntTextMember.literal.value = null;
                secondBigIntTextMember.literal.bigint = "2";
            }

            const sourceCode = {
                ast: parsed.ast,
                getText(node: unknown): string {
                    if (
                        typeof node !== "object" ||
                        node === null ||
                        !("range" in node)
                    ) {
                        return "";
                    }

                    const nodeRange = (
                        node as { range?: readonly [number, number] }
                    ).range;

                    if (!nodeRange) {
                        return "";
                    }

                    const [start, end] = nodeRange;
                    return code.slice(start, end);
                },
            };

            const report = vi.fn();

            const listenerMap = undecoratedRuleModule.default.create({
                filename:
                    "fixtures/typed/prefer-type-fest-literal-union.invalid.ts",
                report,
                sourceCode,
            });

            listenerMap.TSUnionType?.(bigIntValueUnion);
            listenerMap.TSUnionType?.(bigIntTextUnion);
            listenerMap.TSUnionType?.(booleanAndStringUnion);
            listenerMap.TSUnionType?.(numberAndStringUnion);

            expect(report).toHaveBeenCalledTimes(2);

            const reportedNodes = report.mock.calls
                .map((call) => call[0] as { node?: unknown })
                .map((descriptor) => descriptor.node);

            expect(reportedNodes).toContain(bigIntValueUnion);
            expect(reportedNodes).toContain(bigIntTextUnion);
            expect(reportedNodes).not.toContain(booleanAndStringUnion);
            expect(reportedNodes).not.toContain(numberAndStringUnion);
        } finally {
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

ruleTester.run(
    "prefer-type-fest-literal-union",
    getPluginRule("prefer-type-fest-literal-union"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        messageId: "preferLiteralUnion",
                    },
                    {
                        messageId: "preferLiteralUnion",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture literal plus base type unions",
                output: [
                    fixtureFixableOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineInvalidBigIntLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports bigint base plus bigint literal union",
                output: inlineInvalidBigIntLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidBooleanLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports boolean base plus boolean literal union",
                output: inlineInvalidBooleanLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidNumberLiteralUnionCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports number base plus numeric literal union",
                output: inlineInvalidNumberLiteralUnionOutputCode,
            },
            {
                code: inlineInvalidWithoutFixCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports primitive+literal union without fix when LiteralUnion import is missing",
                output: inlineInvalidWithoutFixOutputCode,
            },
            {
                code: inlineFixableCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes primitive+literal union when LiteralUnion import is in scope",
                output: inlineFixableOutput,
            },
            {
                code: inlineFixableBooleanCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes boolean literal unions when LiteralUnion import is in scope",
                output: inlineFixableBooleanOutput,
            },
            {
                code: inlineFixableNumberCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes number literal unions when LiteralUnion import is in scope",
                output: inlineFixableNumberOutput,
            },
            {
                code: inlineFixableSingleLiteralStringCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal string unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralStringOutput,
            },
            {
                code: inlineFixableBigIntCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes bigint literal unions when LiteralUnion import is in scope",
                output: inlineFixableBigIntOutput,
            },
            {
                code: inlineFixableSingleLiteralBooleanCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal boolean unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralBooleanOutput,
            },
            {
                code: inlineFixableSingleLiteralNumberCode,
                errors: [{ messageId: "preferLiteralUnion" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "autofixes single-literal number unions when LiteralUnion import is in scope",
                output: inlineFixableSingleLiteralNumberOutput,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: mixedFamilyUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that mix multiple primitive families",
            },
            {
                code: literalOnlyUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that contain only literal members",
            },
            {
                code: literalOnlyBooleanUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only boolean literal members",
            },
            {
                code: literalOnlyBigIntUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only bigint literal members",
            },
            {
                code: mixedLiteralFamiliesValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include literals from different families",
            },
            {
                code: keywordOnlyStringUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only string keyword members",
            },
            {
                code: keywordOnlyNumberUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only number keyword members",
            },
            {
                code: keywordOnlyBooleanUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only boolean keyword members",
            },
            {
                code: keywordOnlyBigIntUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions with only bigint keyword members",
            },
            {
                code: literalAndTypeReferenceUnionValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include non-literal type references",
            },
            {
                code: mismatchedBigIntLiteralFamilyValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores bigint unions with numeric (non-bigint) literals",
            },
            {
                code: templateLiteralAndStringKeywordValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores unions that include template literal types",
            },
        ],
    }
);
