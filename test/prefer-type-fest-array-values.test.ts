/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-array-values` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
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
const ruleId = "prefer-type-fest-array-values";
const docsDescription =
    "require TypeFest ArrayValues over `typeof values[number]` constant array value extraction.";
const message =
    "Prefer `ArrayValues<T>` from type-fest over `typeof values[number]` constant array value extraction.";

const invalidConstArrayCode = [
    "const statuses = ['queued', 'running'] as const;",
    "type Status = typeof statuses[number];",
].join("\n");
const invalidConstArrayOutput = [
    'import type { ArrayValues } from "type-fest";',
    "const statuses = ['queued', 'running'] as const;",
    "type Status = ArrayValues<typeof statuses>;",
].join("\n");
const invalidReadonlyArrayCode = [
    "declare const statuses: readonly string[];",
    "type Status = typeof statuses[number];",
].join("\n");
const invalidReadonlyArrayOutput = [
    'import type { ArrayValues } from "type-fest";',
    "declare const statuses: readonly string[];",
    "type Status = ArrayValues<typeof statuses>;",
].join("\n");
const shadowedInvalidCode = [
    "const statuses = ['queued', 'running'] as const;",
    "type Wrapper<ArrayValues> = typeof statuses[number];",
].join("\n");
const validArrayElementCode = [
    "type Statuses = readonly ['queued', 'running'];",
    "type Status = Statuses[number];",
].join("\n");
const validNumberIndexedObjectCode = [
    "declare const valuesByIndex: { readonly [index: number]: string };",
    "type Value = typeof valuesByIndex[number];",
].join("\n");
const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const parseArrayValuesTypeReferenceFromCode = (
    sourceText: string
): TSESTree.TSTypeReference => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.id.name === "Value" &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from an ArrayValues type reference"
    );
};

warmTypedParserServices(typedFixturePath(`${ruleId}.valid.ts`));

describe("prefer-type-fest-array-values parse-safety guards", () => {
    it("fast-check: ArrayValues replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.constantFrom(
                    "statuses",
                    "values",
                    "allowedTransitions",
                    "runtimeLabels"
                ),
                fc.boolean(),
                (arrayIdentifier, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { ArrayValues } from "type-fest";',
                        `const ${arrayIdentifier} = ["queued", "running"] as const;`,
                        `type Value = typeof ${arrayIdentifier}[number];`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = generatedCode.replace(
                        `type Value = typeof ${arrayIdentifier}[number];`,
                        `type Value = ArrayValues<typeof ${arrayIdentifier}>;`
                    );

                    const tsReference =
                        parseArrayValuesTypeReferenceFromCode(replacedCode);

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

                    expect(tsReference.typeName.name).toBe("ArrayValues");
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
        preferArrayValues: message,
    },
    name: ruleId,
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidConstArrayCode,
            errors: [{ messageId: "preferArrayValues" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports const array value extraction patterns",
            output: invalidConstArrayOutput,
        },
        {
            code: invalidReadonlyArrayCode,
            errors: [{ messageId: "preferArrayValues" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports readonly array value extraction patterns",
            output: invalidReadonlyArrayOutput,
        },
        {
            code: shadowedInvalidCode,
            errors: [{ messageId: "preferArrayValues" }],
            filename: typedFixturePath(`${ruleId}.invalid.ts`),
            name: "reports but does not autofix when ArrayValues is shadowed",
            output: null,
        },
    ],
    valid: [
        {
            code: 'import type { ArrayValues } from "type-fest"; const statuses = ["queued"] as const; type Status = ArrayValues<typeof statuses>;',
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "accepts existing ArrayValues usage",
        },
        {
            code: validArrayElementCode,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "defers non-typeof array element extraction to ArrayElement",
        },
        {
            code: validNumberIndexedObjectCode,
            filename: typedFixturePath(`${ruleId}.valid.ts`),
            name: "ignores number-indexed object maps",
        },
    ],
});
