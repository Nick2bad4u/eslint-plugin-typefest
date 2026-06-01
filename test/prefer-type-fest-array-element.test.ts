import parser from "@typescript-eslint/parser";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-array-element` behavior.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    typedFixturePath,
    warmTypedParserServices,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-array-element";
const docsDescription =
    "require TypeFest ArrayElement over array and tuple `T[number]` element extraction.";
const message =
    "Prefer `ArrayElement<T>` from type-fest over array and tuple `T[number]` element extraction.";

const invalidTupleCode = [
    "type EventSteps = readonly ['queued', 'running'];",
    "type Step = EventSteps[number];",
].join("\n");
const invalidTupleOutput = [
    'import type { ArrayElement } from "type-fest";',
    "type EventSteps = readonly ['queued', 'running'];",
    "type Step = ArrayElement<EventSteps>;",
].join("\n");
const invalidPropertyCode = [
    "interface User {",
    "    readonly items: readonly string[];",
    "}",
    "type Item = User['items'][number];",
].join("\n");
const invalidPropertyOutput = [
    'import type { ArrayElement } from "type-fest";',
    "interface User {",
    "    readonly items: readonly string[];",
    "}",
    "type Item = ArrayElement<User['items']>;",
].join("\n");
const shadowedInvalidCode =
    "type Wrapper<ArrayElement> = readonly [1, 2][number];";
const validArrayValuesCode = [
    "const statuses = ['queued', 'running'] as const;",
    "type Status = typeof statuses[number];",
].join("\n");
const validNumberIndexedObjectCode = [
    "interface NumberMap {",
    "    [key: number]: string;",
    "}",
    "type Value = NumberMap[number];",
].join("\n");
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseArrayElementTypeReferenceFromCode = (
    sourceText: string
): TSESTree.TSTypeReference => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "Element" &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from an ArrayElement type reference"
    );
};

warmTypedParserServices(typedFixturePath(`${ruleId}.valid.ts`));

describe("prefer-type-fest-array-element parse-safety guards", () => {
    it("fast-check: ArrayElement replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "readonly [1, 2, 3]",
                    "string[]",
                    'readonly ["queued", "running", ...string[]]'
                ),
                fc.boolean(),
                (arrayType, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { ArrayElement } from "type-fest";',
                        `type Element = ${arrayType}[number];`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type Element = ${arrayType}[number];`,
                        `type Element = ArrayElement<${arrayType}>;`
                    );

                    const tsReference =
                        parseArrayElementTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type !== AST_NODE_TYPES.Identifier
                    ) {
                        throw new Error(
                            "Expected conditional test precondition to hold."
                        );
                    }

                    expect(tsReference.typeName.name).toBe("ArrayElement");
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferArrayElement: message,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidTupleCode,
            errors: [{ messageId: "preferArrayElement" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports tuple element indexed-access patterns",
            output: invalidTupleOutput,
        },
        {
            code: invalidPropertyCode,
            errors: [{ messageId: "preferArrayElement" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports nested indexed-access patterns that resolve to arrays",
            output: invalidPropertyOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferArrayElement" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports but does not autofix when ArrayElement is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { ArrayElement } from "type-fest"; type Element = ArrayElement<string[]>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing ArrayElement usage",
        },
        {
            code: validArrayValuesCode,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "defers typeof tuple value extraction to ArrayValues",
        },
        {
            code: validNumberIndexedObjectCode,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores number-indexed object maps",
        },
    ],
});
